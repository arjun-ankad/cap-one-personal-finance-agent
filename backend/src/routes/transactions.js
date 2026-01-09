const express = require('express');
const {
  getTransactions,
  getTransactionById,
  getTransactionStats,
  getIncomeTransactions
} = require('../controllers/transactionController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/transactions - Get all transactions for user
router.get('/', getTransactions);

// GET /api/transactions/stats - Get transaction statistics
router.get('/stats', getTransactionStats);

// GET /api/transactions/:id - Get single transaction
router.get('/:id', getTransactionById);

// GET /api/transactions/income - Get income transactions
router.get('/income', getIncomeTransactions);

module.exports = router;