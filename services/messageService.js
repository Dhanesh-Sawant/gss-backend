const { sql, poolPromise } = require('../config/dbConnection');

class MessageService {
  // Get full message history between doctor and patient
  async getMessagesBetweenDoctorAndPatient(doctorId, patientId) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('doctorId', sql.Int, doctorId)
        .input('patientId', sql.Int, patientId)
        .query(`
          SELECT 
            id,
            sender_id,
            receiver_id,
            content,
            timestamp
          FROM Messages
          WHERE 
            (sender_id = @doctorId AND receiver_id = @patientId)
            OR (sender_id = @patientId AND receiver_id = @doctorId)
          ORDER BY timestamp ASC
        `);
      return result.recordset;
    } catch (err) {
      throw new Error(`Failed to get messages: ${err.message}`);
    }
  }

  
}

module.exports = new MessageService();
