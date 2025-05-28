import Hospital from "../models/HospitalModel.js";
import User from "../models/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateQRCode, regenerateQRCodes } from "../utils/GenQrCode.js";
import mongoose from "mongoose";
import crypto from "crypto";
import TokenModel from "../models/TokenModel.js";
import { verifyEmail } from "../utils/emailService.js";

const createHospital = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already in use" });
    }

    // Create the hospital document first
    const hospital = new Hospital({ name, email });
    await hospital.save();

    // Generate QR code and set expiration
    hospital.qrCode = await generateQRCode(hospital._id);
    hospital.qrCodeExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await hospital.save();

    // Create the hospital user (emailVerified = false by default)
    const hospitalUser = new User({
      name,
      email,
      password,
      role: "hospital",
      hospitalId: hospital._id,
      emailVerified: false,
    });
    await hospitalUser.save();

    // Generate email verification token
    const emailToken = crypto.randomBytes(32).toString("hex");
    const newToken = new TokenModel({
      userId: hospitalUser._id,
      token: emailToken,
    });
    await newToken.save();

    // Send verification email
    const verificationLink = `${process.env.SERVER_DOMAIN}/api/auth/verify-email/${emailToken}`;
    await verifyEmail(email, verificationLink);

    res.status(201).json({
      message:
        "Hospital account created. Please verify your email to activate.",
      hospital,
    });
  } catch (error) {
    console.error("Error creating hospital:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const loginHospital = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const hospitalUser = await User.findOne({ email });

    if (!hospitalUser || hospitalUser.role !== "hospital") {
      return res.status(404).json({ message: "Hospital not found" });
    }

    if (!hospitalUser.emailVerified) {
      return res
        .status(403)
        .json({ message: "Please verify your email before logging in." });
    }

    const isMatch = await bcrypt.compare(password, hospitalUser.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      {
        email: hospitalUser.email,
        role: hospitalUser.role,
        hospitalId: hospitalUser.hospitalId,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.error("Error logging in hospital:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateHospitalProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { phone, location, website, image, images } = req.body;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid hospital ID" });
    }

    const hospital = await Hospital.findById(id);

    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    // Update fields if provided
    if (phone) hospital.phone = phone;
    if (location) hospital.location = location;
    if (website) hospital.website = website;
    if (image) hospital.image = image;
    if (Array.isArray(images)) {
      hospital.images = images;
    }

    await hospital.save();

    res.json({ message: "Hospital profile updated successfully", hospital });
  } catch (error) {
    console.error("Error updating hospital profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getAllHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find().sort({ createdAt: -1 });
    res.status(200).json({ hospitals });
  } catch (error) {
    console.error("Error getting hospitals:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get hospital profile by ID (PUBLIC)
const getHospitalById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid hospital ID" });
    }

    const hospital = await Hospital.findById(id);
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    res.status(200).json({ hospital });
  } catch (error) {
    console.error("Error getting hospital by ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Verify Hospital by ID (via QR Code)
const verifyHospitalById = async (req, res) => {
  try {
    const { hospitalId } = req.body;

    if (!hospitalId || !mongoose.Types.ObjectId.isValid(hospitalId)) {
      return res
        .status(400)
        .json({ message: "Invalid or missing hospital ID" });
    }

    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    if (hospital.qrCodeExpiresAt && hospital.qrCodeExpiresAt < new Date()) {
      return res.status(403).json({ message: "QR Code has expired" });
    }

    res.status(200).json({ message: "QR Code is valid", hospital });
  } catch (error) {
    console.error("Error verifying hospital by ID:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Run QR code regeneration every hour
setInterval(regenerateQRCodes, 60 * 60 * 1000);

export {
  createHospital,
  loginHospital,
  updateHospitalProfile,
  getAllHospitals,
  getHospitalById,
  verifyHospitalById,
};
