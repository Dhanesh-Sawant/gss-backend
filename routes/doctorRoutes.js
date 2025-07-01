const express = require("express");
const router = express.Router();

const {registerDoctor, loginDoctor, currentDoctor, getAllDoctors} = require("../controllers/doctorController");
const validateToken = require("../middleware/validateTokenHandler");

router.route("/register").post(registerDoctor);
router.route("/login").post(loginDoctor);
router.get("/current",validateToken,currentDoctor)

router.get('/all',validateToken,getAllDoctors)


module.exports = router;