import{ sql, poolPromise } from '../config/dbConnection.js';

class ConversationService {

  async getUserMostRecentConversations(userId) {
    
    try {
    const pool = await poolPromise;

    // Step 1: Get all patient IDs for this user
    const patientsResult = await pool.request()
      .input('userId', sql.Int, userId)
      .query('SELECT patient_id FROM patients WHERE user_id = @userId');

    // console.log(patientsResult)
    
    const patientIds = patientsResult.recordset.map(p => p.patient_id);

    console.log(patientIds)

    if (patientIds.length === 0) return res.json([]);

    // Step 2: Get conversations for these patients
    const result = await pool.request()
      .input('patientIds', sql.NVarChar, patientIds.join(','))
      .query(`
        SELECT 
                c.id AS conversation_id,
                d.doctor_id,
                d.name AS doctor_name,
                p.patient_id,
                p.fullname AS patient_name,
                m.content AS last_message,
                m.timestamp AS last_message_time
            FROM Conversations c
            JOIN Doctors d ON c.doctor_id = d.doctor_id
            JOIN Patients p ON c.patient_id = p.patient_id
            CROSS APPLY (
                SELECT TOP 1 content, timestamp
                FROM Messages
                WHERE (sender_id = d.doctor_id AND receiver_id = p.patient_id)
                    OR (sender_id = p.patient_id AND receiver_id = d.doctor_id)
                ORDER BY timestamp DESC
            ) m
            WHERE c.patient_id IN (SELECT value FROM STRING_SPLIT(@patientIds, ','))
            ORDER BY m.timestamp DESC
        `);
    
    return result.recordset;
    } catch (err) {
    return err;
    }
    
  }               

    async getDoctorMostRecentConversations(doctorId) {
    try {
        const pool = await poolPromise;

        // Step 1: Get all patient IDs for this doctor
        const patientsResult = await pool.request()
        .input('doctorId', sql.Int, doctorId)
        .query('SELECT patient_id FROM Conversations WHERE doctor_id = @doctorId');

        const patientIds = patientsResult.recordset.map(p => p.patient_id);
        if (patientIds.length === 0) return [];

        // Step 2: Get conversations for these doctor-patient pairs
        const result = await pool.request()
        .input('patientIds', sql.NVarChar, patientIds.join(','))
        .input('doctorId', sql.Int, doctorId)
        .query(`
            SELECT 
            c.id AS conversation_id,
            d.doctor_id,
            d.name AS doctor_name,
            p.patient_id,
            p.fullname AS patient_name,
            m.content AS last_message,
            m.timestamp AS last_message_time
            FROM Conversations c
            JOIN Doctors d ON c.doctor_id = d.doctor_id
            JOIN Patients p ON c.patient_id = p.patient_id
            CROSS APPLY (
            SELECT TOP 1 content, timestamp
            FROM Messages
            WHERE (sender_id = @doctorId AND receiver_id = p.patient_id)
                OR (sender_id = p.patient_id AND receiver_id = @doctorId)
            ORDER BY timestamp DESC
            ) m
            WHERE c.doctor_id = @doctorId
            AND c.patient_id IN (SELECT value FROM STRING_SPLIT(@patientIds, ','))
            ORDER BY m.timestamp DESC
        `);
        
        return result.recordset;
    } catch (err) {
        throw new Error(`Failed to get doctor conversations: ${err.message}`);
    }
    }

    async addConversation(patient_id, doctor_id, last_message, last_message_time, created_at){
        try {
            console.log(`printing the patientid and doctorid: ${patient_id} , ${doctor_id}`);

            const pool = await poolPromise;
            
            const result = await pool.request()
            .input('patientId', sql.Int, patient_id)
            .input('doctorId', sql.Int, doctor_id)
            .input('lastMessage', sql.NVarChar, last_message)
            .input('lastMessageTime', sql.DateTime, last_message_time)
            .input('createdAt', sql.DateTime, created_at)
            .query(`
                IF EXISTS (
                    SELECT 1 
                    FROM Conversations 
                    WHERE patient_id = @patientId AND doctor_id = @doctorId
                )
                BEGIN
                    UPDATE Conversations
                    SET last_message = @lastMessage,
                        last_message_time = @lastMessageTime,
                        updated_at = GETDATE()
                    WHERE patient_id = @patientId AND doctor_id = @doctorId
                END
                ELSE
                BEGIN
                    INSERT INTO Conversations (
                        patient_id, 
                        doctor_id, 
                        last_message, 
                        last_message_time, 
                        created_at,
                        updated_at
                    )
                    VALUES (
                        @patientId, 
                        @doctorId, 
                        @lastMessage, 
                        @lastMessageTime, 
                        GETDATE(),
                        GETDATE()
                    )
                END

            `);
            
            return result.rowsAffected[0] > 0; // Return true if inserted successfully
        } catch (err) {
            console.error('Error adding conversation:', err.message);
            throw new Error('Failed to add conversation');
        }
    }


}

export default new ConversationService();