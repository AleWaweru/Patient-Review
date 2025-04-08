import Hospital from "../models/HospitalModel.js";
import User from "../models/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateQRCode, regenerateQRCodes } from "../utils/GenQrCode.js";
import mongoose from "mongoose";


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


    // Generate a JWT token for the hospital
    
    const token = jwt.sign({ email, role: "hospital" }, process.env.JWT_SECRET, {
      expiresIn: "7d", // Token valid for 7 days
    });

    console.log("token", token);


    const hospital = new Hospital({ name, email, authToken: token});
    // Generate QR Code
    hospital.qrCode = await generateQRCode(hospital._id);
    hospital.qrCodeExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // Expires in 24 hours

    await hospital.save();

    const hospitalUser = new User({
      name,
      email,
      password,
      role: "hospital",
      hospitalId: hospital._id,
    });

    await hospitalUser.save();

    res.status(201).json({ message: "Hospital login account created successfully", hospital, token });
  } catch (error) {
    console.error("Error creating hospital:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const loginHospital = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const hospitalUser = await User.findOne({ email });

    if (!hospitalUser) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    const isMatch = await bcrypt.compare(password, hospitalUser.password);
    console.log("Password match:", isMatch);

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
    const {id} = req.params;
    const {phone, address, website, image } = req.body;

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
    if (address) hospital.address = address;
    if (website) hospital.website = website;
    if (image) hospital.image = image;

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
    console.log("Hospital ID:", id);

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

// Run QR code regeneration every hour
setInterval(regenerateQRCodes, 60 * 60 * 1000);

export { createHospital,loginHospital, updateHospitalProfile, getAllHospitals,getHospitalById };
