/**
 * vectorStore.js
 * In-memory vector store with cosine similarity search.
 * Persists to/from data/chunks.json for fast restarts.
 */

const fs = require('fs');
const path = require('path');
const { cosineSimilarity } = require('../utils/cosineSimilarity');

const DATA_PATH = path.join(__dirname, '../../data/chunks.json');

// In-memory store: array of chunk objects with embeddings
let store = [];

/**
 * Load persisted chunks from disk.
 * @returns {boolean} true if loaded successfully
 */
function load() {
    try {
        if (fs.existsSync(DATA_PATH)) {
            const raw = fs.readFileSync(DATA_PATH, 'utf-8');
            store = JSON.parse(raw);
            console.log(`[VectorStore] Loaded ${store.length} chunks from disk`);
            return true;
        }
    } catch (err) {
        console.error('[VectorStore] Failed to load from disk:', err.message);
    }
    return false;
}

/**
 * Save current store to disk.
 */
function save() {
    try {
        const dir = path.dirname(DATA_PATH);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(DATA_PATH, JSON.stringify(store, null, 2));
        console.log(`[VectorStore] Saved ${store.length} chunks to disk`);
    } catch (err) {
        console.error('[VectorStore] Failed to save to disk:', err.message);
    }
}

/**
 * Add chunks (with embeddings) to the store.
 * @param {Array<{ id, chunkText, embedding, source, title, chunkIndex }>} chunks
 */
function addChunks(chunks) {
    store = chunks;
    console.log(`[VectorStore] Indexed ${store.length} chunks`);
}

/**
 * Semantic search — returns top-k most similar chunks.
 * @param {number[]} queryEmbedding
 * @param {number} k
 * @returns {Array<{ id, chunkText, source, title, score }>}
 */
function search(queryEmbedding, k = 5) {
    if (store.length === 0) return [];

    const scored = store.map((chunk) => ({
        id: chunk.id,
        chunkText: chunk.chunkText,
        source: chunk.source,
        title: chunk.title,
        score: cosineSimilarity(queryEmbedding, chunk.embedding),
    }));

    // Sort by score descending, return top-k
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, k).filter((c) => c.score > 0.3); // minimum relevance threshold
}

/**
 * Return total number of indexed chunks.
 */
function size() {
    return store.length;
}

module.exports = { load, save, addChunks, search, size };
