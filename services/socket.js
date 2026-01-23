import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import { createClient } from "redis";
import { createAdapter } from "@socket.io/redis-adapter";

let io;

export const initSocket = async (server) => {
  const allowedOrigins = [
    "https://accomodation.test.nextkinlife.live",
    "https://accomodation.admin.test.nextkinlife.live",
    "https://admin.test.nextkinlife.live",
    "http://localhost:5173",
    "http://localhost:5000"
  ];

  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true
    },
    transports: ["websocket"], // 🔒 mandatory
    upgrade: false
  });

  /* ================= REDIS ADAPTER ================= */
  const pubClient = createClient({
    url: process.env.REDIS_URL || "redis://127.0.0.1:6379"
  });
  const subClient = pubClient.duplicate();

  pubClient.on("error", (e) => console.error("Redis pub error", e));
  subClient.on("error", (e) => console.error("Redis sub error", e));

  await pubClient.connect();
  await subClient.connect();

  io.adapter(createAdapter(pubClient, subClient));

  console.log("✅ Socket.IO Redis adapter connected");

  /* ================= AUTH MIDDLEWARE ================= */
  io.use((socket, next) => {
    try {
      const cookieHeader = socket.handshake.headers.cookie;
      if (!cookieHeader) {
        return next(new Error("AUTH_REQUIRED"));
      }

      const cookies = cookie.parse(cookieHeader);
      const token = cookies.access_token;
      if (!token) {
        return next(new Error("AUTH_REQUIRED"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      socket.user = {
        id: decoded.id,
        role: decoded.role,
        exp: decoded.exp
      };

      return next();
    } catch {
      return next(new Error("AUTH_INVALID"));
    }
  });

  /* ================= CONNECTION ================= */
  io.on("connection", (socket) => {
    console.log("📡 Socket connected:", socket.user.id);

    socket.join(`user:${socket.user.id}`);

    // 🔒 Kill socket when JWT expires
    const ttl = socket.user.exp * 1000 - Date.now();
    if (ttl > 0) {
      setTimeout(() => socket.disconnect(true), ttl);
    }

    socket.on("disconnect", (reason) => {
      console.log(
        "🔌 Socket disconnected:",
        socket.user.id,
        "| reason:",
        reason
      );
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket not initialized");
  return io;
};
