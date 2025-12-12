import jwt from "jsonwebtoken";
import User from "../model/User.js";

export default async function userAuth(req, res, next) {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Ensure token belongs to a user
    if (!decoded || decoded.role !== "user") {
      return res.status(403).json({ message: "Access denied" });
    }

    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // OTP verification check
    if (!user.verified) {
      return res.status(401).json({ message: "Please verify your OTP first" });
    }

    req.user = user;
    next();

  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
 