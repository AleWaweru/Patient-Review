import ReviewModel from "../models/ReviewModel.js";
import * as toxicity from "@tensorflow-models/toxicity";
import * as tf from "@tensorflow/tfjs";

let model = null;

// Load model once
async function loadModelOnce(threshold = 0.9) {
  if (!model) {
    model = await toxicity.load(threshold);
  }
}

// Analyze review
async function analyzeReview(text) {
  await loadModelOnce();

  const predictions = await model.classify([text]);
  const detectedLabels = [];

  for (const prediction of predictions) {
    if (prediction.results[0].match) {
      detectedLabels.push(prediction.label);
    }
  }

  return detectedLabels; // return array of detected issues
}

export const createReview = async (req, res) => {
  const { hospitalId, rating, text, user } = req.body;

  if (!hospitalId || !rating || !text || !user) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const detectedIssues = await analyzeReview(text);

    const isFlagged = detectedIssues.length > 0; // if any toxicity is detected

    const reviewData = {
      hospitalId,
      rating,
      text,
      user,
      isFlagged,
      flagReason: detectedIssues,
    };

    const review = await ReviewModel.create(reviewData);

    if (isFlagged) {
      return res.status(201).json({
        message: 'Review posted but flagged for abusive content. Admin will review it.',
        review
      });
    } else {
      return res.status(201).json(review);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getReviewsByHospital = async (req, res) => {
  try {
    const reviews = await ReviewModel.find({ hospitalId: req.params.hospitalId })
      .populate('user', 'name profileImage')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

