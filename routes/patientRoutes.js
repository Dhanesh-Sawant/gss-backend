const express = require("express");
const router = express.Router();

const {newPatient,getPatients} = require("../controllers/patientController");
const validateToken = require("../middleware/validateTokenHandler");

router.use(validateToken)

router.route("/newPatient").post(newPatient);
router.route("/getPatients").post(getPatients);


module.exports = router;
