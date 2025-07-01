const express = require("express");
const router = express.Router();

const {getUserMostRecentConversations, getDoctorMostRecentConversations, addConversation} = require("../controllers/conversationController");

const validateToken = require("../middleware/validateTokenHandler");

router.post("/addConversation",validateToken,addConversation)

router.get("/patient/:userId",validateToken,getUserMostRecentConversations)
router.get("/doctor/:doctorId",validateToken,getDoctorMostRecentConversations)


module.exports = router;