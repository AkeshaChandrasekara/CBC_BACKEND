import Order  from "../models/order.js";
import  {isCustomer } from "./userController.js";

export async function createOrder(req, res) {

    if (!isCustomer){
    res.status(400).json({ 
      message: "You are not a customer. Please login as a customer to create an order." 
    });

    }
  try {
   // const latestOrder = await Order.find().sort({ date: -1 }).limit(1);
    const latestOrder = await Order.find().sort({ date: -1 }).limit(1)
      .maxTimeMS(30000)
      .exec();

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

 return res.status(201).json({
            message: "Order created successfully",
            order: order
        });

  } catch (error) {
    res.status(500).json({ 
      message: "Failed to create order",
      error: error.message 
    });
  }
}

export async function getOrders(req, res) {
  
    
  try {
    if (isCustomer(req)) {
    const orders = await Order.find({ email: req.user.email });

    res.json(orders);
    return;
    }else if(isAdmin(req)){
      const orders = await Order.find({});

      res.json(orders);
      return;
    }else{
      res.json({
        message: "Please login to view orders"
      })
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}
