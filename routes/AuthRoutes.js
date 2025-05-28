import express from "express";
import { createAccount, loginAccount, logoutAccount, resetPassword, signUpGoogle, verifySentEmail } from "../controllers/AuthController.js";

const router = express.Router();

router.post("/register", createAccount);
router.post("/login", loginAccount);
router.post("/reset-password", resetPassword);
router.post("/logout", logoutAccount); 
router.get("/verify-email/:token", verifySentEmail);
router.post("/googleAuth", signUpGoogle);

export default router;
