import dotenv from "dotenv";
dotenv.config();

import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import User from '../model/User.js';

// Email Transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate 4-digit OTP
const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

// SEND OTP - FIXED SEQUELIZE SYNTAX
export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email required' });
    }

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

    // Option 1: Using findOrCreate (recommended for this use case)
    const [user, created] = await User.findOrCreate({
      where: { email },
      defaults: {
        email,
        otp,
        otp_expires: otpExpires,
        verified: false
      }
    });

    // If user exists, update it
    if (!created) {
      // Use instance method to update
      await user.update({
        otp,
        otp_expires: otpExpires,
        verified: false
      });
    }

    // Option 2: Your original logic fixed
    /*
    let user = await User.findOne({ where: { email } });

    if (!user) {
      user = await User.create({
        email,
        otp,
        otp_expires: otpExpires,
        verified: false
      });
    } else {
      // FIX: Use update method instead of modifying properties
      await user.update({
        otp,
        otp_expires: otpExpires,
        verified: false
      });
      // OR use Model.update():
      // await User.update(
      //   { otp, otp_expires: otpExpires, verified: false },
      //   { where: { id: user.id } }
      // );
    }
    */

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Verification Code",
      html: `
        <h2>Your OTP: ${otp}</h2>
        <p>This OTP is valid for 5 minutes.</p>
      `,
    });

    return res.json({ message: "OTP sent to email" });

  } catch (error) {
    console.log("MAIL ERROR =>", error);
    return res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// VERIFY OTP - FIXED SEQUELIZE SYNTAX
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (user.otp_expires < new Date()) {
      return res.status(400).json({ message: 'OTP expired' });
    }

    // FIX: Use update method
    await user.update({
      verified: true,
      otp: null,
      otp_expires: null
    });

    const token = jwt.sign(
      { id: user.id, role: "user" },
      process.env.JWT_SECRET
      // { expiresIn: "30d" }
    );

    return res.json({
      message: 'OTP Verified',
      token,
      user: {
        email: user.email,
        id: user.id,
      }
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};