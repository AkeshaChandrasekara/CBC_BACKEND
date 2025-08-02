import express from 'express';
import { createReview, getProductReviews, getUserReviewForProduct } from '../controllers/reviewController.js';

const reviewRouter = express.Router();

reviewRouter.post("/", createReview);
reviewRouter.get("/product/:productId", getProductReviews);
reviewRouter.get("/user/:productId", getUserReviewForProduct);

export default reviewRouter;