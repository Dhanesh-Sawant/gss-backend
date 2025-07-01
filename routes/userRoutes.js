const express = require("express");
const router = express.Router();

const {registerUser, loginUser, currentUser} = require("../controllers/userController");
const validateToken = require("../middleware/validateTokenHandler");

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
// router.post("/login", (req, res, next) => {
//   console.log("✅ /login route hit!");
//   next();
// }, loginUser);

router.get("/current",validateToken,currentUser)


module.exports = router;