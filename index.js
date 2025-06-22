import bodyParser from "body-parser";
import express from "express";
import mongoose from "mongoose";
import userRouter from "./routes/userRouter.js";
import dotenv from "dotenv";
dotenv.config();
import productRouter from "./routes/productRouter.js";
import orderRouter from "./routes/orderRoute.js";

const app = express();
const mongoUrl=process.env.MONGO_DB_URI

mongoose.connect(mongoUrl,{});
const connection=mongoose.connection;

connection.once("open",()=>{
    console.log("mongodb connected")
})
app.use(bodyParser.json());
app.use((res,req,next)=>{
 // next();
 console.log(req)
 next();
})

app.use("/api/users",userRouter);
app.use("/api/products",productRouter);
app.use("/api/orders",orderRouter);



app.listen(5000,
    ()=>{
        console.log("server runing")

}
)
