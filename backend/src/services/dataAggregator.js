const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Aggregate transaction data for AI analysis
 * Reduces token usage by 40x (20K → 500 tokens)
 */
const aggregateTransactionData = async (customerId, days = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const transactions = await prisma.transaction.findMany({
    where: {
      customerId,
      transactionDate: { gte: startDate }
    },
    orderBy: { transactionDate: 'desc' }
  });

  // Previous period for comparison
  const prevStartDate = new Date(startDate);
  prevStartDate.setDate(prevStartDate.getDate() - days);

  const prevTransactions = await prisma.transaction.findMany({
    where: {
      customerId,
      transactionDate: {
        gte: prevStartDate,
        lt: startDate
      }
    }
  });

  // Group by category
  const spendingByCategory = {};
  const prevSpendingByCategory = {};

  transactions.forEach(t => {
    if (t.transactionType === 'Withdrawal' && t.category) {
      if (!spendingByCategory[t.category]) {
        spendingByCategory[t.category] = { total: 0, count: 0, transactions: [] };
      }
      spendingByCategory[t.category].total += parseFloat(t.transactionAmount);
      spendingByCategory[t.category].count += 1;
      spendingByCategory[t.category].transactions.push(parseFloat(t.transactionAmount));
    }
  });

  prevTransactions.forEach(t => {
    if (t.transactionType === 'Withdrawal' && t.category) {
      if (!prevSpendingByCategory[t.category]) {
        prevSpendingByCategory[t.category] = { total: 0, count: 0 };
      }
      prevSpendingByCategory[t.category].total += parseFloat(t.transactionAmount);
      prevSpendingByCategory[t.category].count += 1;
    }
  });

  // Calculate changes
  const categoryAnalysis = {};
  Object.keys(spendingByCategory).forEach(category => {
    const current = spendingByCategory[category];
    const prev = prevSpendingByCategory[category] || { total: 0, count: 0 };
    
    const avg = current.total / current.count;
    const prevTotal = prev.total;
    const changePct = prevTotal > 0 ? ((current.total - prevTotal) / prevTotal) * 100 : 0;

    categoryAnalysis[category] = {
      total: current.total.toFixed(2),
      count: current.count,
      avg: avg.toFixed(2),
      change_pct: changePct.toFixed(1)
    };
  });

  // Find anomalies
  const anomalies = transactions
    .filter(t => t.anomaly === 1)
    .map(t => ({
      date: t.transactionDate,
      amount: parseFloat(t.transactionAmount),
      merchant: t.merchant,
      category: t.category
    }));

  // Calculate totals
  const totalSpent = transactions
    .filter(t => t.transactionType === 'Withdrawal')
    .reduce((sum, t) => sum + parseFloat(t.transactionAmount), 0);

  const totalIncome = transactions
    .filter(t => t.transactionType === 'Deposit')
    .reduce((sum, t) => sum + parseFloat(t.transactionAmount), 0);

  const prevTotalSpent = prevTransactions
    .filter(t => t.transactionType === 'Withdrawal')
    .reduce((sum, t) => sum + parseFloat(t.transactionAmount), 0);

  const dailyAvg = totalSpent / days;
  const spendingChangePct = prevTotalSpent > 0 
    ? ((totalSpent - prevTotalSpent) / prevTotalSpent) * 100 
    : 0;

  return {
    period: { days, start_date: startDate.toISOString().split('T')[0] },
    spending_by_category: categoryAnalysis,
    anomalies,
    summary: {
      total_spent: totalSpent.toFixed(2),
      total_income: totalIncome.toFixed(2),
      daily_avg: dailyAvg.toFixed(2),
      net_change: (totalIncome - totalSpent).toFixed(2)
    },
    comparison: {
      vs_previous_period: {
        amount: prevTotalSpent.toFixed(2),
        change_pct: spendingChangePct.toFixed(1)
      }
    }
  };
};

/**
 * Aggregate credit card data
 */
const aggregateCreditCardData = async (customerId) => {
  const latestCard = await prisma.creditCard.findFirst({
    where: { customerId },
    orderBy: { recordDate: 'desc' }
  });

  if (!latestCard) return null;

  const balance = parseFloat(latestCard.creditCardBalance || 0);
  const limit = parseFloat(latestCard.creditLimit || 1);
  const utilization = (balance / limit) * 100;

  const daysUntilDue = latestCard.paymentDueDate
    ? Math.ceil((new Date(latestCard.paymentDueDate) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  return {
    balance: balance.toFixed(2),
    credit_limit: limit.toFixed(2),
    utilization_pct: utilization.toFixed(1),
    minimum_payment: parseFloat(latestCard.minimumPaymentDue || 0).toFixed(2),
    days_until_due: daysUntilDue,
    rewards_points: latestCard.rewardsPoints
  };
};

/**
 * Aggregate loan data
 */
const aggregateLoanData = async (customerId) => {
  const latestLoan = await prisma.loan.findFirst({
    where: { customerId },
    orderBy: { recordDate: 'desc' }
  });

  if (!latestLoan) return null;

  const loanAmount = parseFloat(latestLoan.loanAmount || 0);
  const interestRate = parseFloat(latestLoan.interestRate || 0);
  const loanTerm = parseInt(latestLoan.loanTerm || 0);

  const monthlyRate = interestRate / 100 / 12;
  const monthlyPayment = loanTerm > 0
    ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, loanTerm)) /
      (Math.pow(1 + monthlyRate, loanTerm) - 1)
    : 0;

  return {
    balance: loanAmount.toFixed(2),
    loan_type: latestLoan.loanType,
    interest_rate: interestRate.toFixed(2),
    monthly_payment: monthlyPayment.toFixed(2),
    status: latestLoan.loanStatus
  };
};

/**
 * Get complete financial summary for AI
 */
const getFinancialSummary = async (customerId) => {
  const [transactions, creditCard, loan] = await Promise.all([
    aggregateTransactionData(customerId, 30),
    aggregateCreditCardData(customerId),
    aggregateLoanData(customerId)
  ]);

  return {
    transactions,
    credit_card: creditCard,
    loan: loan
  };
};

module.exports = {
  aggregateTransactionData,
  aggregateCreditCardData,
  aggregateLoanData,
  getFinancialSummary
};