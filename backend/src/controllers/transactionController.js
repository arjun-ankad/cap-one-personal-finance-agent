const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Get all transactions for user
 */
const getTransactions = async (req, res, next) => {
  try {
    const { customerId } = req.user;
    const { limit = 50, offset = 0, category, startDate, endDate } = req.query;

    const where = { customerId };

    // Filter by category
    if (category) {
      where.category = category;
    }

    // Filter by date range
    if (startDate || endDate) {
      where.transactionDate = {};
      if (startDate) where.transactionDate.gte = new Date(startDate);
      if (endDate) where.transactionDate.lte = new Date(endDate);
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { transactionDate: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    const total = await prisma.transaction.count({ where });

    res.json({
      transactions,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single transaction by ID
 */
const getTransactionById = async (req, res, next) => {
  try {
    const { customerId } = req.user;
    const { id } = req.params;

    const transaction = await prisma.transaction.findFirst({
      where: {
        id: parseInt(id),
        customerId
      }
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({ transaction });
  } catch (error) {
    next(error);
  }
};

/**
 * Get transaction statistics
 */
const getTransactionStats = async (req, res, next) => {
  try {
    const { customerId } = req.user;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get transactions in period
    const transactions = await prisma.transaction.findMany({
      where: {
        customerId,
        transactionDate: { gte: startDate }
      }
    });

    // Calculate stats
    const totalSpent = transactions
      .filter(t => t.transactionType === 'Withdrawal')
      .reduce((sum, t) => sum + parseFloat(t.transactionAmount), 0);

    const totalIncome = transactions
      .filter(t => t.transactionType === 'Deposit')
      .reduce((sum, t) => sum + parseFloat(t.transactionAmount), 0);

    const anomalyCount = transactions.filter(t => t.anomaly === 1).length;

    // Group by category
    const byCategory = transactions
      .filter(t => t.category)
      .reduce((acc, t) => {
        if (!acc[t.category]) {
          acc[t.category] = { total: 0, count: 0 };
        }
        acc[t.category].total += parseFloat(t.transactionAmount);
        acc[t.category].count += 1;
        return acc;
      }, {});

    res.json({
      period: { days: parseInt(days), startDate },
      totalSpent,
      totalIncome,
      netChange: totalIncome - totalSpent,
      transactionCount: transactions.length,
      anomalyCount,
      byCategory
    });
  } catch (error) {
    next(error);
  }
};

const getIncomeTransactions = async (req, res, next) => {
    try {
        const { customerId } = req.user;
        const incomeTransactions = await prisma.transaction.findMany({
            where: { customerId, category: 'INCOME' },
            orderBy: { transactionDate: 'desc' }
        });
        res.status(200).json(incomeTransactions);
    } catch (error) {
        next(error);
    }
};

module.exports = {
  getTransactions,
  getTransactionById,
  getTransactionStats,
  getIncomeTransactions
};