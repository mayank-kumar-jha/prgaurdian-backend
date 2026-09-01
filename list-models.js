require('dotenv').config();

async function listModels() {
    const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
    );
    const data = await res.json();
    for (const model of data.models) {
        console.log(model.name, '-', model.supportedGenerationMethods);
    }
}

listModels();