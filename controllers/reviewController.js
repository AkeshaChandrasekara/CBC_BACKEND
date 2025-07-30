import Review from "../models/review.js";
import Product from "../models/product.js";
import Order from "../models/order.js";

export async function createReview(req, res) {
  try {
    const { productId, rating, comment } = req.body;
    const email = req.user.email;

    if (!productId || !rating || !comment) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const hasOrdered = await Order.findOne({
      email,
      "orderedItems.productId": productId
    });

    if (!hasOrdered) {
      return res.status(403).json({
        message: "You must purchase this product to leave a review"
      });
    }

    const existingReview = await Review.findOne({ productId, email });
    if (existingReview) {
      return res.status(400).json({
        message: "You have already reviewed this product"
      });
    }

    const review = new Review({ productId, email, rating, comment });
    await review.save();

    const product = await Product.findOne({ productId });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.reviews.push({
      email,
      rating,
      comment,
      date: new Date()
    });

    const totalRating = product.reviews.reduce((sum, rev) => sum + rev.rating, 0);
    product.rating = totalRating / product.reviews.length;

    await product.save();

    res.status(201).json({
      message: "Review created successfully",
      review
    });

  } catch (error) {
    console.error("Review creation error:", error);
    res.status(500).json({ message: error.message });
  }
}

export async function getReviews(req, res) {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ productId })
      .sort({ date: -1 })
      .limit(50);
    
    res.json(reviews);
  } catch (error) {
    console.error("Get reviews error:", error);
    res.status(500).json({ message: error.message });
  }
}