const express = require('express');
const {
  getCreditCards,
  getCreditCardHealth
} = require('../controllers/creditCardController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/credit-cards - Get credit card history
router.get('/', getCreditCards);

// GET /api/credit-cards/health - Get current credit health
router.get('/health', getCreditCardHealth);

module.exports = router;