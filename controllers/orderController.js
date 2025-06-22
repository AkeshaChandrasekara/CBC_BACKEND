import Order  from "../models/order.js";
import { isCustomer } from "./userController.js";

export async function createOrder(req, res) {

    if (!isCustomer){
    res.status(400).json({ 
      message: "You are not a customer. Please login as a customer to create an order." 
    });

    }
  try {
    const latestOrder = await Order.find().sort({ date: -1 }).limit(1);

    let orderId;

    if (latestOrder.length === 0) {
      orderId = "CBC0001";
    } else {
      const currentOrderId = latestOrder[0].orderId;
      const numberString = currentOrderId.replace("CBC", "");
      const number = parseInt(numberString) + 1;
    
      const paddedNumber = number.toString().padStart(4, '0');
      orderId = `CBC${paddedNumber}`;
      
      if (number > 9999) {
        return res.status(400).json({ 
          message: "Order ID limit reached (maximum 9999 orders)" 
        });
      }
    }

const newOrderData = req.body
newOrderData.orderId = orderId;
newOrderData.email = req.user.email;

const order = new Order(newOrderData);
await order.save();

  } catch (error) {
    res.status(500).json({ 
      message: "Failed to create order",
      error: error.message 
    });
  }
}