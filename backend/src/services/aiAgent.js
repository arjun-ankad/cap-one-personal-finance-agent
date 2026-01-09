const Anthropic = require('@anthropic-ai/sdk');
const { getFinancialSummary } = require('./dataAggregator');
const { broadcastToUser } = require('../utils/websocket');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// System prompt for caching (saves 90% on repeated calls)
const SYSTEM_PROMPT = `You are a financial advisor AI agent. Your role is to analyze spending patterns and provide actionable insights.

Rules:
1. Identify unusual spending (>2x category average or marked as anomaly)
2. Flag credit utilization >30% as warning, >70% as critical
3. Suggest budget optimizations based on patterns
4. Be concise (max 3 insights, 2 alerts, 3 recommendations)
5. Return valid JSON only

Output format:
{
  "insights": ["insight 1", "insight 2", "insight 3"],
  "alerts": ["alert 1", "alert 2"],
  "recommendations": ["action 1", "action 2", "action 3"]
}

Focus on actionable advice that helps users make better financial decisions.`;

/**
 * Run Financial Health Agent (triggered on user login)
 */
const runFinancialHealthAgent = async (customerId) => {
  try {
    console.log(`Running Financial Health Agent for customer ${customerId}`);

    // Get aggregated data (reduces tokens by 40x)
    const financialData = await getFinancialSummary(customerId);

    // Build user prompt
    const userPrompt = `Analyze this financial summary:

${JSON.stringify(financialData, null, 2)}

Provide insights, alerts, and recommendations based on the data.`;

    // Call Claude API with prompt caching
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' } // Cache system prompt
        }
      ],
      messages: [
        {
          role: 'user',
          content: userPrompt
        }
      ]
    });

    // Parse response - strip markdown code blocks if present
    let content = response.content[0].text;
    
    // Remove markdown code block formatting if present
    if (content.includes('```')) {
      content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    }
    
    const result = JSON.parse(content);

    // Broadcast insights via WebSocket
    broadcastToUser(customerId, {
      type: 'agent_insights',
      data: result,
      timestamp: new Date().toISOString()
    });

    console.log(`Agent completed for customer ${customerId}`);
    return result;

  } catch (error) {
    console.error('AI Agent error:', error);
    throw error;
  }
};

/**
 * Transaction Monitor Agent (event-driven: new transactions)
 */
const runTransactionMonitorAgent = async (customerId) => {
  try {
    console.log(`Running Transaction Monitor for customer ${customerId}`);

    const financialData = await getFinancialSummary(customerId);

    // Focus on transaction anomalies
    const userPrompt = `Analyze these transactions for anomalies:

${JSON.stringify(financialData.transactions, null, 2)}

Identify:
1. Unusual spending patterns
2. Category changes
3. Any fraud risks

Return JSON with insights and alerts.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 800,
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' }
        }
      ],
      messages: [{ role: 'user', content: userPrompt }]
    });

    const result = JSON.parse(response.content[0].text);

    broadcastToUser(customerId, {
      type: 'transaction_insights',
      data: result,
      timestamp: new Date().toISOString()
    });

    return result;
  } catch (error) {
    console.error('Transaction Monitor error:', error);
    throw error;
  }
};

/**
 * Credit Manager Agent (event-driven: payment due soon)
 */
const runCreditManagerAgent = async (customerId) => {
  try {
    console.log(`Running Credit Manager for customer ${customerId}`);

    const financialData = await getFinancialSummary(customerId);

    if (!financialData.credit_card) {
      return { insights: [], alerts: [], recommendations: [] };
    }

    const userPrompt = `Analyze credit card health:

${JSON.stringify(financialData.credit_card, null, 2)}

Focus on:
1. Credit utilization
2. Payment due dates
3. Balance trends

Return JSON with insights and alerts.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 600,
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' }
        }
      ],
      messages: [{ role: 'user', content: userPrompt }]
    });

    const result = JSON.parse(response.content[0].text);

    broadcastToUser(customerId, {
      type: 'credit_insights',
      data: result,
      timestamp: new Date().toISOString()
    });

    return result;
  } catch (error) {
    console.error('Credit Manager error:', error);
    throw error;
  }
};

/**
 * Trigger agent on user login (event-driven)
 */
const triggerAgentOnLogin = async (customerId) => {
  // Check if already run today
  const today = new Date().toDateString();
  const lastRun = global.agentLastRun?.[customerId];

  if (lastRun === today) {
    console.log(`Agent already run today for customer ${customerId}`);
    return;
  }

  // Mark as run
  if (!global.agentLastRun) global.agentLastRun = {};
  global.agentLastRun[customerId] = today;

  // Run in background (don't block login)
  runFinancialHealthAgent(customerId).catch(err => 
    console.error('Background agent failed:', err)
  );
};

module.exports = {
  runFinancialHealthAgent,
  runTransactionMonitorAgent,
  runCreditManagerAgent,
  triggerAgentOnLogin
};