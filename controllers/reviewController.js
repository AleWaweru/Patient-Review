import axios from "axios";
import ReviewModel from "../models/ReviewModel.js";

const PERSPECTIVE_API_KEY = process.env.PERSPECTIVE_API_KEY;
export const createReview = async (req, res) => {
  const { hospitalId, rating, text, user } = req.body;

  if (!hospitalId || !rating || !text || !user) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const response = await axios.post(
      "https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze",
      {
        comment: { text },
        requestedAttributes: {
          TOXICITY: {},
          INSULT: {},
          PROFANITY: {},
          THREAT: {},
          SEXUALLY_EXPLICIT: {},
        },
      },
      {
        params: { key: PERSPECTIVE_API_KEY },
      }
    );

    // Thresholds
    const thresholds = {
      TOXICITY: 0.7,
      INSULT: 0.6,
      PROFANITY: 0.6,
      THREAT: 0.5,
      SEXUALLY_EXPLICIT: 0.5,
    };

    // Check if any attribute exceeds its threshold
    const flaggedAttributes = [];
    for (const attr in thresholds) {
      const score =
        response.data.attributeScores?.[attr]?.summaryScore?.value || 0;
      if (score >= thresholds[attr]) {
        flaggedAttributes.push({ attribute: attr, score });
      }
    }

    if (flaggedAttributes.length > 0) {
      return res.status(403).json({
        message:
          "Your review contains content that violates our professional standards.",
        flaggedAttributes,
      });
    }

    const review = await ReviewModel.create({
      hospitalId,
      rating,
      text,
      user,
    });

    return res.status(201).json(review);
  } catch (error) {
    console.error("Error in createReview:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};

export const getReviewsByHospital = async (req, res) => {
  try {
    const reviews = await ReviewModel.find({
      hospitalId: req.params.hospitalId,
    })
      .populate("user", "name profileImage")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
