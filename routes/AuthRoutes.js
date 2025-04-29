import express from "express";
import { createAccount, loginAccount, logoutAccount, resetPassword, signUpGoogle } from "../controllers/AuthController.js";

const router = express.Router();

router.post("/register", createAccount);
router.post("/login", loginAccount);
router.post("/reset-password", resetPassword);
router.post("/logout", logoutAccount); 
// Google authentication
router.post("/googleAuth", signUpGoogle);

export default router;
