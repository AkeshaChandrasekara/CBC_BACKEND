import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import dotenv from "dotenv";
dotenv.config();

export function createUser(req, res) {
  const newUserData = req.body;

  if (newUserData.type == "admin" ){
    if(req.user==null){
        res.json({
           message:"please login as admin to create admin account"
        })
        return
    }else{
        if(req.user.type!="admin"){
            res.json({
               message:"please login as admin to create admin account"
            })
            return
        }else{
            console.log("admin")
        }
    }
  }
  
  newUserData.password = bcrypt.hashSync(newUserData.password, 10);


  console.log(newUserData.password);

  const user = new User(newUserData);
  user.save().then(() => {
    res.json({
      message: "user created successfully"
    })
  }).catch((err) => { 
    console.error("Error creating user:", err);  
    res.status(500).json({
      message: "error in creating user",
      error: err.message  
    })
  })
}

export function loginUser(req,res){
    User.find({email:req.body.email}).then((users)=>{
          if(users.length==0){
           res.json({
            message:"user not found"
           })
          }else{
            const user=users[0]
            if (req.body.password && user.password) {
                const isPasswordCorrect=bcrypt.compareSync(req.body.password,user.password)
                console.log(isPasswordCorrect)
                if(isPasswordCorrect){
                const token=    jwt.sign({
                    email:user.email,
                    password:user.password,
                    firstName:user.firstName,
                    lastName:user.lastName,

                
                }, process.env.JWT_SECRET
)
                
                
                res.json({
                    message:"login successfull",
                    token:token
                })
                    
                }else{
                    res.json({
                        message:"invalid password"
                    })
                }
            } else {
                res.json({
                    message:"password missing"
                })
            }
          } 
    })
}

export function deleteUser(req,res){
    User.findOneAndDelete({email:req.body.email}).then((user)=>{
        if(user){
            res.json({
                message:"user deleted"
            })
        }else{
            res.json({
                message:"user not found"
            })
        }
    })
}

export function isAdmin(req){
    if(req.user==null){
        return false
    }
    if(req.user.type!="admin"){
        return false
    }else{
        return true
    }
}

export function isCustomer(req){
  if(req.user==null){
        return false
    }
    if(req.user.type!="customer"){
        return false
    }else{
        return true
    }
}

//admin.user@example.com"
//adminPass123!

//cus.user@example.com,
//cusPass123!