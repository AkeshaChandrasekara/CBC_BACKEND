import Review from "../models/review.js";
import Order from "../models/order.js";
import Product from "../models/product.js"; 
import { isCustomer } from "./userController.js";

export async function createReview(req, res) {
  if (!isCustomer(req)) {
    return res.status(403).json({
      message: "Please login as customer to add reviews",
    });
  }

  try {
    const { productId, rating, comment } = req.body;
    const email = req.user.email;
    const product = await Product.findOne({ productId });
    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const hasOrdered = await Order.exists({
      email: email,
      "orderedItems.name": product.productName,
    });

    if (!hasOrdered) {
      return res.status(400).json({
        message: "You can only review products you've purchased",
      });
    }

    const existingReview = await Review.findOne({ productId, email });
    if (existingReview) {
      return res.status(400).json({
        message: "You've already reviewed this product",
      });
    }

    const review = new Review({
      productId,
      email,
      rating,
      comment,
    });

    await review.save();

    res.json({
      message: "Review added successfully",
      review,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}


export async function getProductReviews(req, res) {
  try {
    const productId = req.params.productId;
    const reviews = await Review.find({ productId }).sort({ date: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

export async function getAverageRating(req, res) {
  try {
    const productId = req.params.productId;
    const result = await Review.aggregate([
      { $match: { productId } },
      { $group: { _id: null, averageRating: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);

    res.json({
      averageRating: result[0]?.averageRating || 0,
      count: result[0]?.count || 0,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}