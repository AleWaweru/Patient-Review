import QRCode from "qrcode";
import Hospital from "../models/HospitalModel.js";
import jwt from "jsonwebtoken";

/**
 * Generates a secure QR code for a hospital.
 * @param {string} hospitalId 
 * @returns {string} 
 */
const generateQRCode = async (hospitalId) => {
  const hospital = await Hospital.findById(hospitalId);
  if (!hospital) {
    throw new Error("Hospital not found.");
  }

  const reviewUrl = `${process.env.FRONTEND_URL}/review/${hospitalId}`;
  return await QRCode.toDataURL(reviewUrl);
};


 //Regenerates QR codes and tokens for expired hospitals.

const regenerateQRCodes = async () => {
  const expiredHospitals = await Hospital.find({
    qrCodeExpiresAt: { $lte: new Date() },
  });

  for (const hospital of expiredHospitals) {
    const newToken = jwt.sign(
      { email: hospital.email, role: "hospital" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    hospital.authToken = newToken;
    hospital.qrCode = await generateQRCode(hospital._id);
    hospital.qrCodeExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await hospital.save();
  }
};

export { generateQRCode, regenerateQRCodes };
