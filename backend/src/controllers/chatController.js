/**
 * chatController.js
 * Handles POST /chat requests — the main chatbot endpoint.
 */

const { v4: uuidv4 } = require('uuid');
const { ragQuery } = require('../services/ragService');
const cacheService = require('../services/cacheService');
const { isRelevantQuery } = require('../utils/guardrails');

/**
 * POST /chat
 * Body: { message: string, conversationId?: string, history?: Array<{role, content}> }
 * Response: { conversationId, answer, sources, cached, guardrailed, messageId }
 */
async function chat(req, res) {
    try {
        const { message, conversationId, history = [] } = req.body;

        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return res.status(400).json({ error: 'message is required and must be a non-empty string' });
        }

        const convId = conversationId || uuidv4();
        const messageId = uuidv4();
        const trimmedMessage = message.trim();

        // Step 1: Guardrail check
        const { relevant, reason } = isRelevantQuery(trimmedMessage);
        if (!relevant) {
            return res.json({
                conversationId: convId,
                messageId,
                answer: reason,
                sources: [],
                cached: false,
                guardrailed: true,
            });
        }

        // Step 2: Check cache (only for short, standalone queries without history)
        if (history.length === 0) {
            const cached = cacheService.get(trimmedMessage);
            if (cached) {
                return res.json({
                    conversationId: convId,
                    messageId,
                    ...cached,
                    cached: true,
                    guardrailed: false,
                });
            }
        }

        // Step 3: RAG pipeline
        const { answer, sources, retrieved } = await ragQuery(trimmedMessage, history);

        const responsePayload = { answer, sources };

        // Step 4: Cache if it's a fresh query with no history
        if (history.length === 0) {
            cacheService.set(trimmedMessage, responsePayload);
        }

        return res.json({
            conversationId: convId,
            messageId,
            answer,
            sources,
            cached: false,
            guardrailed: false,
            retrieved,
        });
    } catch (err) {
        console.error('[ChatController] Error:', err);
        return res.status(500).json({
            error: 'Something went wrong while processing your request. Please try again.',
            details: err.message,
            stack: err.stack
        });
    }
}

module.exports = { chat };
