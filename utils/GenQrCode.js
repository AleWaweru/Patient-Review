import QRCode from "qrcode";

const generateQRCode = async (hospitalId) => {
  const reviewUrl = `${process.env.FRONTEND_URL}/review/${hospitalId}`;
  return await QRCode.toDataURL(reviewUrl);
};

const regenerateQRCodes = async () => {
  const expiredHospitals = await Hospital.find({
    qrCodeExpiresAt: { $lte: new Date() },
  });

  for (const hospital of expiredHospitals) {
    hospital.qrCode = await generateQRCode(hospital._id);
    hospital.qrCodeExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // New expiration

    await hospital.save();
  }
};

export { generateQRCode, regenerateQRCodes };
