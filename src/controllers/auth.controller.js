import { created, error } from "../utils/response.js";
import bcrypt from "bcryptjs";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken.js";
import User from "../models/User.js";

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

    const existingUser = false;
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

    created(res, "user registered successfully", {
      user: "user created successfully",
      accessToken,
      refreshToken,
    }, 201);

  } catch (err) {
    console.error(error);
    error(res, "Failed to register user", 500, err);
  }
}

export async function login(req, res) {}
