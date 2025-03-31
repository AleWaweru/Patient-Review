import express from "express";
import {
  createHospital,
  updateHospitalProfile,
} from "../controllers/hospitalController.js";
import { verifyToken } from "../middleware/jwt/verifyToken.js";
import {
  checkAdmin,
  checkHospital,
} from "../middleware/roles/roleMiddleware.js";

const router = express.Router();

router.post("/create", verifyToken, checkAdmin, createHospital);

router.put(
  "/update-profile",
  verifyToken,
  checkHospital,
  updateHospitalProfile
);

router;

export default router;
