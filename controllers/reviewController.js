import axios from "axios";
import ReviewModel from "../models/ReviewModel.js";
import mongoose from "mongoose";
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

export const getDailyReviewStats = async (req, res) => {
  const { hospitalId } = req.params;
  const { interval = "day" } = req.query;

  let dateFormat;
  switch (interval) {
    case "week":
      dateFormat = "%Y-%U"; // Year-week format
      break;
    case "month":
      dateFormat = "%Y-%m"; // Year-month format
      break;
    case "day":
    default:
      dateFormat = "%Y-%m-%d"; // Year-month-day format
      break;
  }

  try {
    const stats = await ReviewModel.aggregate([
      {
        $match: {
          hospitalId: new mongoose.Types.ObjectId(hospitalId),
        },
      },
      {
        $project: {
          date: { $dateToString: { format: dateFormat, date: "$createdAt" } },
          isPositive: { $gte: ["$rating", 3] },
        },
      },
      {
        $group: {
          _id: "$date",
          positive: {
            $sum: {
              $cond: [{ $eq: ["$isPositive", true] }, 1, 0],
            },
          },
          negative: {
            $sum: {
              $cond: [{ $eq: ["$isPositive", false] }, 1, 0],
            },
          },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    res.status(200).json(stats);
  } catch (error) {
    console.error("Error in getDailyReviewStats:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};


export const getReviewSummary = async (req, res) => {
  const { hospitalId } = req.params;
  const { period } = req.query; // expected values: 'day', 'week', 'month'

  try {
    let startDate = new Date();

    switch (period) {
      case "day":
        startDate.setDate(startDate.getDate() - 1);
        break;
      case "week":
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      default:
        // Default to last week if no or invalid period provided
        startDate.setDate(startDate.getDate() - 7);
    }

    const reviews = await ReviewModel.find({
      hospitalId,
      createdAt: { $gte: startDate },
    });

    if (reviews.length === 0) {
      return res.status(404).json({ message: "No reviews found for the selected period" });
    }

    const combinedText = reviews.map((r) => r.text).join(". ");

    const summaryResponse = await axios.post(
      "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
      { inputs: combinedText },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        },
      }
    );

    const summary = summaryResponse.data[0]?.summary_text || "No summary generated.";

    res.status(200).json({ summary });
  } catch (error) {
    console.error("Error generating summary by period:", error.message);
    res.status(500).json({ error: "Could not generate summary" });
  }
};

