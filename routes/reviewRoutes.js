import express from 'express';
import { createReview, getDailyReviewStats, getReviewsByHospital, getReviewSummary } from '../controllers/reviewController.js';


const router = express.Router();

// Create a review
router.post('/createReview', createReview);

// Get all reviews for a hospital
router.get('/getReviewsByHospital/:hospitalId', getReviewsByHospital);
router.get('/dailyStats/:hospitalId', getDailyReviewStats);
router.get('/reviewSummary/:hospitalId', getReviewSummary);

export default router;
