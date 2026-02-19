import { created, error, success } from "../utils/response.js";
import bcrypt from "bcryptjs";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken.js";
import User from "../models/User.js";
import OtpModel from "../models/otpSchema.js";
import sendMail from "../utils/emailService.js";
import verifiedEmailSchema from "../models/verifiedEmailSchema.js";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function sendOTP(req, res) {
  try {
    const { email } = req.body;
    
    if (!email) {
      return error(res, "Email is required", 400);
    }

    // check if email is valid
    const existingUserEmail = await User.findOne({ email });
    if (existingUserEmail) {
      return error(res, "Email Already Registered", 400);
    }

    // generate otp
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otpCode, 10);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // store otp in db
    await OtpModel.findOneAndUpdate(
      { email },
      { code: hashedOtp, expiresAt: otpExpiry },
      { upsert: true, new: true },
    );
    // send mail with otp
    await sendMail(
      email,
      "Verify Your Email - CMS",
      `
  <div style="font-family: Arial, sans-serif; padding:20px; background:#f4f4f4;">
    <div style="max-width:500px; margin:auto; background:#ffffff; padding:20px; border-radius:6px;">
      
      <h2 style="margin-top:0; color:#333;">Email Verification</h2>
      
      <p>Hello,</p>
      
      <p>Thank you for registering with our CMS.</p>
      
      <p>Your verification code is:</p>
      
      <div style="font-size:22px; font-weight:bold; letter-spacing:2px; margin:15px 0;">
        ${otpCode}
      </div>
      
      <p>This code will expire in 10 minutes.</p>
      
      <p>If you did not request this, please ignore this email.</p>
      
      <hr style="margin:20px 0; border:none; border-top:1px solid #ddd;">
      
      <p style="font-size:13px; color:#777;">
        © ${new Date().getFullYear()} CMS
      </p>
      
    </div>
  </div>
  `,
    );

    success(res, "OTP sent to email", { email }, 200);
  } catch (err) {
    console.error(error);
    error(res, "Failed to send OTP", 500, err);
  }
}

export async function verifyOTP(req, res) {
  const { email, otp } = req.body;
  if (!email && !otp) return error(res, "Email and OTP are required", 400);

  try {
    const record = await OtpModel.findOne({ email });
    if (!record) return error(res, "OTP not found or expired", 400);

    const isMatch = await bcrypt.compare(otp, record.code);
    if (!isMatch || new Date() > record.expiresAt) {
      return error(res, "Invalid or expired OTP", 400);
    }

    // OTP is valid — store verified email
    await verifiedEmailSchema.findOneAndUpdate(
      { email },
      { email },
      { upsert: true },
    );

    await OtpModel.deleteOne({ email });
    success(res, "Email verified successfully", { email }, 200);
  } catch (error) {
    console.error(error);
    error(res, "Failed to verify OTP", 500, error);
  }
}

export async function register(req, res) {
  try {
    const { userName, email, password, firstName, lastName } = req.body;

    if (!userName || !email || !password || !firstName || !lastName) {
      return error(res, "All fields are required", 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return error(res, "Invalid email format", 400);
    }

    // Check if email was verified via OTP
      const verified = await verifiedEmailSchema.findOne({ email });
      if (!verified) {
        return error(res, "Email not verified. Please verify your email before registering.", 400);
      }

    const existingUser = await User.findOne({ $or: [{ email }, { userName }] });;
    if (existingUser) {
      return error(res, "User already existe", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      userName,
      email,
      password: hashedPassword,
      firstName,
      lastName,
    });

    // generate token
    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false, // true in production
      sameSite: "Strict",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, // true in production
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    created(
      res,
      "user registered successfully",
      {
        user: "user created successfully",
        accessToken,
        refreshToken,
      },
      201,
    );
  } catch (err) {
    console.error(error);
    error(res, "Failed to register user", 500, err);
  }
}

export async function login(req, res) {
  try{
    const { email, password } = req.body;
    if (!email || !password) {
      return error(res, "Email and password are required", 400);
    }

    const existingUser = await User.findOne({email})
    if (!existingUser) {
      return error(res, "Invalid email or password", 400);
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password
    );   
    
    if(!isPasswordCorrect){
      return error(res, "Invalid email or password", 400);
    }

     const token = jwt.sign(
      { userId: existingUser._id },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "15d",
      }
    );

    res.cookie("jwt", token, {
      maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
      httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
      sameSite: "Strict", // Helps prevent CSRF attacks
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
    });

    success(res, "Login successful", { existingUser }, 200);

  }catch(err){
    error(res, "Failed to login", 500, err.message);
  }
}

// google login 
export async function googleLogin(req, res){
  try {
    const { token } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const { sub, email, name, picture } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        email,
        userName: name,
        provider: "google",
        providerId: sub,
        avatar: picture,
      });
    }

    const jwtToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "15d",
    });

    res.cookie("jwt", jwtToken, {
      httpOnly: true,
      sameSite: "None",
      secure: process.env.NODE_ENV === "production",
    });

    success(res, "Google login successful", { user }, 200);

  } catch (err) {
    error(res, "Google login failed", 500, err.message);
  }
};