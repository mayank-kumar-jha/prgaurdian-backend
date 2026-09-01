// embeddings.js
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function getEmbedding(text) {
    const model = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });

    // Request 1024 dimensions to match your Pinecone index
    const result = await model.embedContent({
        content: { parts: [{ text }] },
        outputDimensionality: 1024,
    });

    return result.embedding.values;
}

module.exports = { getEmbedding };