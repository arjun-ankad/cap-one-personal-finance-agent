const { PrismaClient } = require('@prisma/client');
const { runFinancialHealthAgent } = require('../services/aiAgent');

const prisma = new PrismaClient();

/**
 * Trigger AI agent to run analysis
 */
const runAgent = async (req, res, next) => {
  try {
    const { customerId } = req.user;

    // Run the agent (this will be implemented in services/aiAgent.js)
    const insights = await runFinancialHealthAgent(customerId);

    res.json({
      message: 'Agent analysis complete',
      insights
    });
  } catch (error) {
    console.error('Agent execution error:', error);
    next(error);
  }
};

/**
 * Get latest AI insights for user
 */
const getInsights = async (req, res, next) => {
  try {
    const { customerId } = req.user;

    // For now, return mock insights
    // Later, we'll store these in a database table
    const mockInsights = {
      timestamp: new Date(),
      insights: [
        'Your grocery spending is 15% higher than last month',
        'Credit utilization is healthy at 25%'
      ],
      alerts: [
        'Credit card payment due in 3 days'
      ],
      recommendations: [
        'Consider setting aside $200 for upcoming utility bills',
        'You could save $45/month by paying extra on your auto loan'
      ]
    };

    res.json(mockInsights);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  runAgent,
  getInsights
};