import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },
    rating: { type: Number, required: true },
    text: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // New fields:
    isFlagged: { type: Boolean, default: false }, // <-- Added
    flagReason: { type: [String], default: [] }, // <-- Array of detected toxicities
  },
  { timestamps: true }
);

const ReviewModel = mongoose.model("Review", reviewSchema);

export default ReviewModel;
