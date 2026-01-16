import jwt from "jsonwebtoken";
import Admin from "../model/Admin.js";

import { getCache, setCache } from "../services/cacheService.js";

export default async function adminAuth(req, res, next) {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || decoded.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const adminId = decoded.id;

    let admin = await getCache(`admin:${adminId}`);

    if (!admin) {
      const dbAdmin = await Admin.findByPk(adminId, {
        attributes: ["id", "email", "role"]
      });

      if (!dbAdmin) return res.status(401).json({ message: "Admin not found" });

      admin = {
        id: dbAdmin.id,
        email: dbAdmin.email,
        role: dbAdmin.role
      };

      await setCache(`admin:${adminId}`, admin, 300);
    }

    req.admin = admin;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

