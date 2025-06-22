import bodyParser from "body-parser";
import express from "express";
import mongoose from "mongoose";
import userRouter from "./routes/userRouter.js";
import jwt from "jsonwebtoken";
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

app.use(
    (req,res,next)=>{
        const value = req.header("Authorization")
        if(value != null){
            const token = value.replace("Bearer ","")
            jwt.verify(
                token,
                process.env.JWT_SECRET,
                (err,decoded)=>{
                    if(decoded == null){
                        res.status(403).json({
                            message : "Unauthorized"
                        })
                    }else{
                        req.user = decoded
                        next()
                    }                    
                }
            )
        }else{
            next()
        }        
    }
)

app.use("/api/users",userRouter);
app.use("/api/products",productRouter);
app.use("/api/orders",orderRouter);



app.listen(5000,
    ()=>{
        console.log("server runing")

}
)
