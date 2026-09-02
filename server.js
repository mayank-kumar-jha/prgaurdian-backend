require('dotenv').config();
const http = require('http');
const cors = require('cors');
const express = require('express');
const crypto = require('crypto');
const { Server: SocketIOServer } = require('socket.io');
const IORedis = require('ioredis');
const connectDB = require('./db');
const Repo = require('./models/Repo');
const Review = require('./models/Review');
const Override = require('./models/Override');
const GlobalSettings = require('./models/GlobalSettings');
const { prReviewQueue } = require('./queue');
const { getAppOctokit, getInstallationOctokit } = require('./indexRepo');

connectDB();

const app = express();
const httpServer = http.createServer(app);

// ── CORS ──────────────────────────────────────────────────────────────────────
const CORS_ORIGIN = ['http://localhost:3001', 'https://pr-guardian-dashboard.vercel.app'];
if (process.env.FRONTEND_ORIGIN && !CORS_ORIGIN.includes(process.env.FRONTEND_ORIGIN)) {
    CORS_ORIGIN.push(process.env.FRONTEND_ORIGIN);
}

app.use(cors({
    origin: CORS_ORIGIN,
    credentials: true,
}));

// ── Socket.IO ─────────────────────────────────────────────────────────────────
const io = new SocketIOServer(httpServer, {
    cors: {
        origin: CORS_ORIGIN,
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

io.on('connection', (socket) => {
    console.log(`[socket.io] Client connected: ${socket.id}`);
    socket.on('disconnect', () => console.log(`[socket.io] Client disconnected: ${socket.id}`));
});

// Subscribe to Redis pub/sub channel and relay events to Socket.IO clients
const subClient = new IORedis(process.env.REDIS_URL, { maxRetriesPerRequest: null });
subClient.subscribe('pr-guardian:events', (err) => {
    if (err) console.error('[redis-sub] Failed to subscribe:', err.message);
    else console.log('[redis-sub] Subscribed to pr-guardian:events');
});
subClient.on('message', (_channel, message) => {
    try {
        const { event, data } = JSON.parse(message);
        io.emit(event, data);
    } catch (e) {
        console.error('[redis-sub] Failed to parse message:', e.message);
    }
});

// ── Signature verification ─────────────────────────────────────────────────────
const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET;
function isValidSignature(rawBody, signatureFromGitHub) {
    const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
    hmac.update(rawBody);
    const computedSignature = 'sha256=' + hmac.digest('hex');
    const a = Buffer.from(computedSignature);
    const b = Buffer.from(signatureFromGitHub);
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
}

// ── Body parsing (preserves rawBody for HMAC) ─────────────────────────────────
app.use(express.json({
    verify: (req, _res, buf) => { req.rawBody = buf; },
}));

// ── Idempotency ───────────────────────────────────────────────────────────────
const processedDeliveries = new Set();

// ── Webhook Handler ───────────────────────────────────────────────────────────
async function handleWebhook(req, res) {
    const eventType  = req.headers['x-github-event'];
    const deliveryId = req.headers['x-github-delivery'];
    const signature  = req.headers['x-hub-signature-256'];

    if (!isValidSignature(req.rawBody, signature)) {
        console.log('[webhook] Signature check FAILED — rejecting request.');
        return res.status(401).send('Invalid signature');
    }
    console.log('[webhook] Signature check PASSED.');

    if (processedDeliveries.has(deliveryId)) {
        console.log(`[webhook] Duplicate delivery ${deliveryId} — skipping.`);
        return res.status(200).send('Already processed');
    }
    processedDeliveries.add(deliveryId);

    // ── installation_repositories events — auto sync repos ─────────────────────
    if (eventType === 'installation_repositories') {
        const { repositories_added, repositories_removed, installation } = req.body;
        const owner = installation?.account?.login || 'unknown';

        if (Array.isArray(repositories_added)) {
            for (const repo of repositories_added) {
                const repoOwner = repo.full_name?.split('/')[0] || owner;
                await Repo.findOneAndUpdate(
                    { name: repo.full_name },
                    {
                        $set: { name: repo.full_name, owner: repoOwner, active: true },
                        $setOnInsert: { strictness: 'balanced', autoApproveTrivial: false, customRules: '' }
                    },
                    { upsert: true, new: true, setDefaultsOnInsert: true }
                );
                console.log(`[webhook] Added repository: ${repo.full_name}`);
            }
        }

        if (Array.isArray(repositories_removed)) {
            for (const repo of repositories_removed) {
                await Repo.findOneAndUpdate(
                    { name: repo.full_name },
                    { $set: { active: false } }
                );
                console.log(`[webhook] Deactivated repository: ${repo.full_name}`);
            }
        }

        return res.status(200).send('Installation repositories updated');
    }

    // ── pull_request events ───────────────────────────────────────────────────
    if (eventType === 'pull_request') {
        const relevantActions = ['opened', 'synchronize', 'reopened'];
        if (!relevantActions.includes(req.body.action)) {
            console.log(`[webhook] Ignoring pull_request action "${req.body.action}".`);
            return res.status(200).send('Action ignored');
        }

        const owner        = req.body.repository?.owner?.login;
        const name         = req.body.repository?.name;
        const repoFullName = `${owner}/${name}`;

        try {
            await Repo.findOneAndUpdate(
                { name: repoFullName },
                { $setOnInsert: { name: repoFullName, owner } },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
        } catch (err) {
            console.error('[webhook] Error upserting repo:', err);
        }

        const jobData = {
            deliveryId,
            action: req.body.action,
            installationId: req.body.installation?.id,
            repoOwner: owner,
            repoName: name,
            repoFullName,
            prNumber:   req.body.pull_request?.number,
            prTitle:    req.body.pull_request?.title,
            githubPrUrl: req.body.pull_request?.html_url,
            headSha:    req.body.pull_request?.head?.sha,
        };

        await prReviewQueue.add('review-pr', jobData);
        console.log('[webhook] Job added to queue:', jobData.deliveryId);
        return res.status(200).send('Webhook received');
    }

    // ── pull_request_review events — human override tracking ─────────────────
    if (eventType === 'pull_request_review') {
        const action         = req.body.action;         // 'submitted'
        const reviewState    = req.body.review?.state;  // 'approved' | 'changes_requested' | 'commented'
        const prNumber       = req.body.pull_request?.number;
        const repoOwner      = req.body.repository?.owner?.login;
        const repoName       = req.body.repository?.name;
        const reviewerLogin  = req.body.review?.user?.login;

        // Only process submitted reviews from humans (ignore our own bot)
        const BOT_LOGIN = process.env.GITHUB_BOT_LOGIN || '';
        if (action !== 'submitted' || reviewerLogin === BOT_LOGIN) {
            return res.status(200).send('Event ignored');
        }

        // Map GitHub state to our verdict enum
        const stateMap = {
            approved:           'approve',
            changes_requested:  'request_changes',
            commented:          'comment',
        };
        const humanVerdict = stateMap[reviewState];
        if (!humanVerdict) return res.status(200).send('Unknown review state');

        try {
            // Find the most recent AI review for this PR
            const repoFullName = `${repoOwner}/${repoName}`;
            const aiReview = await Review.findOne({ repo: repoFullName, prNumber }).sort({ reviewedAt: -1 });
            if (aiReview) {
                const agreedWithAI = aiReview.verdict === humanVerdict;
                await Override.create({
                    reviewId: aiReview._id,
                    humanVerdict,
                    agreedWithAI,
                });
                console.log(`[webhook] Recorded override for PR #${prNumber}: human=${humanVerdict}, AI=${aiReview.verdict}, agreed=${agreedWithAI}`);
            } else {
                console.log(`[webhook] No AI review found for ${repoFullName}#${prNumber}, skipping override.`);
            }
        } catch (err) {
            console.error('[webhook] Error recording override:', err.message);
        }

        return res.status(200).send('Override recorded');
    }

    // All other events
    console.log(`[webhook] Ignoring event type "${eventType}".`);
    return res.status(200).send('Event ignored');
}

app.post('/webhook', handleWebhook);
app.post('/api/webhook', handleWebhook);

// ── API Routes ────────────────────────────────────────────────────────────────

// POST /api/repos/sync (manual sync of all repos accessible to GitHub App installations)
app.post('/api/repos/sync', async (req, res) => {
    try {
        const appOctokit = await getAppOctokit();
        const { data: installations } = await appOctokit.apps.listInstallations();

        let totalSynced = 0;
        for (const installation of installations) {
            const installationOctokit = await getInstallationOctokit(installation.id);
            const { data } = await installationOctokit.apps.listReposAccessibleToInstallation();

            for (const repo of data.repositories) {
                await Repo.findOneAndUpdate(
                    { name: repo.full_name },
                    {
                        $set: {
                            name: repo.full_name,
                            owner: repo.owner.login,
                            active: true,
                        },
                        $setOnInsert: {
                            strictness: 'balanced',
                            autoApproveTrivial: false,
                            customRules: '',
                        },
                    },
                    { upsert: true, new: true, setDefaultsOnInsert: true }
                );
                totalSynced++;
            }
        }
        return res.json({ success: true, message: `Synced ${totalSynced} repositories from GitHub!` });
    } catch (err) {
        console.error('Error syncing repos:', err);
        return res.status(500).json({ error: 'Failed to sync repositories from GitHub: ' + err.message });
    }
});

// GET /api/stats
app.get('/api/stats', async (req, res) => {
    try {
        const totalRepos   = await Repo.countDocuments();
        const totalReviews = await Review.countDocuments();

        // Accuracy from Override records
        const totalOverrides = await Override.countDocuments();
        const agreedOverrides = await Override.countDocuments({ agreedWithAI: true });
        const accuracyRate = totalOverrides > 0
            ? parseFloat(((agreedOverrides / totalOverrides) * 100).toFixed(1))
            : null; // null means "not enough data yet"

        // Token/cost aggregates
        const costAgg = await Review.aggregate([
            { $group: { _id: null, totalTokens: { $sum: '$tokensUsed' }, totalCost: { $sum: '$costEstimate' } } }
        ]);
        const totalTokensUsed  = costAgg[0]?.totalTokens  || 0;
        const totalCostEstimate = costAgg[0]?.totalCost || 0;

        res.json({
            totalRepos,
            totalReviews,
            totalOverrides,
            agreedOverrides,
            accuracyRate,
            totalTokensUsed,
            totalCostEstimate: parseFloat(totalCostEstimate.toFixed(6)),
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/repos
app.get('/api/repos', async (req, res) => {
    try {
        const repos = await Repo.find().sort({ lastReviewed: -1 });
        res.json(repos);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/repos/:id
app.get('/api/repos/:id', async (req, res) => {
    try {
        const repo = await Repo.findById(req.params.id);
        if (!repo) return res.status(404).json({ error: 'Repo not found' });
        res.json(repo);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/reviews
app.get('/api/reviews', async (req, res) => {
    try {
        const { repoId, limit } = req.query;
        const query = {};
        if (repoId) query.repoId = repoId;
        let q = Review.find(query).sort({ reviewedAt: -1 });
        if (limit) q = q.limit(parseInt(limit, 10));
        res.json(await q.exec());
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/reviews/:id
app.get('/api/reviews/:id', async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) return res.status(404).json({ error: 'Review not found' });
        res.json(review);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/settings/global
app.get('/api/settings/global', async (req, res) => {
    try {
        const doc = await GlobalSettings.findById('global');
        if (!doc) {
            // Return defaults if not yet created
            return res.json({
                defaultStrictness: 'balanced',
                autoApproveTrivial: false,
                globalCustomRules: '',
                notifyOnBlock: true,
                notifyOnApprove: false,
            });
        }
        res.json(doc);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// PATCH /api/settings/global
app.patch('/api/settings/global', async (req, res) => {
    try {
        const { defaultStrictness, autoApproveTrivial, globalCustomRules, notifyOnBlock, notifyOnApprove } = req.body;
        const updateFields = {};
        if (defaultStrictness  !== undefined) updateFields.defaultStrictness  = defaultStrictness;
        if (autoApproveTrivial  !== undefined) updateFields.autoApproveTrivial  = autoApproveTrivial;
        if (globalCustomRules   !== undefined) updateFields.globalCustomRules   = globalCustomRules;
        if (notifyOnBlock       !== undefined) updateFields.notifyOnBlock       = notifyOnBlock;
        if (notifyOnApprove     !== undefined) updateFields.notifyOnApprove     = notifyOnApprove;

        const doc = await GlobalSettings.findByIdAndUpdate(
            'global',
            { $set: updateFields },
            { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
        );
        res.json(doc);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// GET /api/settings/:repoId  (by Mongo ObjectId — existing route, kept for compat)
app.get('/api/settings/:repoId', async (req, res) => {
    try {
        const repo = await Repo.findById(req.params.repoId, 'strictness autoApproveTrivial customRules');
        if (!repo) return res.status(404).json({ error: 'Repo not found' });
        res.json(repo);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH /api/settings/:repoOwner/:repoName  (by owner + repo name)
app.patch('/api/settings/:repoOwner/:repoName', async (req, res) => {
    try {
        const { repoOwner, repoName } = req.params;
        const { strictness, autoApproveTrivial, customRules } = req.body;
        const repoFullName = `${repoOwner}/${repoName}`;

        const updateFields = {};
        if (strictness        !== undefined) updateFields.strictness        = strictness;
        if (autoApproveTrivial !== undefined) updateFields.autoApproveTrivial = autoApproveTrivial;
        if (customRules        !== undefined) updateFields.customRules        = customRules;

        const repo = await Repo.findOneAndUpdate(
            { name: repoFullName },
            { $set: updateFields },
            { new: true, runValidators: true, select: 'strictness autoApproveTrivial customRules' }
        );
        if (!repo) return res.status(404).json({ error: 'Repo not found' });
        res.json(repo);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH /api/settings/:repoId  (by Mongo ObjectId — existing route, kept for compat)
app.patch('/api/settings/:repoId', async (req, res) => {
    try {
        const { strictness, autoApproveTrivial, customRules } = req.body;
        const updateFields = {};
        if (strictness        !== undefined) updateFields.strictness        = strictness;
        if (autoApproveTrivial !== undefined) updateFields.autoApproveTrivial = autoApproveTrivial;
        if (customRules        !== undefined) updateFields.customRules        = customRules;

        const repo = await Repo.findByIdAndUpdate(
            req.params.repoId,
            { $set: updateFields },
            { new: true, runValidators: true, select: 'strictness autoApproveTrivial customRules' }
        );
        if (!repo) return res.status(404).json({ error: 'Repo not found' });
        res.json(repo);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH /api/repos/:id/active
app.patch('/api/repos/:id/active', async (req, res) => {
    try {
        const { active } = req.body;
        const repo = await Repo.findByIdAndUpdate(
            req.params.id,
            { active },
            { new: true, runValidators: true }
        );
        if (!repo) return res.status(404).json({ error: 'Repo not found' });
        res.json(repo);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`[server] Started on port ${PORT}`);
    console.log(`[server] Socket.IO ready — clients on ${CORS_ORIGIN}`);
});