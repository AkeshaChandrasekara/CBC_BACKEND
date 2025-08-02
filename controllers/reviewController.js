import Review from "../models/review.js";
import Order from "../models/order.js";
import { isCustomer } from "./userController.js";

export async function createReview(req, res) {
  if (!isCustomer(req)) {
    return res.status(403).json({
      message: "Please login as customer to add reviews"
    });
  }

  try {
    const { productId, rating, comment } = req.body;
    const email = req.user.email;
    const hasOrdered = await Order.findOne({
      email: email,
      "orderedItems.name": { $exists: true },
      status: "completed"
    });

    if (!hasOrdered) {
      return res.status(400).json({
        message: "You need to purchase this product before reviewing"
      });
    }

    const existingReview = await Review.findOne({ productId, email });
    if (existingReview) {
      return res.status(400).json({
        message: "You have already reviewed this product"
      });
    }

    const review = new Review({
      productId,
      email,
      rating,
      comment
    });

    await review.save();

    res.json({
      message: "Review added successfully",
      review
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
}

export async function getProductReviews(req, res) {
  try {
    const productId = req.params.productId;
    const reviews = await Review.find({ productId }).sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
}

export async function getUserReviewForProduct(req, res) {
  if (!isCustomer(req)) {
    return res.status(403).json({
      message: "Please login to view your review"
    });
  }

  try {
    const productId = req.params.productId;
    const email = req.user.email;

    const review = await Review.findOne({ productId, email });

    if (!review) {
      return res.status(404).json({
        message: "You haven't reviewed this product yet"
      });
    }

    res.json(review);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
}