require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { retrieveRelevantContext } = require('./retrieve');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const reasoningModel = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
        responseMimeType: 'application/json',
    },
});

// --- Cost constant (approximate, adjust as needed) ---
// gemini-2.5-flash: ~$0.075 per 1M input tokens, ~$0.30 per 1M output tokens
// Using a blended estimate of ~$0.15 per 1M tokens = $0.00000015 per token
const COST_PER_TOKEN = 0.00000015;

// --- Multi-language detection ---
const LANGUAGE_HINTS = {
    py:   'Check for PEP 8 style issues, missing type hints, and improper exception handling.',
    js:   'Check for unhandled promise rejections, missing error boundaries, and use of var instead of const/let.',
    ts:   'Check for missing type annotations, improper use of `any`, and unhandled promise rejections.',
    tsx:  'Check for missing React key props, unhandled promise rejections, and improper component state mutations.',
    jsx:  'Check for missing React key props and improper component state mutations.',
    java: 'Check for unchecked exceptions, resource leaks (streams not closed), and missing null checks.',
    go:   'Check for unhandled errors, goroutine leaks, and improper use of defer.',
    rb:   'Check for missing error handling, N+1 query patterns, and unsafe string interpolation.',
    rs:   'Check for improper use of unwrap() without error handling and potential panics.',
    cs:   'Check for improper async/await usage, missing using-statements for disposable resources, and null reference risks.',
    php:  'Check for SQL injection risks, missing input validation, and improper error suppression with @.',
    swift:'Check for optional force-unwrapping (!), retain cycles in closures, and missing error handling.',
    kt:   'Check for improper null safety handling and blocking coroutine calls.',
    cpp:  'Check for memory leaks, use-after-free, and buffer overflows.',
    c:    'Check for buffer overflows, use-after-free, and missing null pointer checks.',
    sh:   'Check for unquoted variables, missing error checks (set -e), and improper use of eval.',
    yml:  'Check for improper indentation, hardcoded secrets, and missing required fields.',
    yaml: 'Check for improper indentation, hardcoded secrets, and missing required fields.',
    json: 'Check for trailing commas, hardcoded credentials, and overly permissive values.',
    sql:  'Check for SQL injection risks, missing WHERE clauses on UPDATE/DELETE, and inefficient queries.',
    tf:   'Check for hardcoded credentials, overly permissive IAM policies, and missing resource tags.',
};

function getLanguageHint(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    return LANGUAGE_HINTS[ext] || 'Review for general correctness, security, performance, and maintainability.';
}

// --- Exponential backoff retry ---
const RETRYABLE_MESSAGES = ['rate limit', 'quota', 'timeout', '429', '503', 'resource exhausted'];

function isRetryableError(err) {
    const msg = (err?.message || '').toLowerCase();
    return RETRYABLE_MESSAGES.some(keyword => msg.includes(keyword));
}

async function withRetry(fn, maxAttempts = 3, baseDelayMs = 1000) {
    let lastErr;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (err) {
            if (!isRetryableError(err) || attempt === maxAttempts) {
                throw err;
            }
            lastErr = err;
            const delay = baseDelayMs * Math.pow(2, attempt - 1);
            console.warn(`[reviewer] Retryable error on attempt ${attempt}/${maxAttempts}: ${err.message}. Retrying in ${delay}ms…`);
            await new Promise(r => setTimeout(r, delay));
        }
    }
    throw lastErr;
}

// --- Strictness guardrail text ---
function getStrictnessGuardrail(strictness) {
    switch (strictness) {
        case 'strict':
            return 'Apply a rigorous standard. Flag style issues, missing tests, and unclear naming. Use "request_changes" freely for quality concerns.';
        case 'lenient':
            return 'Apply a lenient standard. Only flag critical bugs or security issues. Use "comment" for minor concerns, never "request_changes" unless clearly broken.';
        case 'balanced':
        default:
            return 'If unsure, use "comment", never "request_changes" when uncertain.';
    }
}

/**
 * Review a single file's diff.
 * @param {string} filename
 * @param {string} patch
 * @param {object|null} repoSettings  — { strictness, customRules, autoApproveTrivial }
 * @returns {{ verdict, comments, summary, tokensUsed, costEstimate }}
 */
async function reviewFile(filename, patch, repoSettings = null) {
    const relatedContext = await retrieveRelevantContext(patch, 3);
    const languageHint = getLanguageHint(filename);
    const strictness = repoSettings?.strictness || 'balanced';
    const customRules = repoSettings?.customRules || '';
    const guardrail = getStrictnessGuardrail(strictness);

    const customRulesSection = customRules.trim()
        ? `\nREPO-SPECIFIC RULES (must follow):\n${customRules.trim()}\n`
        : '';

    const prompt = `
You are a senior code reviewer. Review this code change.

FILE: ${filename}
LANGUAGE HINT: ${languageHint}

DIFF (lines starting with + are added, - are removed):
${patch}

RELATED CODE FROM THE REST OF THE REPO (for context):
${relatedContext.join('\n---\n')}
${customRulesSection}
Respond ONLY with valid JSON in this exact shape, nothing else:
{
  "verdict": "approve" | "comment" | "request_changes",
  "summary": "<1-2 sentence plain-English description of what this change does and why it matters>",
  "comments": [
    {
      "line": <number>,
      "message": "<specific, actionable feedback>",
      "category": "security" | "bug" | "performance" | "style" | "test-coverage",
      "severity": "low" | "medium" | "high"
    }
  ]
}

Rules:
- "line" must be a line number that appears in the diff above (only lines starting with +).
- If the change looks fine, use "approve" and an empty comments array.
- Only use "request_changes" for genuine bugs, security issues, or broken logic — not style preferences.
- ${guardrail}
- Always populate "summary" with a concise description even if approving.
- Every comment must include "category" and "severity".
- High severity: security vulnerabilities, data loss bugs, crashes.
- Medium severity: logic errors, missing error handling, broken tests.
- Low severity: style, naming, minor performance hints.
`;

    let result;
    try {
        result = await withRetry(() => reasoningModel.generateContent(prompt));
    } catch (err) {
        console.error('[reviewer] All retry attempts failed:', err.message);
        return { verdict: 'comment', summary: '', comments: [], tokensUsed: 0, costEstimate: 0 };
    }

    const responseText = result.response.text();
    const usageMeta = result.response.usageMetadata || {};
    const tokensUsed = (usageMeta.promptTokenCount || 0) + (usageMeta.candidatesTokenCount || 0);
    const costEstimate = parseFloat((tokensUsed * COST_PER_TOKEN).toFixed(8));

    try {
        const parsed = JSON.parse(responseText);
        return {
            verdict: parsed.verdict || 'comment',
            summary: parsed.summary || '',
            comments: Array.isArray(parsed.comments) ? parsed.comments : [],
            tokensUsed,
            costEstimate,
        };
    } catch (err) {
        console.error('[reviewer] Failed to parse Gemini JSON:', responseText);
        return { verdict: 'comment', summary: '', comments: [], tokensUsed, costEstimate };
    }
}

module.exports = { reviewFile };