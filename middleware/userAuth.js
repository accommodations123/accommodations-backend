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

    // 🔹 Try Redis first
    let cachedUser = await getCache(`user:${userId}`);

    let user;
    if (cachedUser && cachedUser.id) {
      user = cachedUser;
    } else {
      const dbUser = await User.findByPk(userId);
      if (!dbUser) {
        return res.status(401).json({ message: "User not found" });
      }

      user = {
        id: Number(dbUser.id),
        verified: dbUser.verified,
        role: "user"
      };

      // Cache only safe fields
      await setCache(`user:${userId}`, user, 600);
    }

    if (!user.verified) {
      return res.status(401).json({ message: "Please verify your OTP first" });
    }

    // ✅ Always normalized
    req.user = {
      id: Number(user.id),
      role: "user"
    };

    next();
  } catch (err) {
    console.error("AUTH ERROR:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
