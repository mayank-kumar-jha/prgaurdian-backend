require('dotenv').config();
const { Worker } = require('bullmq');
const IORedis = require('ioredis');
const { connection } = require('./queue');
const { getInstallationOctokit } = require('./indexRepo');
const { getPRFiles } = require('./getDiff');
const { reviewFile } = require('./reviewer');
const { postReview } = require('./postReview');
const connectDB = require('./db');
const Repo = require('./models/Repo');
const Review = require('./models/Review');

connectDB();

// --- Redis pub/sub publisher (separate connection to avoid BullMQ conflicts) ---
const pubClient = new IORedis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
});

function emitEvent(eventName, payload) {
    const message = JSON.stringify({ event: eventName, data: payload });
    pubClient.publish('pr-guardian:events', message).catch(err =>
        console.error('[worker] Redis publish error:', err.message)
    );
}

const worker = new Worker(
    'pr-review',
    async (job) => {
        const {
            installationId,
            repoOwner,
            repoName,
            repoFullName,
            repoId,
            prNumber,
            prTitle,
            githubPrUrl,
            headSha,
        } = job.data;

        console.log(`[worker] Reviewing PR #${prNumber} in ${repoOwner}/${repoName}`);

        // --- Emit: review started ---
        emitEvent('review:started', {
            repoOwner,
            repoName,
            prNumber,
            prTitle: prTitle || `PR #${prNumber}`,
            githubPrUrl,
        });

        // --- Look up repo settings ---
        const finalRepoName = repoFullName || `${repoOwner}/${repoName}`;
        let finalRepoId = repoId;
        let repoSettings = null;

        try {
            let repoDoc = finalRepoId
                ? await Repo.findById(finalRepoId)
                : await Repo.findOne({ name: finalRepoName });

            if (repoDoc) {
                finalRepoId = repoDoc._id;
                repoSettings = {
                    strictness: repoDoc.strictness || 'balanced',
                    customRules: repoDoc.customRules || '',
                    autoApproveTrivial: repoDoc.autoApproveTrivial || false,
                };
            }
        } catch (err) {
            console.error('[worker] Error fetching repo settings:', err.message);
        }

        // --- Fetch PR files ---
        const octokit = await getInstallationOctokit(installationId);
        const files = await getPRFiles(octokit, repoOwner, repoName, prNumber);

        const patchableFiles = files.filter(f => !!f.patch);
        let allComments = [];
        let worstVerdict = 'approve';
        let allSummaries = [];
        let totalTokensUsed = 0;
        let totalCostEstimate = 0;

        const severity = { approve: 0, comment: 1, request_changes: 2 };

        for (let i = 0; i < patchableFiles.length; i++) {
            const file = patchableFiles[i];

            // --- Emit: progress ---
            emitEvent('review:progress', {
                repoOwner,
                repoName,
                prNumber,
                currentFile: file.filename,
                fileIndex: i + 1,
                totalFiles: patchableFiles.length,
                message: `Analyzing file ${i + 1} of ${patchableFiles.length}: ${file.filename}`,
            });

            const result = await reviewFile(file.filename, file.patch, repoSettings);

            if (result.summary) {
                allSummaries.push(`**${file.filename}**: ${result.summary}`);
            }

            totalTokensUsed += result.tokensUsed || 0;
            totalCostEstimate += result.costEstimate || 0;

            for (const c of result.comments) {
                allComments.push({
                    path: file.filename,
                    line: c.line,
                    side: 'RIGHT',
                    body: c.message,
                    // extra metadata stored separately (GitHub API doesn't accept these)
                    _category: c.category,
                    _severity: c.severity,
                });
            }

            if (severity[result.verdict] > severity[worstVerdict]) {
                worstVerdict = result.verdict;
            }
        }

        // --- Build combined summary ---
        const overallSummary = allSummaries.length > 0
            ? `**PR Guardian Review Summary**\n\n${allSummaries.join('\n\n')}`
            : `PR Guardian reviewed ${patchableFiles.length} file(s). Verdict: ${worstVerdict}.`;

        // --- Strip internal metadata before sending to GitHub ---
        const githubComments = allComments.map(({ path, line, side, body }) => ({
            path, line, side, body,
        }));

        await postReview(octokit, repoOwner, repoName, prNumber, headSha, githubComments, worstVerdict, overallSummary);
        console.log(`[worker] Posted review on PR #${prNumber}: ${worstVerdict}`);

        // --- Emit: review completed ---
        emitEvent('review:completed', {
            repoOwner,
            repoName,
            prNumber,
            prTitle: prTitle || `PR #${prNumber}`,
            verdict: worstVerdict,
            tokensUsed: totalTokensUsed,
            costEstimate: parseFloat(totalCostEstimate.toFixed(8)),
        });

        // --- Persist Review to DB ---
        try {
            const dbComments = allComments.map(c => ({
                file: c.path,
                line: c.line,
                body: c.body,
                category: c._category,
                severity: c._severity,
            }));

            if (finalRepoId) {
                const newReview = new Review({
                    repoId: finalRepoId,
                    repo: finalRepoName,
                    prNumber,
                    prTitle: prTitle || `PR #${prNumber}`,
                    verdict: worstVerdict,
                    githubPrUrl: githubPrUrl || `https://github.com/${finalRepoName}/pull/${prNumber}`,
                    summary: overallSummary,
                    tokensUsed: totalTokensUsed,
                    costEstimate: parseFloat(totalCostEstimate.toFixed(8)),
                    comments: dbComments,
                });
                await newReview.save();

                // Update Repo stats
                await Repo.findByIdAndUpdate(finalRepoId, {
                    $inc: { totalReviews: 1 },
                    $set: { lastReviewed: Date.now() },
                });
                console.log(`[worker] Saved review to DB for PR #${prNumber}`);
            } else {
                console.warn(`[worker] Could not find Repo for ${finalRepoName} — review not saved to DB.`);
            }
        } catch (dbErr) {
            console.error('[worker] Error saving review to DB:', dbErr);
        }
    },
    { connection }
);

worker.on('completed', (job) => console.log(`[worker] Job ${job.id} completed.`));
worker.on('failed', (job, err) => console.error(`[worker] Job ${job.id} failed:`, err.message));