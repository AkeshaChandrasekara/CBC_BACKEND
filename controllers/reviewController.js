import Review from "../models/review.js";
import Order from "../models/order.js";
import Product from "../models/product.js";
import { isCustomer } from "./userController.js";

export async function addReview(req, res) {
  if (!isCustomer(req)) {
    return res.status(403).json({
      message: "Please login as customer to add reviews",
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
        message: "You must purchase this product before reviewing it"
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

    const reviews = await Review.find({ productId });
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / reviews.length;

    await Product.findOneAndUpdate(
      { productId },
      { 
        rating: averageRating,
        reviews: reviews.length 
      }
    );

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
    const reviews = await Review.find({ productId }).sort({ date: -1 });
    
    res.json(reviews);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
}