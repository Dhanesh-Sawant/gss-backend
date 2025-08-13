import express from "express";
import dotenv from "dotenv";
import errorHandler from "./middleware/errorHandler.js";

import WebSocket from "ws";
import http from "http";
import { sql, poolPromise } from "./config/dbConnection.js";
import websocketInit from "./services/webSocketService.js";

// Api Routes (ESM imports)
import userRoutes from "./routes/userRoutes.js";
import patientRoutes from "./routes/patientRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
// import appointmentRoutes from "./routes/appointmentRoutes.js";

// Load environment variables
dotenv.config();

const app = express();

const port = process.env.PORT || 5000;

// inbuild middleware to accept body in string from the client and parse it as json in serverside
app.use(express.json());



app.use("/api/users", userRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);
// app.use("/api/appointments", appointmentRoutes);


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



// Add this to server.js
async function testConnection(){
  try {
    const pool = await poolPromise;
    const result = await pool.query`SELECT @@VERSION`;
    console.log("SQL Server version:", result.recordset[0][""]);
  } catch (err) {
    console.error("Connection test failed:", err);
  }
}

async function startServer() {
  try {
    await testConnection();
    server.listen(port, '0.0.0.0', () => {
      console.log(`HTTP and WebSocket server running on port ${port}`);
    });
  } catch (err) {
    console.error("Error during startup:", err);
  }
}

startServer();

