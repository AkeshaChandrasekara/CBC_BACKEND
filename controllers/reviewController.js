import Review from "../models/review.js";
import Order from "../models/order.js";
import { isCustomer } from "./userController.js";

export async function createReview(req, res) {
  if (!isCustomer(req)) {
    return res.status(403).json({ message: "Please login as customer to add reviews" });
  }

  try {
    const { productId, rating, comment } = req.body;
    const userEmail = req.user.email;

    const hasOrdered = await Order.exists({
      email: userEmail,
      "orderedItems.productId": productId,
     status: { $exists: true }
    });

    if (!hasOrdered) {
      return res.status(400).json({ message: "You can only review products you've purchased" });
    }

    const existingReview = await Review.findOne({ productId, userEmail });
    if (existingReview) {
      return res.status(400).json({ message: "You've already reviewed this product" });
    }

    const review = new Review({
      productId,
      userEmail,
      rating,
      comment
    });

    await review.save();
    res.json({ message: "Review added successfully", review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function getProductReviews(req, res) {
  try {
    const productId = req.params.productId;
    const reviews = await Review.find({ productId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}