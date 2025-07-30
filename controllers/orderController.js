import Order from "../models/order.js";
import Product from "../models/product.js";
import { isAdmin, isCustomer } from "./userController.js";
import Stripe from 'stripe';
import 'dotenv/config';

const stripe = new Stripe(process.env.VITE_STRIPE_SECRET_KEY);

export async function createOrder(req, res) {
  if (!isCustomer(req)) {
    return res.status(403).json({
      message: "Please login as customer to create orders",
    });
  }

  try {
    const latestOrder = await Order.find().sort({ orderId: -1 }).limit(1);
    console.log("Latest order:", latestOrder);

    let orderId;
    if (latestOrder.length == 0) {
      orderId = "CBC0001";
    } else {
      const currentOrderId = latestOrder[0].orderId;
      const numberString = currentOrderId.replace("CBC", "");
      const number = parseInt(numberString);
      const newNumber = (number + 1).toString().padStart(4, "0");
      orderId = "CBC" + newNumber;
    }

    const newOrderData = req.body;
    const newProductArray = [];

    for (let i = 0; i < newOrderData.orderedItems.length; i++) {
      const product = await Product.findOne({
        productId: newOrderData.orderedItems[i].productId,
      });

      if (product == null) {
        return res.status(404).json({
          message: `Product with id ${newOrderData.orderedItems[i].productId} not found`,
        });
      }

      newProductArray[i] = {
        productId: product.productId,
        name: product.productName,
        price: product.lastPrice,
        quantity: newOrderData.orderedItems[i].qty,
        image: product.images[0],
      };
    }
    console.log("New order items:", newProductArray);

    newOrderData.orderedItems = newProductArray;
    newOrderData.orderId = orderId;
    newOrderData.email = req.user.email;

    const order = new Order(newOrderData);
    const savedOrder = await order.save();
    console.log("Saved order:", savedOrder);

    res.json({
      message: "Order created",
      order: savedOrder
    });
  }catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({
      message: error.message,
    });
  }
}

export async function getOrders(req, res) {
  try {
    if (isCustomer(req)) {
      const orders = await Order.find({ email: req.user.email });
      console.log("Fetched orders for customer:", orders);
      res.json(orders);
      return;
    } else if (isAdmin(req)) {
      const orders = await Order.find({});
      console.log("Fetched orders for admin:", orders);
      res.json(orders);
      return;
    } else {
      return res.status(401).json({
        message: "Please login to view orders"
      });
    }
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      message: error.message,
    });
  }
}

export async function getQuote(req, res) {
  try {
    const newOrderData = req.body;
    const newProductArray = [];
    let total = 0;
    let labeledTotal = 0;

    for (let i = 0; i < newOrderData.orderedItems.length; i++) {
      const product = await Product.findOne({
        productId: newOrderData.orderedItems[i].productId,
      });

      if (product == null) {
        return res.status(404).json({
          message: `Product with id ${newOrderData.orderedItems[i].productId} not found`,
        });
      }
      labeledTotal += product.price * newOrderData.orderedItems[i].qty;
      total += product.lastPrice * newOrderData.orderedItems[i].qty;
      newProductArray[i] = {
        productId: product.productId,
        name: product.productName,
        price: product.lastPrice,
        labeledPrice: product.price,
        quantity: newOrderData.orderedItems[i].qty,
        image: product.images[0],
      };
    }
    console.log("Quote items:", newProductArray);
    newOrderData.orderedItems = newProductArray;
    newOrderData.total = total;

    res.json({
      orderedItems: newProductArray,
      total: total,
      labeledTotal: labeledTotal,
    });
  } catch (error) {
    console.error("Error generating quote:", error);
    res.status(500).json({
      message: error.message,
    });
  }
}

export async function updateOrder(req, res) {
  if (!isAdmin(req)) {
    return res.status(403).json({
      message: "Please login as admin to update orders",
    });
  }
  
  try {
    const orderId = req.params.orderId;
    const order = await Order.findOne({ orderId });

    if (order == null) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    const notes = req.body.notes;
    const status = req.body.status;

    const updateOrder = await Order.findOneAndUpdate(
      { orderId: orderId },
      { notes: notes, status: status },
      { new: true }
    );

    res.json({
      message: "Order updated",
      updateOrder: updateOrder
    });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({
      message: error.message,
    });
  }
}

export async function createPaymentIntent(req, res) {
  if (!isCustomer(req)) {
    return res.status(403).json({
      message: "Please login as customer to create payment",
    });
  }

  try {
    const { amount, name, address, phone, orderedItems } = req.body;
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency: 'lkr',
      metadata: {
        customer_name: name,
        customer_address: address,
        customer_phone: phone,
        products: JSON.stringify(orderedItems.map(item => ({
          id: item.productId,
          name: item.name,
          quantity: item.qty
        })))
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({
      message: error.message
    });
  }
}