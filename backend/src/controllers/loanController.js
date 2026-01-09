const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Get loan history
 */
const getLoans = async (req, res, next) => {
  try {
    const { customerId } = req.user;
    const { limit = 30 } = req.query;

    const loans = await prisma.loan.findMany({
      where: { customerId },
      orderBy: { recordDate: 'desc' },
      take: parseInt(limit)
    });

    res.json({ loans });
  } catch (error) {
    next(error);
  }
};

/**
 * Get loan summary
 */
const getLoanSummary = async (req, res, next) => {
  try {
    const { customerId } = req.user;

    // Get latest loan record
    const latestLoan = await prisma.loan.findFirst({
      where: { customerId },
      orderBy: { recordDate: 'desc' }
    });

    if (!latestLoan) {
      return res.status(404).json({ error: 'No loan data found' });
    }

    const loanAmount = parseFloat(latestLoan.loanAmount || 0);
    const interestRate = parseFloat(latestLoan.interestRate || 0);
    const loanTerm = parseInt(latestLoan.loanTerm || 0);

    // Calculate monthly payment (simple amortization)
    const monthlyRate = interestRate / 100 / 12;
    const monthlyPayment = loanTerm > 0
      ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, loanTerm)) /
        (Math.pow(1 + monthlyRate, loanTerm) - 1)
      : 0;

    // Get payment history (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const history = await prisma.loan.findMany({
      where: {
        customerId,
        recordDate: { gte: sixMonthsAgo }
      },
      orderBy: { recordDate: 'asc' }
    });

    // Calculate how much paid off
    const initialLoan = history.length > 0 ? parseFloat(history[0].loanAmount || 0) : loanAmount;
    const amountPaidOff = initialLoan - loanAmount;

    // Estimate months remaining
    const monthsRemaining = monthlyPayment > 0
      ? Math.ceil(loanAmount / (monthlyPayment - (loanAmount * monthlyRate)))
      : 0;

    // Calculate total interest if paid on schedule
    const totalInterest = (monthlyPayment * monthsRemaining) - loanAmount;

    res.json({
      current: {
        loanAmount,
        loanType: latestLoan.loanType,
        interestRate,
        loanTerm,
        loanStatus: latestLoan.loanStatus,
        monthlyPayment: monthlyPayment.toFixed(2)
      },
      projection: {
        monthsRemaining,
        totalInterest: totalInterest.toFixed(2),
        payoffDate: monthsRemaining > 0
          ? new Date(Date.now() + monthsRemaining * 30 * 24 * 60 * 60 * 1000)
          : null
      },
      progress: {
        initialAmount: initialLoan,
        amountPaidOff: amountPaidOff.toFixed(2),
        percentPaid: initialLoan > 0 ? ((amountPaidOff / initialLoan) * 100).toFixed(1) : 0
      },
      history: history.map(h => ({
        date: h.recordDate,
        balance: parseFloat(h.loanAmount || 0),
        status: h.loanStatus
      }))
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLoans,
  getLoanSummary
};