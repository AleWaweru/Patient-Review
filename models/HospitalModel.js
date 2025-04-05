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
    trim: true,
  },
  address: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    zipCode: { type: String },
    country: { type: String },
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
