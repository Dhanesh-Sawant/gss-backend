import express from "express";
const router = express.Router();

import {registerUser, loginUser, currentUser} from "../controllers/userController.js";
import validateToken from "../middleware/validateTokenHandler.js";

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
// router.post("/login", (req, res, next) => {
//   console.log("✅ /login route hit!");
//   next();
// }, loginUser);

router.get("/current",validateToken,currentUser)


export default router;