const express = require("express");
const router = express.Router();

const {getMessagesBetweenDoctorAndPatient} = require("../controllers/messageController");

const validateToken = require("../middleware/validateTokenHandler");

router.get("/",validateToken,getMessagesBetweenDoctorAndPatient)


module.exports = router;