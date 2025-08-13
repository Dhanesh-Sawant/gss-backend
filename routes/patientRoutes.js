import express from "express";
const router = express.Router();

import { newPatient, getPatients } from "../controllers/patientController.js";
import validateToken from "../middleware/validateTokenHandler.js";

router.use(validateToken)

router.route("/newPatient").post(newPatient);
router.route("/getPatients").post(getPatients);


export default router;
