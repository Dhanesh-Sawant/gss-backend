import express from "express";
import { getMessageHistory } from "../controllers/messageController.js";
import validateToken from "../middleware/validateTokenHandler.js";

const router = express.Router();

router.get("/:senderId/:receiverId", validateToken,getMessageHistory);

export default router;