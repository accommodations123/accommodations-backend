import jwt from "jsonwebtoken";
import User from "../model/User.js";
import { getCache, setCache } from "../services/cacheService.js";

export default async function userAuth(req, res, next) {
  try {
    const token = req.cookies?.access_token;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || decoded.role !== "user")
      return res.status(403).json({ message: "Access denied" });

    const userId = Number(decoded.id);

    // 1️⃣ Cache
   const cached = await getCache(`user:${userId}`);
if (cached) {
  // Enforce role consistency with JWT
  if (cached.role !== decoded.role) {
    cached.role = decoded.role;
    await setCache(`user:${userId}`, cached, 600);
  }
  req.user = cached;
  return next();
}

const dbUser = await User.findByPk(userId, {
  attributes: ["id","email","name","profile_image","verified","role"]
});

if (!dbUser || !dbUser.verified)
  return res.status(401).json({ message: "Unauthorized" });

const fullUser = {
  ...dbUser.toJSON(),
  role: decoded.role
};

await setCache(`user:${userId}`, fullUser, 600);
req.user = fullUser;
next();

  } catch (err) {
    console.error("AUTH ERROR:", err);
    return res.status(401).json({ message: "Session expired" });
  }
}
