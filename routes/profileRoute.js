import express from "express";
import { verifyToken } from "../middleware/jwt/verifyToken.js";
import {
  createProfile,
  getProfile,
  updateProfile,
} from "../controllers/ProfileController.js";

const router = express.Router();

// Route to create a profile
router.post("/create", verifyToken, createProfile);

// Route to update the profile
router.put("/update", verifyToken, updateProfile);
router.get("/", verifyToken, getProfile);

export default router;
