import asyncHandler from "express-async-handler";
import { sql, poolPromise } from "../config/dbConnection.js";
import { constants } from "../constants.js";

const getDoctorByEmail = asyncHandler(async (email) => {
  const pool = await poolPromise;
  
  const result = await pool.request()
    .input('email', sql.NVarChar, email)
    .query(`
      SELECT * FROM doctors 
      WHERE email = @email
    `);
    
  return result.recordset[0] || null;
});

const getalldoctors = asyncHandler(async () => {
  const pool = await poolPromise;
  const result = await pool.request()
  .query(
    `SELECT * FROM Doctors`
  );
  console.log(typeof result.recordset[1]);
// Output: 'object'

  return result.recordset;
})

// Helper function to create doctor in DB
const createDoctor = async (doctorData) => {
  const pool = await poolPromise;
  
  try {
    const result = await pool.request()
      // Existing fields
      .input('username', sql.NVarChar, doctorData.username)
      .input('email', sql.NVarChar, doctorData.email)
      .input('password', sql.NVarChar, doctorData.password)
      .input('specialization', sql.NVarChar, doctorData.specialization)
      .input('experienceYears', sql.Int, doctorData.experienceYears)
      .input('villageName', sql.NVarChar, doctorData.villageName)
      .input('district', sql.NVarChar, doctorData.district)
      .input('state', sql.NVarChar, doctorData.state)
      .input('languages', sql.NVarChar, doctorData.languages.join(','))
      .input('contactNumber', sql.NVarChar, doctorData.contactNumber)
      .input('availableTimeSlots', sql.NVarChar, JSON.stringify(doctorData.availableTimeSlots))
      .input('availableDays', sql.NVarChar, doctorData.availableDays.join(','))
      .input('telemedicineSupported', sql.Bit, doctorData.telemedicineSupported)
      
      // New fields
      .input('name', sql.NVarChar, doctorData.name || '')
      .input('about', sql.NVarChar, doctorData.about || '')
      .input('rating', sql.Decimal(3,1), doctorData.rating || 0.0)
      .input('clinicAddress', sql.NVarChar, doctorData.clinicAddress || '')
      .input('consultationFee', sql.Decimal(10,2), doctorData.consultationFee || 0)
      .input('availabilityStatus', sql.NVarChar, doctorData.availabilityStatus || 'Available')
      
      .query(`
        INSERT INTO doctors (
          username, email, password, specialization, 
          experience_years, village_name, district, state,
          languages, contact_number, available_time_slots, 
          available_days, telemedicine_supported,
          name, about, rating, clinic_address,
          consultation_fee, availability_status, created_at, updated_at
        )
        OUTPUT inserted.*
        VALUES (
          @username, @email, @password, @specialization,
          @experienceYears, @villageName, @district, @state,
          @languages, @contactNumber, @availableTimeSlots,
          @availableDays, @telemedicineSupported,
          @name, @about, @rating, @clinicAddress,
          @consultationFee, @availabilityStatus, GETDATE(), GETDATE()
        )
      `);
      
    return result.recordset[0];
  } catch (error) {
    console.error("Error creating doctor:", error);
    return null;
  }
};


export {getDoctorByEmail, createDoctor, getalldoctors}