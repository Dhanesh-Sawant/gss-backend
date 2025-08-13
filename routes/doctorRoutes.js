import express from "express";
const router = express.Router();

import { registerDoctor, loginDoctor, currentDoctor, getAllDoctors } from "../controllers/doctorController.js";
import validateToken from "../middleware/validateTokenHandler.js";

router.route("/register").post(registerDoctor);
router.route("/login").post(loginDoctor);
router.get("/current",validateToken,currentDoctor)

router.get('/all',validateToken,getAllDoctors)


export default router;