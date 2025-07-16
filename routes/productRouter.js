import express from 'express';
import { createProduct, deleteProduct, getProductById, getProducts, searchProducts, updateProduct,addReview, getProductReviews } from '../controllers/productController.js';

const productRouter = express.Router();

productRouter.post("/",createProduct)
productRouter.get("/",getProducts)
productRouter.get("/search/:query",searchProducts)
productRouter.get("/:productId",getProductById)
productRouter.delete("/:productId",deleteProduct)
productRouter.put("/:productId",updateProduct)


productRouter.post("/:productId/reviews", addReview);
productRouter.get("/:productId/reviews", getProductReviews);


export default productRouter; 