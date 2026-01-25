import { Server } from "socket.io";
// Removed: redis, @socket.io/redis-adapter, jwt, cookie (unless used elsewhere)

let io;

/* =========================================================
   INITIALIZE SOCKET.IO
========================================================= */
export const initSocket = async (httpServer) => {
  const allowedOrigins = [
    "https://accomodation.api.test.nextkinlife.live",
    "https://accomodation.test.nextkinlife.live",
    "https://accomodation.admin.test.nextkinlife.live",
    "https://admin.test.nextkinlife.live",
    "http://localhost:5173",
    "http://localhost:5000"
  ];

  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      credentials: true
    },
    // ✅ Uses default in-memory adapter (No Redis needed)
    transports: ["websocket", "polling"],
    upgrade: true,
    pingInterval: 25000,
    pingTimeout: 20000
  });

  /* =========================================================
     CONNECTION HANDLER
  ========================================================= */
  io.on("connection", (socket) => {
    // Note: userId will be undefined here since Middleware was commented out
    const userId = socket.user?.id;

    if (userId) {
      const room = `user:${userId}`;
      socket.join(room);
      console.log(`📡 Socket connected | user:${userId} | socket:${socket.id}`);
    } else {
      console.log(`📡 Anonymous Socket connected | socket:${socket.id}`);
    }

    socket.on("disconnect", (reason) => {
      console.log(`🔌 Socket disconnected | socket:${socket.id} | reason:${reason}`);
    });
  });

  return io;
};

/* =========================================================
   SAFE ACCESSOR
========================================================= */
export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO not initialized");
  }
  return io;
};