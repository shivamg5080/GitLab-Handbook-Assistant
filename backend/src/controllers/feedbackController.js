/**
 * feedbackController.js
 * Handles POST /feedback — stores user thumbs up/down on answers.
 */

const fs = require('fs');
const path = require('path');

const FEEDBACK_PATH = path.join(__dirname, '../../data/feedback.json');

/**
 * POST /feedback
 * Body: { messageId: string, rating: 'up'|'down', query: string, answer: string }
 */
async function submitFeedback(req, res) {
    try {
        const { messageId, rating, query, answer } = req.body;

        if (!messageId || !rating || !['up', 'down'].includes(rating)) {
            return res.status(400).json({ error: 'messageId and rating (up|down) are required' });
        }

        const entry = {
            messageId,
            rating,
            query: query || '',
            answer: answer || '',
            timestamp: new Date().toISOString(),
        };

        // Read existing feedback
        let feedback = [];
        if (fs.existsSync(FEEDBACK_PATH)) {
            try {
                feedback = JSON.parse(fs.readFileSync(FEEDBACK_PATH, 'utf-8'));
            } catch (_) {
                feedback = [];
            }
        }

        feedback.push(entry);

        // Ensure data directory exists
        const dir = path.dirname(FEEDBACK_PATH);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        fs.writeFileSync(FEEDBACK_PATH, JSON.stringify(feedback, null, 2));

        console.log(`[Feedback] ${rating.toUpperCase()} for message ${messageId}`);
        return res.json({ success: true });
    } catch (err) {
        console.error('[FeedbackController] Error:', err);
        return res.status(500).json({ error: 'Failed to save feedback' });
    }
}

module.exports = { submitFeedback };
