import jwt from "jsonwebtoken";
import User from "../model/User.js";
import { getCache, setCache } from "../services/cacheService.js";

export default async function userAuth(req, res, next) {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || decoded.role !== "user") {
      return res.status(403).json({ message: "Access denied" });
    }

    const userId = Number(decoded.id);

    // 🔥 ALWAYS CHECK DB FOR VERIFIED STATUS
    const dbUser = await User.findByPk(userId);
    if (!dbUser) {
      return res.status(401).json({ message: "User not found" });
    }

    if (!dbUser.verified) {
      return res.status(401).json({ message: "Please verify your OTP first" });
    }

    // Cache safe fields AFTER verification
    await setCache(
      `user:${userId}`,
      {
        id: userId,
        role: "user"
      },
      600
    );

    req.user = {
      id: userId,
      role: "user"
    };

    next();

  } catch (err) {
    console.error("AUTH ERROR:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
