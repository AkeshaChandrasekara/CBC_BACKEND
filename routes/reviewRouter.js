import express from 'express';
import { addReview, getProductReviews } from '../controllers/reviewController.js';
import verifyToken from './userRouter.js';

const reviewRouter = express.Router();

reviewRouter.post("/", verifyToken, addReview);
reviewRouter.get("/:productId", getProductReviews);

export default reviewRouter;