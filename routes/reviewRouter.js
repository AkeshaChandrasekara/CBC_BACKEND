// In your reviewRouter.js
import express from 'express';
import { createReview, getReviews } from '../controllers/reviewController.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }

  jwt.verify(token, process.env.SECRET, (err, decoded) => {
    if (err) {
      console.error("Token verification error:", err);
      return res.status(401).json({ message: "Invalid token" });
    }
    req.user = decoded;
    next();
  });
};


router.post("/", verifyToken, createReview);
router.get("/product/:productId", getReviews);

export default router;