import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// WebSocket connection
let ws = null;
let wsCallbacks = [];

export const connectWebSocket = (token) => {
  if (ws?.readyState === WebSocket.OPEN) return;
  
  ws = new WebSocket(`${API_BASE.replace('http', 'ws')}?token=${token}`);
  
  ws.onopen = () => {
    console.log('WebSocket connected');
  };
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    wsCallbacks.forEach(cb => cb(data));
  };
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
  
  ws.onclose = () => {
    console.log('WebSocket disconnected');
    // Reconnect after 3 seconds
    setTimeout(() => {
      if (token) connectWebSocket(token);
    }, 3000);
  };
};

export const onWebSocketMessage = (callback) => {
  wsCallbacks.push(callback);
  return () => {
    wsCallbacks = wsCallbacks.filter(cb => cb !== callback);
  };
};

export const disconnectWebSocket = () => {
  if (ws) {
    ws.close();
    ws = null;
  }
  wsCallbacks = [];
};

// Auth
export const login = async (email, password) => {
  const response = await api.post('/api/auth/login', { email, password });
  return response.data;
};

export const logout = async () => {
  const response = await api.post('/api/auth/logout');
  disconnectWebSocket();
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/api/auth/me');
  return response.data;
};

// Transactions
export const getTransactions = async (params = {}) => {
  const response = await api.get('/api/transactions', { params });
  return response.data;
};

export const getTransactionStats = async (days = 30) => {
  const response = await api.get('/api/transactions/stats', { params: { days } });
  return response.data;
};

export const fetchIncomeTransactions = async () => {
  const response = await api.get('/transactions/income');
  return response.data;
};

// Credit Cards
export const getCreditCardHealth = async () => {
  const response = await api.get('/api/credit-cards/health');
  return response.data;
};

// Loans
export const getLoanSummary = async () => {
  const response = await api.get('/api/loans/summary');
  return response.data;
};

// AI Agent
export const runAgent = async () => {
  const response = await api.post('/api/agent/run');
  return response.data;
};

export const getInsights = async () => {
  const response = await api.get('/api/agent/insights');
  return response.data;
};

export default api;