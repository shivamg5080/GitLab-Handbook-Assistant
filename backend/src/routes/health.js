/**
 * health.js — Health check route
 */

const express = require('express');
const vectorStore = require('../services/vectorStore');
const cacheService = require('../services/cacheService');

const router = express.Router();

// GET /health
router.get('/', (req, res) => {
    res.json({
        status: 'ok',
        chunksLoaded: vectorStore.size(),
        cacheStats: cacheService.stats(),
        timestamp: new Date().toISOString(),
    });
});

module.exports = router;
