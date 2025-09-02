import express from "express";
import User from "../database/models/UserModel.js"; 
import jwt from "jsonwebtoken";
import verifyToken from "../middlewares/VerifyJwt.js";
import nodemailer from "nodemailer";
import verifyEmailVerification from "../middlewares/VerifyEmailToken.js";
const router = express.Router();
let allOtp = [];

const emailVerifiedCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "None",
  maxAge: 5 * 60 * 1000 
};

router.post("/otp", async (req, res) => {
  const { email } = req.body;
  if (!email){
    return res.status(400).json({ 
      success: false, 
      msg: "Email required" 
    });
  }

  try {
    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: { 
        user: process.env.GMAIL_USER, 
        pass: process.env.GMAIL_PASS 
      }
    });

    const newOtp = Math.floor(100000 + Math.random() * 900000);

    await transport.sendMail({
      from: `"HD" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Your OTP",
      text: `Your OTP is ${newOtp}. It will expire in 5 minutes.`
    });

    allOtp = allOtp.filter(o => o.email !== email);
    allOtp.push({ 
      email, otp: 
      newOtp, 
      createdAt: Date.now() 
    });
    console.log(allOtp)

    return res.json({ 
      success: true, 
      msg: "Otp sent" });
  } catch (err) {
    return res.status(500).json({ 
      success: false, 
      msg: err.message 
    });
  }
});


router.post("/otp/verify", (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp){
    return res.status(400).json({ 
      success: false, 
      msg: "Email and OTP required" 
    });
  }

  const record = allOtp.find(o => o.email === email);
  if (!record){
    return res.status(400).json({ 
      success: false, 
      msg: "Otp expired or not found" 
    });
  }

  if (String(record.otp) !== String(otp)){
    return res.status(400).json({ 
      success: false,
      msg: "Invalid OTP" 
    });
  }

  allOtp = allOtp.filter(o => o.email !== email);

  res.clearCookie("email_verified", emailVerifiedCookieOptions);

  const token = jwt.sign(
    { email, verified: true }
    , process.env.JWT_SECRET, 
    { expiresIn: "5m" });
  res.cookie("email_verified", token, emailVerifiedCookieOptions);

  return res.json({ 
    success: true, 
    msg: "OTP verified" 
  });
});

router.post("/signup", verifyEmailVerification, async (req, res) => {
  try {
    const { email } = req.email;
    const { name, dob } = req.body;
    if (!name){
      return res.status(400).json({ 
        success: false, 
        msg: "Name required" 
      });
    }
    if (!dob){
      return res.status(400).json({ 
        success: false, 
        msg: " DOB required" 
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser){
      return res.status(409).json({ 
        success: false, 
        msg: "User already exists" 
      });
    }

    const newUser = await User.create({ 
      email, 
      name, 
      dob 
    });

    const token = jwt.sign(
      { user_id: newUser._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: "7d" }
    );
    res.clearCookie("email_verified", emailVerifiedCookieOptions);
    res.cookie("jwt_token", token, { 
      httpOnly: true, 
      secure: true, 
      sameSite: "None", 
      maxAge: 7 * 24 * 60 * 60 * 1000 });

    return res.status(201).json({ 
      success: true, 
      msg: "Signup successful", 
      user: { email, name, dob } 
    });
  } catch (err) {
    return res.status(500).json({ 
      success: false, 
      msg: err.message 
    });
  }
});

router.post("/login", verifyEmailVerification, async (req, res) => {
  try {
    const { email } = req.email;

    const user = await User.findOne({ email });
    if (!user){
      return res.status(404).json({ 
        success: false, 
        msg: "User not found. Please signup first." });
    }

    const token = jwt.sign(
      { user_id: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: "7d" }
    );
    res.clearCookie("email_verified", emailVerifiedCookieOptions);
    res.cookie("jwt_token", token, { 
      httpOnly: true, 
      secure: true, 
      sameSite: "None", 
      maxAge: 7 * 24 * 60 * 60 * 1000 });

    return res.json({ 
      success: true, 
      msg: "Login successful", 
      user: { email: user.email, 
        name: user.name, dob: user.dob } 
      });
  } catch (err) {findOne
    return res.status(500).json({ 
      success: false, 
      msg: err.message 
    });
  }
});


router.get("/me",verifyToken ,async(req,res)=>{
  try{
    const _id = req.user.user_id;
    if(!_id){
      return res.json({
        success : false,
        msg :"User id not found"
      })
    }
    const user = await User.findById(_id);
    if(!user){
      return res.json({
        success : false,
        msg : "User not found"
      })
    }
    res.json({
      success : true,
      msg : "User found",
      user
    })
  }
  catch(err){
    res.json({
      success : false,
      msg : err.message
    })
  }
})
export default router;
