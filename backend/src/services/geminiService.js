/**
 * geminiService.js
 * Wraps Google Generative AI SDK for embeddings and text generation.
 */

require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const EMBEDDING_MODEL = 'models/gemini-embedding-001';
const CHAT_MODEL = 'gemini-flash-latest';

/**
 * Generate an embedding vector for a given text.
 * @param {string} text
 * @returns {Promise<number[]>}
 */
async function generateEmbedding(text) {
    const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });
    const result = await model.embedContent(text);
    return result.embedding.values;
}

/**
 * Generate an answer from the LLM given a RAG prompt.
 * @param {string} systemPrompt
 * @param {Array<{role: string, parts: string}>} history
 * @param {string} userMessage
 * @returns {Promise<string>}
 */
async function generateAnswer(systemPrompt, history, userMessage) {
    try {
        const model = genAI.getGenerativeModel({ model: CHAT_MODEL });

        // Build a single flat prompt with instructions, history, and the new query
        let fullPrompt = `${systemPrompt}\n\n`;

        if (history.length > 0) {
            fullPrompt += "--- Conversation History ---\n";
            history.forEach(h => {
                fullPrompt += `${h.role === 'model' ? 'Assistant' : 'User'}: ${h.content}\n`;
            });
            fullPrompt += "--- End of History ---\n\n";
        }

        fullPrompt += `User Question: ${userMessage}\n\nAnswer:`;

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        return response.text();
    } catch (err) {
        console.error(`[GeminiService] Generation failed:`, err);
        throw err;
    }
}

module.exports = { generateEmbedding, generateAnswer };
