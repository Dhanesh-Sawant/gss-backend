const express = require("express");
const router = express.Router();

const {getMessageHistory} = require("../controllers/messageController");

const validateToken = require("../middleware/validateTokenHandler");


router.get("/:senderId/:receiverId", validateToken,getMessageHistory);

module.exports = router;