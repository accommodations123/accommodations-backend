import jwt from "jsonwebtoken";
import User from "../model/User.js";
import { getCache, setCache } from "../services/cacheService.js";

/* ============================================================
   USER AUTH MIDDLEWARE (COOKIE ONLY)
============================================================ */
export default async function userAuth(req, res, next) {
  try {
    const token = req.cookies?.access_token;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || decoded.role !== "user") {
      return res.status(403).json({ message: "Access denied" });
    }

    const userId = Number(decoded.id);

    let user = await getCache(`user:${userId}`);

    if (!user) {
      const dbUser = await User.findByPk(userId, {
        attributes: ["id", "verified", "status"]
      });

      if (!dbUser) return res.status(401).json({ message: "User not found" });
      if (!dbUser.verified) return res.status(401).json({ message: "Verify OTP first" });
      if (dbUser.status === "blocked") {
        return res.status(403).json({ message: "Account blocked" });
      }

      user = {
        id: dbUser.id,
        role: "user"
      };

      await setCache(`user:${userId}`, user, 300);
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Session expired" });
  }
}

