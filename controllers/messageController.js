import { sql, poolPromise } from "../config/dbConnection.js";


// REST API for message history
export const getMessageHistory = async (req, res) => {
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
};

