const express = require("express");
const dotenv = require("dotenv").config();
const errorHandler = require("./middleware/errorHandler");

const WebSocket = require('ws');
const app = express();
const http = require('http');
const { sql, poolPromise } = require('./config/dbConnection');
const websocketInit = require('./services/webSocketService')

port = process.env.PORT || 5000;

// inbuild middleware to accept body in string from the client and parse it as json in serverside
app.use(express.json());


// Api Routes
app.use("/api/users",require("./routes/userRoutes")); 
app.use("/api/patients",require("./routes/patientRoutes"));
app.use("/api/doctor",require("./routes/doctorRoutes"));
app.use("/api/conversations", require("./routes/conversationRoutes")); 
app.use("/api/messages",require("./routes/messageRoutes"))
// app.use("/api/appointments",require("./routes/appointmentRoutes"))


// Default route
app.use("/",async(req,res)=>{
    res.status(200).send("Hello from the server!!")
})

// use our custom middleware
app.use(errorHandler)


// Create HTTP server from Express app
const server = http.createServer(app);
// WebSocket
websocketInit(server);

// DB Connection Test
testConnection();


// Start the server
server.listen(port, '0.0.0.0', () => {
  console.log(`HTTP and WebSocket server running on port ${port}`);
});

// ------------------------


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

