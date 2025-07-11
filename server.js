const express = require("express");
const dotenv = require("dotenv").config();
const errorHandler = require("./middleware/errorHandler");

const WebSocket = require('ws');
const app = express();
const http = require('http');
const { sql, poolPromise } = require('./config/dbConnection');

port = process.env.PORT || 5000;

// inbuild middleware to accept body in string from the client and parse it as json in serverside
app.use(express.json());

app.use("/api/users",require("./routes/userRoutes")); 
app.use("/api/patients",require("./routes/patientRoutes"));
app.use("/api/doctor",require("./routes/doctorRoutes"));
app.use("/api/conversations", require("./routes/conversationRoutes")); 
app.use("/api/messages",require("./routes/messageRoutes"))

// REST API for message history
app.get('/api/messages/:senderId/:receiverId', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('sender', sql.Int, req.params.senderId)
      .input('receiver', sql.Int, req.params.receiverId)
      .query(`
        SELECT id, sender_id, receiver_id, content, timestamp 
        FROM Messages 
        WHERE (sender_id = @sender AND receiver_id = @receiver) 
           OR (sender_id = @receiver AND receiver_id = @sender)
        ORDER BY timestamp ASC
      `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: err.message });
  }
});


app.use("/",async(req,res)=>{
    res.status(200).send("Hello from the server!!")
})

// Create HTTP server from Express app
const server = http.createServer(app);

// Create WebSocket server attached to the HTTP server
const wss = new WebSocket.Server({ server });

// Store active connections with user mapping
const clients = new Map();

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


// use our custom middleware
app.use(errorHandler)

// Add this to server.js
async function testConnection() {
  try {
    const pool = await poolPromise;
    const result = await pool.query`SELECT @@VERSION`;
    console.log("SQL Server version:", result.recordset[0][""]);
  } catch (err) {
    console.error("Connection test failed:", err);
  }
}

(async () => {
  console.log('Starting SQL connection test...');
  await testConnection();
  console.log('SQL connection test finished.');
})();



// Start the server
server.listen(port, '0.0.0.0', () => {
  console.log(`HTTP and WebSocket server running on port ${port}`);
});
