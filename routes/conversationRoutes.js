import express from "express";
const router = express.Router();

import { 
  getUserMostRecentConversations, 
  getDoctorMostRecentConversations, 
  addConversation 
} from "../controllers/conversationController.js";

import validateToken from "../middleware/validateTokenHandler.js";

router.post("/addConversation",validateToken,addConversation)

router.get("/patient/:userId",validateToken,getUserMostRecentConversations)
router.get("/doctor/:doctorId",validateToken,getDoctorMostRecentConversations)

export default router;