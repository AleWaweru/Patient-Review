import express from "express";
import { createAccount, loginAccount, logoutAccount, resetPassword } from "../controllers/AuthController.js";

const router = express.Router();

router.post("/register", createAccount);
router.post("/login", loginAccount);
router.post("/reset-password", resetPassword);
router.post("/logout", logoutAccount); 

export default router;
