import express from 'express';
import { createReview, getReviewsByHospital } from '../controllers/reviewController.js';


const router = express.Router();

// Create a review
router.post('/createReview', createReview);

// Get all reviews for a hospital
router.get('/:hospitalId', getReviewsByHospital);

export default router;
