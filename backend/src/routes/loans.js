const express = require('express');
const {
  getLoans,
  getLoanSummary
} = require('../controllers/loanController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/loans - Get loan history
router.get('/', getLoans);

// GET /api/loans/summary - Get loan summary
router.get('/summary', getLoanSummary);

module.exports = router;