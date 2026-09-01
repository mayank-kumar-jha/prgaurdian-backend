const { index } = require('./pinecone');
const { getEmbedding } = require('./embeddings');

async function retrieveRelevantContext(queryText, topK = 5) {
    const queryEmbedding = await getEmbedding(queryText);

    const results = await index.query({
        vector: queryEmbedding,
        topK,
        includeMetadata: true,
    });

    return results.matches.map((match) => match.metadata.text);
}

module.exports = { retrieveRelevantContext };