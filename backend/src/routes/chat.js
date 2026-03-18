/**
 * chat.js — Route definitions for /chat
 */

const express = require('express');
const { chat } = require('../controllers/chatController');

const router = express.Router();

// POST /chat
router.post('/', chat);

module.exports = router;
