/**
 * app.js — Express application entry point.
 * Loads vector store from disk, then starts the HTTP server.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const vectorStore = require('./services/vectorStore');

// Routes
const chatRoute = require('./routes/chat');
const feedbackRoute = require('./routes/feedback');
const healthRoute = require('./routes/health');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
}));
app.use(express.json({ limit: '2mb' }));

// Request logger (dev only)
if (process.env.NODE_ENV !== 'production') {
    app.use((req, _res, next) => {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
        next();
    });
}

// ── Routes ──────────────────────────────────────────────────────────────────
// Local development routes
app.use('/health', healthRoute);
app.use('/chat', chatRoute);
app.use('/feedback', feedbackRoute);

// Vercel routes under /api (due to vercel.json rewrite)
const apiRouter = express.Router();
apiRouter.use('/health', healthRoute);
apiRouter.use('/chat', chatRoute);
apiRouter.use('/feedback', feedbackRoute);
app.use('/api', apiRouter);

// 404 handler
app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, _req, res, _next) => {
    console.error('[App] Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// ── Startup & Export ──────────────────────────────────────────────────────────
// Load vector store immediately (for serverless cold starts)
try {
    vectorStore.load();
} catch (e) {
    console.error('[App] Failed to load vector store:', e);
}

// Only start the server if we're running locally (not in Vercel)
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`\n🚀 GitLab Chatbot Backend running on http://localhost:${PORT}`);
        console.log(`   Vector store: ${vectorStore.size()} chunks loaded\n`);
    });
}

module.exports = app;
