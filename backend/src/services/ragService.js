/**
 * ragService.js
 * Core RAG pipeline: Query → Embed → Retrieve → Build Prompt → LLM → Answer
 */

const { generateEmbedding, generateAnswer } = require('./geminiService');
const vectorStore = require('./vectorStore');

const SYSTEM_PROMPT = `You are GitLab's official handbook assistant — a helpful, knowledgeable, and friendly AI.

Your job is to answer questions about GitLab's values, culture, handbook policies, product direction, engineering practices, and company strategy.

Rules:
1. ONLY answer using the provided context sections below.
2. If the context does not contain enough information to answer, say: "I don't have enough information from the GitLab Handbook to answer that. You can explore more at https://handbook.gitlab.com"
3. Do NOT hallucinate or make up facts.
4. Cite the source page titles in your answer when relevant.
5. Be concise, clear, and helpful — bullet points work great for lists.
6. If asked for your opinion, clarify that you are an AI assistant based on GitLab's public documentation.`;

/**
 * Build the augmented prompt from retrieved chunks.
 * @param {string} query
 * @param {Array<{ chunkText, title, source }>} relevantChunks
 * @returns {string}
 */
function buildAugmentedQuery(query, relevantChunks) {
    const contextBlocks = relevantChunks
        .map((c, i) => `--- Context ${i + 1} (from: ${c.title}) ---\n${c.chunkText}`)
        .join('\n\n');

    return `Here is relevant content from GitLab's Handbook and Direction pages:

${contextBlocks}

---
User Question: ${query}

Please answer the question using ONLY the context provided above.`;
}

/**
 * Re-rank retrieved chunks using the LLM to filter for actual relevance.
 */
async function rerankChunks(query, chunks) {
    if (chunks.length <= 3) return chunks; // Too few to re-rank

    const prompt = `Task: Re-rank the following document chunks based on their relevance to the user's query.
Query: "${query}"

Chunks:
${chunks.map((c, i) => `[${i}] (from ${c.title}): ${c.chunkText.slice(0, 300)}...`).join('\n\n')}

Instructions:
1. Identify which chunks are truly helpful for answering the query.
2. Return a comma-separated list of the indices (e.g., 0, 2, 5) of the TOP 5 most relevant chunks in order of importance.
3. If fewer than 5 are relevant, only list those.
4. Return ONLY the numbers, no other text.`;

    try {
        const result = await generateAnswer("You are a helpful RAG re-ranker.", [], prompt);
        const indices = result.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n) && n >= 0 && n < chunks.length);

        // Return re-ordered chunks based on LLM's preference
        return indices.map(idx => chunks[idx]);
    } catch (err) {
        console.error('[Rerank] Failed, falling back to vector scores:', err);
        return chunks.slice(0, 5);
    }
}

/**
 * Main RAG pipeline function.
 */
async function ragQuery(query, history = []) {
    // Step 1: Embed the user query
    const queryEmbedding = await generateEmbedding(query);

    // Step 2: Retrieve more chunks for re-ranking (top 10)
    let chunks = vectorStore.search(queryEmbedding, 10);

    if (chunks.length === 0) {
        return {
            answer: "I couldn't find relevant information in the GitLab Handbook for your question.",
            sources: [],
            retrieved: 0,
        };
    }

    // Step 3: Re-rank with LLM
    const relevantChunks = await rerankChunks(query, chunks);

    // Step 4: Build augmented prompt
    const augmentedQuery = buildAugmentedQuery(query, relevantChunks);

    // Step 5: Get LLM response
    const recentHistory = history.slice(-6);
    const answer = await generateAnswer(SYSTEM_PROMPT, recentHistory, augmentedQuery);

    // Step 6: Build sources list
    const sourceMap = new Map();
    for (const chunk of relevantChunks) {
        if (!sourceMap.has(chunk.source)) {
            sourceMap.set(chunk.source, {
                title: chunk.title,
                url: chunk.source,
                excerpt: chunk.chunkText.slice(0, 200).trim() + '...',
                score: Math.round(chunk.score * 100),
            });
        }
    }
    const sources = Array.from(sourceMap.values());

    return { answer, sources, retrieved: relevantChunks.length };
}

module.exports = { ragQuery };
