import express from 'express';
import { createReview, getProductReviews, getAverageRating } from '../controllers/reviewController.js';

const reviewRouter = express.Router();

reviewRouter.post("/", createReview);
reviewRouter.get("/:productId", getProductReviews);
reviewRouter.get("/average/:productId", getAverageRating);

export default reviewRouter;