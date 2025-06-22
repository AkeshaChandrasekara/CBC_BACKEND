import express from "express";
import { createProduct } from "../controllers/productController.js";


const productRouter = express.Router(); 

productRouter.get("/",createProduct );

export default productRouter;