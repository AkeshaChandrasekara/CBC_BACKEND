import User from "../models/user.js";
import nodemailer from 'nodemailer';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import axios from "axios";
dotenv.config()
export function createUser(req,res){

  const newUserData = req.body

  if(newUserData.type == "admin"){

    if(req.user==null){
      res.json({
        message: "Please login as administrator to create admin accounts"
      })
      return
    }

    if(req.user.type != "admin"){
      res.json({
        message: "Please login as administrator to create admin accounts"
      })
      return
    }

  }

  newUserData.password = bcrypt.hashSync(newUserData.password, 10)  

  const user = new User(newUserData)

  user.save().then(()=>{
    res.json({
      message: "User created"
    })
  }).catch((error)=>{
    res.json({      
      message: "User not created"
    })
  })
  
}

export function loginUser(req,res){

  User.find({email : req.body.email}).then(
    (users)=>{
      if(users.length == 0){

        res.json({
          message: "User not found"
        })

      }else{

        const user = users[0]

        const isPasswordCorrect = bcrypt.compareSync(req.body.password,user.password)

        if(isPasswordCorrect){

          const token = jwt.sign({
            email : user.email,
            firstName : user.firstName,
            lastName : user.lastName,
            isBlocked : user.isBlocked,
            type : user.type,
            profilePicture : user.profilePicture
          } , process.env.SECRET)
          
          res.json({
            message: "User logged in",
            token: token,
            user : {
              firstName : user.firstName,
              lastName : user.lastName,
              type : user.type,
              profilePicture : user.profilePicture,
              email : user.email
            }
          })
          
        }else{
          res.json({
            message: "User not logged in (wrong password)"
          })
        }
      }
    }
  )
}

export function isAdmin(req){
  if(req.user==null){
    return false
  }

  if(req.user.type != "admin"){
    return false
  }

  return true
}

export function isCustomer(req){
  if(req.user==null){
    return false
  }

  if(req.user.type != "customer"){
    return false
  }

  return true
}

export async function googleLogin(req,res){
  console.log(req.body)
  const token = req.body.token
  //'https://www.googleapis.com/oauth2/v3/userinfo'
  try{
    const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo',{
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    const email = response.data.email

    const usersList = await User.find({email: email})
    if(usersList.length >0){
      const user = usersList[0]
      const token = jwt.sign({
        email : user.email,
        firstName : user.firstName,
        lastName : user.lastName,
        isBlocked : user.isBlocked,
        type : user.type,
        profilePicture : user.profilePicture
      } , process.env.SECRET)
      
      res.json({
        message: "User logged in",
        token: token,
        user : {
          firstName : user.firstName,
          lastName : user.lastName,
          type : user.type,
          profilePicture : user.profilePicture,
          email : user.email
        }
      })
    }else{
      
      const newUserData = {
        email: email,
        firstName: response.data.given_name,
        lastName: response.data.family_name,
        type: "customer",
        password: "ffffff",
        profilePicture: response.data.picture
      }
      const user = new User(newUserData)
      user.save().then(()=>{
        res.json({
          message: "User created"
        })
      }).catch((error)=>{
        res.json({      
          message: "User not created"
        })
      })

    }

  }catch(e){
    res.json({
      message: "Google login failed"
    })
  }


}


export function verifyUser(req, res) {
 
  res.json({
    email: req.user.email,
    firstName: req.user.firstName,
    lastName: req.user.lastName,
    type: req.user.type,
    profilePicture: req.user.profilePicture
  });
}


export async function getAllUsers(req, res) {
  if (!isAdmin(req)) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  try {
    const users = await User.find({}, { password: 0 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
}


export async function deleteUser(req, res) {
  if (!isAdmin(req)) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user" });
  }
}


export async function toggleBlockUser(req, res) {
  if (!isAdmin(req)) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isBlocked = req.body.isBlocked;
    await user.save();
    res.json({ message: "User status updated", user });
  } catch (error) {
    res.status(500).json({ message: "Error updating user status" });
  }
}

export async function forgotPassword(req, res) {
  const { email } = req.body;
  
  try {
    const user = await User.findOne({ email });
    if (!user) {
    
      return res.json({ message: "If this email exists, a reset link has been sent" });
    }

    const resetToken = jwt.sign(
      { email: user.email, id: user._id },
      process.env.SECRET,
      { expiresIn: '1h' }
    );

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USERNAME, 
        pass: process.env.EMAIL_PASSWORD 
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
    const mailOptions = {
      from: `"Crystal Beauty Clear" <${process.env.EMAIL_USERNAME}>`, 
      to: email, 
      subject: 'Password Reset Request',
      text: `You requested a password reset. Please click the following link to reset your password:\n\n${resetUrl}\n\nThis link will expire in 1 hour.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #D4AF37;">Password Reset Request</h2>
          <p>You requested a password reset for your Crystal Beauty Clear account.</p>
          <p>Please click the button below to reset your password:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #D4AF37; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">
            Reset Password
          </a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <hr>
          <p style="font-size: 12px; color: #777;">Crystal Beauty Clear Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    
    res.json({ 
      message: "Password reset link sent to email"
    });

  } catch (error) {
    console.error('Error in forgotPassword:', error);
    res.status(500).json({ 
      message: "Error processing request",
      error: error.message 
    });
  }
}
export async function resetPassword(req, res) {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(400).json({ message: "Invalid token" });
    }

    user.password = bcrypt.hashSync(password, 10);
    await user.save();

    res.json({ message: "Password updated successfully" });

  } catch (error) {
    res.status(400).json({ message: "Invalid or expired token" });
  }
}

export async function verifyResetToken(req, res) {
  const { token } = req.params;
  
  try {
    jwt.verify(token, process.env.SECRET);
    res.json({ valid: true });
  } catch (error) {
    res.json({ valid: false });
  }
}