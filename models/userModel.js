// models/userModel.js
const asyncHandler = require("express-async-handler")
const { sql, poolPromise } = require('../config/dbConnection');
const { constants } = require("../constants");

const getAllUsers = asyncHandler( async () => {
  const pool = await poolPromise;
  const result = await pool.request().query('SELECT * FROM users');
  return result.recordset;
});

const getUserByEmail = asyncHandler( async (email) => {
  const pool = await poolPromise;
  console.log("email: ", email);
  const result = await pool.request()
    .input('emailParam', sql.NVarChar, email)
    .query('SELECT * FROM users WHERE email = @emailParam');
    console.log(result.recordset[0])
  return result.recordset;
});

const createUser = asyncHandler(async (username,email,password)=>{
    const pool = await poolPromise;
    try {
        const result = await pool.request()
            .input('username', sql.NVarChar(50), username)
            .input('email', sql.NVarChar(50), email)
            .input('password', sql.NVarChar(sql.MAX), password)
            .query(`
                INSERT INTO users (username, email, password, createdAt, updatedAt)
                OUTPUT INSERTED.user_id, INSERTED.username, INSERTED.email, INSERTED.createdAt, INSERTED.updatedAt
                VALUES (@username, @email, @password, GETDATE(), GETDATE())
            `);
        console.log("printing the recordset : ",result.recordset);
        if (result.recordset.length > 0) {
            return result.recordset[0];  // Return newly created user
        }
        res.status(constants.SERVER_ERROR);
        throw new Error('User creation failed');
        
    } catch (error) {
        // Handle duplicate email error (SQL Server error code 2627)
        if (error.number === 2627) {
            res.status(constants.VALIDATION_ERROR);
            throw new Error('Email already exists');
        }
        res.status = constants.SERVER_ERROR;
        throw new Error('Database error: ' + error.message);
    }
});

module.exports = {
  getAllUsers,
  getUserByEmail,
  createUser
};
