import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getDoctorByEmail, createDoctor, getalldoctors } from "../models/doctorModel.js";


//@desc Register the doctor
//@route POST /api/users/register
//@access PUBLIC

const registerDoctor = asyncHandler(async (req, res) => {
  
  const {
    username,
    email,
    password,
    name,
    about,
    specialization,
    experienceYears,
    rating,
    villageName,
    district,
    state,
    clinicAddress,
    consultationFee,
    availabilityStatus,
    languages,
    contactNumber,
    availableTimeSlots,
    availableDays,
    telemedicineSupported
  } = req.body;

  // Validate required fields
  const requiredFields = [
    'username', 'email', 'password', 'specialization', 
    'villageName', 'district', 'state', 'contactNumber'
  ];
  
  const missingFields = requiredFields.filter(field => !req.body[field]);
  
  if (missingFields.length > 0) {
    res.status(400);
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }

  // Check if doctor already exists
  const existingDoctor = await getDoctorByEmail(email);
  
  if (existingDoctor) {
    res.status(400);
    throw new Error("Doctor already registered with this email");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create doctor in database
  const newDoctor = await createDoctor({
    username,
    email,
    password: hashedPassword,
    name,
    about,
    specialization,
    experienceYears: experienceYears || 0,
    rating: rating || 0.0,
    villageName,
    district,
    state,
    clinicAddress,
    consultationFee: consultationFee || 0,
    availabilityStatus: availabilityStatus || 'Available',
    languages: languages || [],
    contactNumber,
    availableTimeSlots: availableTimeSlots || [],
    availableDays: availableDays || [],
    telemedicineSupported: telemedicineSupported || false
  });

  if (!newDoctor) {
    res.status(500);
    throw new Error("Error creating doctor profile");
  }

  // Return created doctor data (excluding password)
  res.status(201).json({
  id: newDoctor.id,
  username: newDoctor.username,
  email: newDoctor.email,
  name: newDoctor.name,
  about: newDoctor.about,
  specialization: newDoctor.specialization,
  experienceYears: newDoctor.experience_years,
  rating: newDoctor.rating,
  consultationFee: newDoctor.consultation_fee,
  availabilityStatus: newDoctor.availability_status,
  villageName: newDoctor.village_name,
  district: newDoctor.district,
  state: newDoctor.state,
  clinicAddress: newDoctor.clinic_address,
  languages: newDoctor.languages ? newDoctor.languages.split(',') : [],
  contactNumber: newDoctor.contact_number,
  availableTimeSlots: newDoctor.available_time_slots ? JSON.parse(newDoctor.available_time_slots) : [],
  availableDays: newDoctor.available_days ? newDoctor.available_days.split(',') : [],
  telemedicineSupported: newDoctor.telemedicine_supported,
  createdAt: newDoctor.created_at,
  updatedAt: newDoctor.updated_at
});

});



const loginDoctor = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    res.status(400);
    throw new Error("Both email and password are required");
  }

  console.log("Checking if doctor exists...");
  const existingDoctor = await getDoctorByEmail(email);

  if (!existingDoctor) {
    res.status(400);
    throw new Error("Doctor not registered. Please register first.");
  }

  console.log("Comparing passwords...");
  const passwordMatch = await bcrypt.compare(password, existingDoctor.password);
  
  if (passwordMatch) {
    const accessToken = jwt.sign(
      {
        doctor: {
          id: existingDoctor.doctor_id,  
          username: existingDoctor.username,
          name: existingDoctor.name,
          email: existingDoctor.email,
          about: existingDoctor.about,
          specialization: existingDoctor.specialization,
          experienceYears: existingDoctor.experience_years,
          rating: existingDoctor.rating,
          villageName: existingDoctor.village_name,
          district: existingDoctor.district,
          state: existingDoctor.state,
          clinicAddress: existingDoctor.clinic_address,
          consultationFee: existingDoctor.consultation_fee,
          availabilityStatus: existingDoctor.availability_status,
          languages: existingDoctor.languages, // Should be an array
          contactNumber: existingDoctor.contact_number,
          availableTimeSlots: existingDoctor.available_time_slots, // Should be an array
          availableDays: existingDoctor.available_days, // Should be an array
          telemedicineSupported: existingDoctor.telemedicine_supported
        }

      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "10m" }
    );

    console.log("Access token generated:", accessToken);
    
    // Return doctor info along with token (excluding password)
    res.status(200).json({
      accessToken
    });
  } else {
    res.status(401);
    throw new Error("Invalid password");
  }

});


const currentDoctor = asyncHandler ( async (req,res) => {

    res.status(200).json(req.user)
});

const getAllDoctors = asyncHandler (async (req,res)=>{
  const alldoctors = await getalldoctors();
  res.json({"response": alldoctors});
})

export {registerDoctor, loginDoctor, currentDoctor, getAllDoctors}
