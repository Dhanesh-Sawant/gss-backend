import { sql, poolPromise } from '../config/dbConnection.js';
import { constants } from '../constants.js';


const createPatient = async (user_id, fullname, age, gender, phno, location, medical_history, allergies, curr_medications, emergency_contact_name, emergency_contact_phno) =>{
    const pool = await poolPromise;
    try {
        const result = await pool.request()
            .input('user_id',sql.Int,user_id)
            .input('fullname', sql.NVarChar(50), fullname)
            .input('age', sql.Int, age)
            .input('gender',sql.NVarChar(20),gender)
            .input('phno', sql.VarChar(20), phno)
            .input('location',sql.NVarChar(sql.MAX),location)
            .input('medical_history',sql.NVarChar(sql.MAX),medical_history)
            .input('allergies',sql.NVarChar(sql.MAX),allergies)
            .input('curr_medications',sql.NVarChar(sql.MAX),curr_medications)
            .input('emergency_contact_name',sql.NVarChar(50),emergency_contact_name)
            .input('emergency_contact_phno',sql.VarChar(20),emergency_contact_phno)
            .query(`
                INSERT INTO patients (
                    user_id, fullname, age, gender, phno, location, medical_history, allergies, curr_medications, emergency_contact_name, emergency_contact_phno, createdAt, updatedAt
                )
                OUTPUT 
                    INSERTED.patient_id, INSERTED.user_id, INSERTED.fullname, INSERTED.age, INSERTED.gender, INSERTED.phno, 
                    INSERTED.location, INSERTED.medical_history, INSERTED.allergies, INSERTED.curr_medications, 
                    INSERTED.emergency_contact_name, INSERTED.emergency_contact_phno, INSERTED.createdAt, INSERTED.updatedAt
                VALUES (
                    @user_id, @fullname, @age, @gender, @phno, @location, @medical_history, @allergies, @curr_medications, 
                    @emergency_contact_name, @emergency_contact_phno, GETDATE(), GETDATE()
                )
            `);

        console.log("printing the recordset : ",result.recordset);
        if (result.recordset.length > 0) {
            return result.recordset[0]; 
        }
        else{
            // throw new Error('patient creation failed');
            return null;
        }

        
    } catch (error) {
        // Handle duplicate email error (SQL Server error code 2627)
        if (error.number === 2627) {
            res.status(constants.VALIDATION_ERROR);
            throw new Error('Email already exists');
        }
        res.status = constants.SERVER_ERROR;
        throw new Error('Database error: ' + error.message);
    }
}


const getPatientList = async (user_id) => {
    console.log("getting the patient list for userid: ",user_id)
    const pool = await poolPromise;
    try{
        const result = await pool.request()
        .input('user_id',sql.Int,user_id)
        .query(`
        SELECT 
          patient_id, 
          user_id, 
          fullname, 
          age, 
          gender, 
          phno, 
          location, 
          medical_history, 
          allergies, 
          curr_medications, 
          emergency_contact_name, 
          emergency_contact_phno, 
          createdAt, 
          updatedAt
        FROM patients 
        WHERE user_id = @user_id
      `);

        console.log("printing the recordset : ",result.recordset);
        
        return result.recordset; 

    }
    catch(error){
        res.status = constants.SERVER_ERROR;
        throw new Error('Database error: ' + error.message);
    }
}


export {createPatient,getPatientList}