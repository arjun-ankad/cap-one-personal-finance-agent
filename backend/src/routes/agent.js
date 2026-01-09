const express = require('express');
const {
  runAgent,
  getInsights
} = require('../controllers/agentController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// POST /api/agent/run - Trigger AI agent analysis
router.post('/run', runAgent);

// GET /api/agent/insights - Get latest insights
router.get('/insights', getInsights);

module.exports = router;