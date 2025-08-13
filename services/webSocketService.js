import { sql, poolPromise } from '../config/dbConnection.js';
import { WebSocketServer } from "ws";
import WebSocket from "ws";

const clients = new Map();

export default function websocketInit(server) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws, req) => {
  console.log('New WebSocket client connected');

  // Handle user identification
  ws.on('message', async (message) => {
    console.log('Raw received:', message); 
    try {
      const msgData = JSON.parse(message);
      console.log('Parsed:', msgData); 
      
      // Handle user registration for this connection
      if (msgData.type === 'register') {
        clients.set(msgData.userId, ws);
        console.log(`User ${msgData.userId} registered for WebSocket`);
        return;
      }

      // Handle chat messages
      if (msgData.type === 'message') {
        console.log('Inserting message...');
        // Save message to Azure SQL Database
        const pool = await poolPromise;
        const result = await pool.request()
          .input('sender', sql.Int, msgData.sender_id)
          .input('receiver', sql.Int, msgData.receiver_id)
          .input('content', sql.NVarChar, msgData.content)
          .query(`
            INSERT INTO Messages (sender_id, receiver_id, content, timestamp)
            OUTPUT INSERTED.id, INSERTED.timestamp
            VALUES (@sender, @receiver, @content, GETUTCDATE())
          `);

        // Add the database-generated ID and timestamp to the message
        const savedMessage = {
           ...msgData, // Preserve original client data
           id: result.recordset[0].id,
           serverTimestamp: result.recordset[0].timestamp // Add server timestamp
        };
        
        // Send to specific receiver if connected
        const receiverWs = clients.get(msgData.receiverId);
        if (receiverWs && receiverWs.readyState === WebSocket.OPEN) {
          receiverWs.send(JSON.stringify(savedMessage));
        }

        // Send confirmation back to sender
        ws.send(JSON.stringify({
          type: 'message_sent',
          ...savedMessage
        }));

        console.log(`Message from ${msgData.sender_id} to ${msgData.receiver_id} saved and sent`);
      }

    } catch (err) {
      console.error('Error handling WebSocket message:', err);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Failed to process message'
      }));
    }
  });

  ws.on('close', () => {
    // Remove user from active connections
    for (let [userId, userWs] of clients.entries()) {
      if (userWs === ws) {
        clients.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});


}
