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
  location: {
    type: String,
    trim: true,
  },
  website: {
    type: String,
    trim: true,
  },
  image: {
    type: String,
    default: "",
  },
  images: {
    type: [String],
    default: [],
  },
  qrCode: { type: String },
  qrCodeExpiresAt: { type: Date },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  emailVerified: { type: Boolean, default: false },
});

const Hospital = mongoose.model("Hospital", HospitalSchema);
export default Hospital;
