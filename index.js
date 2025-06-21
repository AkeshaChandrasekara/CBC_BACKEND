import bodyParser from "body-parser";
import express from "express";
import mongoose from "mongoose";
import userRouter from "./routes/userRouter.js";
import res from "express/lib/response.js";
import jwt from "jsonwebtoken";


const app = express();



const mongoUrl="mongodb+srv://akesha:ak123@cluster0.nfzcoqi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

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

app.listen(5000,
    ()=>{
        console.log("server runing")

}
)
