/**
 * feedback.js — Route definitions for /feedback
 */

const express = require('express');
const { submitFeedback } = require('../controllers/feedbackController');

const router = express.Router();

// POST /feedback
router.post('/', submitFeedback);

module.exports = router;
