import dotenv from "dotenv";
dotenv.config();

import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import User from "../model/User.js";

// Email Transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate 4-digit OTP
const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

/* ============================================================
   SEND OTP CONTROLLER
============================================================ */
export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: "Email required" });

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    let user = await User.findOne({ where: { email } });

    if (!user) {
      // New User
      user = await User.create({
        email,
        verified: false,
        otp,
        otpExpires: expiresAt,
      });
    } else {
      // Existing user → update OTP
      user.verified = false;
      user.otp = otp;
      user.otpExpires = expiresAt;
      await user.save();
    }

    // Send mail
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Verification Code",
      html: `<h2>Your OTP: ${otp}</h2><p>Valid for 5 minutes.</p>`,
    });

    return res.json({ message: "OTP sent to email" });
  } catch (error) {
    console.log("SEND OTP ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ============================================================
   VERIFY OTP CONTROLLER
============================================================ */
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp)
      return res.status(400).json({ message: "Email and OTP are required" });

    const user = await User.findOne({ where: { email } });

    if (!user || !user.otp || !user.otpExpires) {
      return res.status(400).json({ message: "OTP expired or invalid" });
    }

    // Check OTP expiration
    const expires = new Date(user.otpExpires);
    if (expires < new Date()) {
      return res.status(400).json({ message: "OTP expired or invalid" });
    }

    // Match OTP
    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Update user
    user.verified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    // Generate token
    const token = jwt.sign(
      { id: user.id, role: "user" },
      process.env.JWT_SECRET
    );

    return res.json({
      message: "OTP Verified",
      token,
      user: {
        id: user.id,
        email: user.email,
        verified: true,
      },
    });
  } catch (error) {
    console.log("VERIFY OTP ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
