import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  image: { type: String, default: "", required: false },
}, { timestamps: true });

export default mongoose.model("Profile", profileSchema);
