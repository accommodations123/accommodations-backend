import dotenv from "dotenv";
dotenv.config();
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'
import User from '../model/User.js'


// free email sender using Gmail
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
})

//generate 4-digit otp 
const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString()

//send otp email or phone 
export const sendOTP = async (req, res) => {
    try {
        const { email, phone } = req.body;

        if (!email && !phone) {
            return res.status(400).json({ message: 'Email or Phone required' });
        }

        const otp = generateOTP();
        const otpExpires = Date.now() + 5 * 60 * 1000;

        // FIXED QUERY LOGIC
        let query = {};
        if (email) query.email = email;
        if (phone) query.phone = phone;

        let user = await User.findOne(query);

        // CREATE OR UPDATE USER
        if (!user) {
            user = await User.create({
                email: email || null,
                phone: phone || null,
                otp,
                otpExpires,
                verified: false
            });
        } else {
            user.otp = otp;
            user.otpExpires = otpExpires;
            user.verified = false;
            await user.save();
        }

        // SEND EMAIL
        if (email) {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: "Your OTP Verification Code",
                html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2 style="color: #333;">Your Verification Code</h2>
                <p style="font-size: 16px; color: #555;">
                    Use the OTP below to complete your login process.
                </p>

                <div style="margin: 20px 0; padding: 15px 20px; background: #f6f6f6; border-radius: 8px; border: 1px solid #ddd;">
                    <h1 style="font-size: 32px; letter-spacing: 4px; color: #111; text-align: center;">
                    ${otp}
                    </h1>
                </div>

                <p style="font-size: 14px; color: #777;">
                    This OTP is valid for only 5 minutes. Do not share it with anyone.
                </p>

                <hr style="margin: 20px 0;" />

                <p style="font-size: 12px; color: #999;">
                    If you didn’t request this, please ignore the email.
                </p>
                </div>
                `
            });
        }

        // SEND SMS (placeholder)
        if (phone) {
            console.log("SMS OTP to phone:", phone, "OTP:", otp);
        }

        return res.json({ message: "OTP sent to email/phone" });

    } catch (error) {
        console.log("MAIL ERROR =>", error);
        return res.status(500).json({ error: error.message || "Something went wrong" });
    }
};


//VERIFY OTP 
export const verifyOTP = async (req, res) => {
    try {
        const { email, phone, otp } = req.body
        const query = {};

        if (email && email !== "null") query.email = email;
        if (phone && phone !== "null") query.phone = phone;

        const user = await User.findOne(query);

        if (!user)
            return res.status(404).json({ message: 'User not found' })
        if (user.otp !== otp)
            return res.status(400).json({ message: 'Inavlid OTP' })
        if (user.otpExpires < Date.now())
            return res.status(400).json({ message: 'OTP expired' })

        user.verified = true
        user.otp = null
        user.otpExpires = null
        await user.save()
        //Generate jwt 
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            // { expiresIn: '7d' }
        )
        res.json({
            message: 'OTP Verified', token,
            user: {
                email: user.email,
                phone: user.phone,
                id: user._id,
            }
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'server error' })
    }
}