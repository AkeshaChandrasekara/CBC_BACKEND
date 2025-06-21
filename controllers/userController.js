import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export function createUser(req, res) {
  const newUserData = req.body;
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

                
                },"cbc-secrate-key 8000")
                
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