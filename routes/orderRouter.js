import express from 'express';
import { createOrder, getOrders, getQuote, updateOrder,createPaymentIntent,createCheckoutSession } from '../controllers/orderController.js';

const orderRouter = express.Router();


orderRouter.post("/", createOrder)
orderRouter.get("/", getOrders)
orderRouter.post("/quote",getQuote)
orderRouter.put("/:orderId",updateOrder)
orderRouter.post("/create-payment-intent", createPaymentIntent);
orderRouter.post("/create-checkout-session", createCheckoutSession);

export default orderRouter;