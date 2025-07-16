import express from 'express';
import { createOrder, getOrders, getQuote, updateOrder,createPaymentIntent,checkIfUserOrderedProduct } from '../controllers/orderController.js';

const orderRouter = express.Router();


orderRouter.post("/", createOrder)
orderRouter.get("/", getOrders)
orderRouter.post("/quote",getQuote)
orderRouter.put("/:orderId",updateOrder)
orderRouter.post("/create-payment-intent", createPaymentIntent);
orderRouter.get("/has-ordered/:productId", checkIfUserOrderedProduct);

export default orderRouter;