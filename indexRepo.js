// indexRepo.js
require('dotenv').config();
const fs = require('fs');
const { Octokit } = require('@octokit/rest');
const { createAppAuth } = require('@octokit/auth-app');
const { index } = require('./pinecone');
const { getEmbedding } = require('./embeddings');
const { chunkText } = require('./chunker');

function getAppPrivateKey() {
    let privateKey = process.env.GITHUB_PRIVATE_KEY;
    if (!privateKey && process.env.GITHUB_PRIVATE_KEY_PATH) {
        privateKey = fs.readFileSync(process.env.GITHUB_PRIVATE_KEY_PATH, 'utf8');
    }
    return privateKey;
}

async function getAppOctokit() {
    const privateKey = getAppPrivateKey();
    const auth = createAppAuth({
        appId: Number(process.env.GITHUB_APP_ID),
        privateKey,
    });

    const { token } = await auth({ type: 'app' });
    return new Octokit({ auth: token });
}

async function getInstallationOctokit(installationId) {
    const privateKey = getAppPrivateKey();

    const auth = createAppAuth({
        appId: Number(process.env.GITHUB_APP_ID),
        privateKey,
        installationId,
    });

    const { token } = await auth({ type: 'installation' });
    return new Octokit({ auth: token });
}

async function indexRepoFiles(installationId, owner, repo, filePaths) {
    const octokit = await getInstallationOctokit(installationId);

    for (const path of filePaths) {
        const { data } = await octokit.repos.getContent({ owner, repo, path });

        if (!data || !data.content) {
            console.log(`Skipping ${path}: No content found.`);
            continue;
        }

        const content = Buffer.from(data.content, 'base64').toString('utf8');
        console.log(`File: ${path}, length: ${content.length} characters`);

        const chunks = chunkText(content);
        console.log(`Generated ${chunks.length} chunks for ${path}`);

        if (!chunks || chunks.length === 0) {
            console.log(`No chunks to index for ${path}`);
            continue;
        }

        const records = [];
        for (let i = 0; i < chunks.length; i++) {
            const embedding = await getEmbedding(chunks[i]);

            const cleanId = `${repo}-${path.replace(/[^a-zA-Z0-9]/g, '_')}-chunk${i}`;

            records.push({
                id: cleanId,
                values: embedding,
                metadata: { repo, path, chunkIndex: i, text: chunks[i] },
            });
        }

        // Newer Pinecone SDK syntax
        if (records.length > 0) {
            await index.upsert({ records });
            console.log(`Successfully indexed ${path}: ${records.length} chunks`);
        }
    }
}

module.exports = { indexRepoFiles, getInstallationOctokit, getAppOctokit };