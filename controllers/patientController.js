import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createPatient, getPatientList } from "../models/patientModel.js";

//@desc add new patient
//@route POST /api/patients/newPatient
//@access PRIVATE
const newPatient = asyncHandler ( async (req,res) => {
    console.log("entered the function...")
    const {user_id, fullname, age, gender, phno, location, medical_history, allergies, curr_medications, emergency_contact_name, emergency_contact_phno} = req.body;
    
    if (!user_id ||!fullname ||!age ||  !gender ||  !phno ||  !location ||  !medical_history ||  !allergies ||  !curr_medications ||  !emergency_contact_name ||  !emergency_contact_phno) {
        res.status(400);
        throw new Error("All fields are necessary");
    }

    const result = await createPatient(user_id, fullname, age, gender, phno, location, medical_history, allergies, curr_medications, emergency_contact_name, emergency_contact_phno);

    // if(existingUser.length!==0){
    //     res.status(400);
    //     throw new Error("User already Registered..");
    // }

    console.log("result of createPatient: ",result);
  

    if(result){
        res.status(201).json({
            "patient_id": result.patient_id,
            "user_id": result.user_id,
            "fullname": result.fullname,
            "age": result.age,
            "gender": result.gender,
            "phno": result.phno,
            "location": result.location,
            "medical_history": result.medical_history,
            "allergies": result.allergies,
            "curr_medications": result.curr_medications,
            "emergency_contact_name": result.emergency_contact_name,
            "emergency_contact_phno": result.emergency_contact_phno,
            "createdAt": result.createdAt,
            "updatedAt": result.updatedAt
        });
    }

    else{
        res.status(400);
        throw new Error("Error in creation of patient!!")
    }

});

//@desc get existing patient(s) of user_id
//@route GET /api/patients/getPatient
//@access PRIVATE
const getPatients = asyncHandler ( async (req,res) => {
    console.log("entered the function...")
    const {user_id} = req.body;
    
    if (!user_id) {
        res.status(400);
        throw new Error("All fields are necessary");
    }

    const result = await getPatientList(user_id);


    console.log("result of getPatientList: ",result);
  
    if(result){
        res.status(201).json({"patients" : result});
    }

    else{
        res.status(400);
        throw new Error("Error in getting patients!!")
    }

});

export {newPatient,getPatients};