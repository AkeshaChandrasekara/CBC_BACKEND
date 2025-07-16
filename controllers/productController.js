import Product from "../models/product.js";
import { isAdmin } from "./userController.js";

export function createProduct(req, res) {
  if (!isAdmin(req)) {
    res.json({
      message: "Please login as administrator to add products",
    });
    return;
  }

  const newProductData = req.body;

  const product = new Product(newProductData);

  product
    .save()
    .then(() => {
      res.json({
        message: "Product created",
      });
    })
    .catch((error) => {
      res.status(403).json({
        message: error,
      });
    });
}

export function getProducts(req, res) {
  Product.find({}).then((products) => {
    res.json(products);
  });
}

export function deleteProduct(req, res) {
  if (!isAdmin(req)) {
    res.status(403).json({
      message: "Please login as administrator to delete products",
    });
    return;
  }

  const productId = req.params.productId;

  Product.deleteOne({ productId: productId })
    .then(() => {
      res.json({
        message: "Product deleted",
      });
    })
    .catch((error) => {
      res.status(403).json({
        message: error,
      });
    });
}

export function updateProduct(req, res) {
  if (!isAdmin(req)) {
    res.status(403).json({
      message: "Please login as administrator to update products",
    });
    return;
  }

  const productId = req.params.productId;
  const newProductData = req.body;

  Product.updateOne({ productId: productId }, newProductData)
    .then(() => {
      res.json({
        message: "Product updated",
      });
    })
    .catch((error) => {
      res.status(403).json({
        message: error,
      });
    });
}

export async function getProductById(req, res) {
  try {
    const productId = req.params.productId;

    const product = await Product.findOne({ productId: productId });

    res.json(product);
  } catch (e) {
    res.status(500).json({
      e,
    });
  }
}

export async function searchProducts(req, res) {
  const query = req.params.query;
  try {
    const products = await Product.find({
      $or: [
        { productName: { $regex: query, $options: "i" } },
        { altNames: { $elemMatch: { $regex: query, $options: "i" } } },
      ],
    });

    res.json(products);
  } catch (e) {
    res.status(500).json({
      e,
    });
  }
}
// Add these to your productController.js
export async function addReview(req, res) {
  try {
    const productId = req.params.productId;
    const { rating, comment, userId } = req.body;

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const product = await Product.findOne({ productId });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Add new review
    product.reviews.push({ userId, rating, comment });

    // Calculate new average rating
    const totalRatings = product.reviews.reduce((sum, review) => sum + review.rating, 0);
    product.rating = totalRatings / product.reviews.length;

    await product.save();

    res.json({
      message: "Review added successfully",
      updatedProduct: product
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function getProductReviews(req, res) {
  try {
    const productId = req.params.productId;
    const product = await Product.findOne({ productId }, 'reviews rating');
    
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({
      reviews: product.reviews,
      averageRating: product.rating
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}