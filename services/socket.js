import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import cookie from "cookie";

let io;

/* ============================================================
   SOCKET INITIALIZATION (SINGLE INSTANCE – NO REDIS)
============================================================ */
export const initSocket = (server) => {
  const allowedOrigins = [
    "https://accomodation.test.nextkinlife.live",
    "https://accomodation.admin.test.nextkinlife.live",
    "http://localhost:5173"
  ];

  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true
    },
    transports: ["websocket"] // force WS, avoid polling issues
  });

  /* ================= AUTH MIDDLEWARE ================= */
  io.use((socket, next) => {
    try {
      const cookieHeader = socket.handshake.headers.cookie;
      if (!cookieHeader) return next(new Error("Authentication required"));

      const cookies = cookie.parse(cookieHeader);
      const token = cookies.access_token;
      if (!token) return next(new Error("Authentication required"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      socket.user = {
        id: decoded.id,
        role: decoded.role,
        exp: decoded.exp
      };

      return next();
    } catch (err) {
      return next(new Error("Invalid or expired session"));
    }
  });

  /* ================= CONNECTION ================= */
  io.on("connection", (socket) => {
    console.log("📡 Socket connected:", socket.user.id);

    // user-specific room
    socket.join(`user:${socket.user.id}`);

    // auto-disconnect on JWT expiry
    const ttl = socket.user.exp * 1000 - Date.now();
    if (ttl > 0) {
      setTimeout(() => socket.disconnect(true), ttl);
    }

    socket.on("disconnect", (reason) => {
      console.log("🔌 Socket disconnected:", socket.user.id, reason);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};
