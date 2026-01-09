const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Get credit card history
 */
const getCreditCards = async (req, res, next) => {
  try {
    const { customerId } = req.user;
    const { limit = 30 } = req.query;

    const creditCards = await prisma.creditCard.findMany({
      where: { customerId },
      orderBy: { recordDate: 'desc' },
      take: parseInt(limit)
    });

    res.json({ creditCards });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current credit card health
 */
const getCreditCardHealth = async (req, res, next) => {
  try {
    const { customerId } = req.user;

    // Get latest credit card record
    const latestCard = await prisma.creditCard.findFirst({
      where: { customerId },
      orderBy: { recordDate: 'desc' }
    });

    if (!latestCard) {
      return res.status(404).json({ error: 'No credit card data found' });
    }

    const balance = parseFloat(latestCard.creditCardBalance || 0);
    const limit = parseFloat(latestCard.creditLimit || 1);
    const utilization = (balance / limit) * 100;

    // Get trend (last 3 months)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const history = await prisma.creditCard.findMany({
      where: {
        customerId,
        recordDate: { gte: threeMonthsAgo }
      },
      orderBy: { recordDate: 'asc' }
    });

    // Calculate average utilization
    const avgUtilization = history.reduce((sum, record) => {
      const bal = parseFloat(record.creditCardBalance || 0);
      const lim = parseFloat(record.creditLimit || 1);
      return sum + (bal / lim) * 100;
    }, 0) / history.length;

    // Days until payment due
    const daysUntilDue = latestCard.paymentDueDate
      ? Math.ceil((new Date(latestCard.paymentDueDate) - new Date()) / (1000 * 60 * 60 * 24))
      : null;

    // Health status
    let status = 'good';
    if (utilization > 70) status = 'critical';
    else if (utilization > 30) status = 'warning';

    res.json({
      current: {
        balance,
        creditLimit: limit,
        utilization: utilization.toFixed(1),
        minimumPaymentDue: parseFloat(latestCard.minimumPaymentDue || 0),
        paymentDueDate: latestCard.paymentDueDate,
        daysUntilDue,
        rewardsPoints: latestCard.rewardsPoints,
        cardType: latestCard.cardType
      },
      trend: {
        avgUtilization: avgUtilization.toFixed(1),
        history: history.map(h => ({
          date: h.recordDate,
          balance: parseFloat(h.creditCardBalance || 0),
          utilization: ((parseFloat(h.creditCardBalance || 0) / parseFloat(h.creditLimit || 1)) * 100).toFixed(1)
        }))
      },
      status
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCreditCards,
  getCreditCardHealth
};