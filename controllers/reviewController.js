import ReviewModel from "../models/ReviewModel.js";

export const createReview = async (req, res) => {
  const { hospitalId, rating, text, user } = req.body;

  if (!hospitalId || !rating || !text || !user) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const reviewData = {
      hospitalId,
      rating,
      text,
      user,
    };

    const review = await ReviewModel.create(reviewData);

    return res.status(201).json(review);
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
