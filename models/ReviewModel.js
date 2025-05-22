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
  },
  { timestamps: true }
);

const ReviewModel = mongoose.model("Review", reviewSchema);

export default ReviewModel;
