import jwt from "jsonwebtoken";
import User from "../model/User.js";
import { getCache, setCache } from "../services/cacheService.js";

export default async function userAuth(req, res, next) {
  try {
    // ✅ READ TOKEN FROM COOKIE
    const token = req.cookies?.access_token;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || decoded.role !== "user") {
      return res.status(403).json({ message: "Access denied" });
    }

    const userId = Number(decoded.id);

    // ✅ TRY CACHE FIRST
    const cachedUser = await getCache(`user:${userId}`);
    if (cachedUser) {
      req.user = cachedUser;
      return next();
    }

    // 🔥 DB CHECK ONLY IF CACHE MISS
    const dbUser = await User.findByPk(userId, {
      attributes: ["id", "verified"]
    });

    if (!dbUser) {
      return res.status(401).json({ message: "User not found" });
    }

    if (!dbUser.verified) {
      return res.status(401).json({ message: "Please verify your OTP first" });
    }

    const safeUser = {
      id: userId,
      role: "user"
    };

    // ✅ CACHE VERIFIED USER
    await setCache(`user:${userId}`, safeUser, 600);

    req.user = safeUser;
    next();

  } catch (err) {
    console.error("AUTH ERROR:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
