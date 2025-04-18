import express from "express";
import {
  createHospital,
  getAllHospitals,
  getHospitalById,
  loginHospital,
  updateHospitalProfile,
  verifyHospitalById,
} from "../controllers/hospitalController.js";
import { verifyToken } from "../middleware/jwt/verifyToken.js";
import { checkAdmin } from "../middleware/roles/roleMiddleware.js";

const router = express.Router();

router.post("/create", verifyToken, checkAdmin, createHospital);
router.post("/login", loginHospital);

router.put("/update-profile/:id", verifyToken, updateHospitalProfile);

router.get("/allHospitals", getAllHospitals);
router.post("/verify-qr-hospital", verifyHospitalById);
router.get("/:id", getHospitalById);

export default router;
