import mongoose from "mongoose";

const HospitalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true },
  },
  website: {
    type: String,
    trim: true,
  },
  image: {
    type: String, 
    default: "", 
  },
  qrCode: { type: String },  // Stores QR code image data
  qrCodeExpiresAt: { type: Date },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Hospital = mongoose.model("Hospital", HospitalSchema);
export default Hospital;
