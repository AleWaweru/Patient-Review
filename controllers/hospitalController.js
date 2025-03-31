import Hospital from "../models/HospitalModel.js";
import User from "../models/UserModel.js";
import bcrypt from "bcrypt";
import { generateQRCode, regenerateQRCodes } from "../utils/GenQrCode.js";


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

    const hashedPassword = await bcrypt.hash(password, 10);

    const hospital = new Hospital({ name, email });

    // Generate QR Code
    hospital.qrCode = await generateQRCode(hospital._id);
    hospital.qrCodeExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // Expires in 24 hours

    await hospital.save();

    const hospitalUser = new User({
      name,
      email,
      password: hashedPassword,
      role: "hospital",
      hospitalId: hospital._id,
    });

    await hospitalUser.save();

    res.status(201).json({ message: "Hospital login account created successfully", hospital });
  } catch (error) {
    console.error("Error creating hospital:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateHospitalProfile = async (req, res) => {
  try {
    if (req.user.role !== "hospital") {
      return res.status(403).json({ message: "Access denied. Hospitals only." });
    }

    const { phone, address, website, image } = req.body;
    const hospital = await Hospital.findById(req.user.hospitalId);

    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    hospital.phone = phone || hospital.phone;
    hospital.address = address || hospital.address;
    hospital.website = website || hospital.website;
    hospital.image = image || hospital.image;

    await hospital.save();

    res.status(200).json({ message: "Hospital profile updated successfully", hospital });
  } catch (error) {
    console.error("Error updating hospital profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


// Run QR code regeneration every hour
setInterval(regenerateQRCodes, 60 * 60 * 1000);

export { createHospital, updateHospitalProfile };
