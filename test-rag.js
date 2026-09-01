// test-rag.js
require('dotenv').config();
const { indexRepoFiles } = require('./indexRepo');
const { retrieveRelevantContext } = require('./retrieve');

async function run() {
    await indexRepoFiles(157578274, 'mayank-kumar-jha', 'Edura-AI', ['README.md']);

    const context = await retrieveRelevantContext('AI');
    console.log('Retrieved context:', context);
}

run();