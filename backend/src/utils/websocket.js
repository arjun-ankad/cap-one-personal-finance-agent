const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

let wss;
const clients = new Map(); // customerId -> WebSocket

/**
 * Setup WebSocket server
 */
const setupWebSocket = (server) => {
  wss = new WebSocket.Server({ server });

  wss.on('connection', (ws, req) => {
    console.log('WebSocket connection attempt');

    // Extract token from query params
    const url = new URL(req.url, `http://${req.headers.host}`);
    const token = url.searchParams.get('token');

    if (!token) {
      ws.close(1008, 'Token required');
      return;
    }

    try {
      // Verify JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const customerId = decoded.customerId;

      // Store connection
      clients.set(customerId, ws);
      console.log(`WebSocket connected: customer ${customerId}`);

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'connected',
        message: 'WebSocket connected',
        customerId
      }));

      // Handle messages from client
      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          console.log('Received message:', data);
          
          // Echo back for now
          ws.send(JSON.stringify({
            type: 'echo',
            data: data
          }));
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      });

      // Handle disconnect
      ws.on('close', () => {
        clients.delete(customerId);
        console.log(`WebSocket disconnected: customer ${customerId}`);
      });

      // Handle errors
      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        clients.delete(customerId);
      });

    } catch (error) {
      console.error('WebSocket auth error:', error);
      ws.close(1008, 'Invalid token');
    }
  });

  console.log('WebSocket server ready');
};

/**
 * Broadcast message to specific user
 */
const broadcastToUser = (customerId, message) => {
  const client = clients.get(customerId);
  
  if (client && client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify(message));
    console.log(`Sent message to customer ${customerId}:`, message.type);
    return true;
  }
  
  console.log(`Customer ${customerId} not connected via WebSocket`);
  return false;
};

/**
 * Broadcast to all connected clients
 */
const broadcastToAll = (message) => {
  let sent = 0;
  clients.forEach((client, customerId) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
      sent++;
    }
  });
  console.log(`Broadcast to ${sent} clients`);
  return sent;
};

/**
 * Get connected clients count
 */
const getConnectedCount = () => {
  return clients.size;
};

/**
 * Check if user is connected
 */
const isUserConnected = (customerId) => {
  const client = clients.get(customerId);
  return client && client.readyState === WebSocket.OPEN;
};

module.exports = {
  setupWebSocket,
  broadcastToUser,
  broadcastToAll,
  getConnectedCount,
  isUserConnected
};