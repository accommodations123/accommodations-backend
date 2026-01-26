/* src/queues/emailQueue.js */
import { Queue } from "bullmq";
import dotenv from "dotenv";

// Load environment variables if not already loaded
dotenv.config();

// Redis connection configuration
const redisConnection = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT) || 6379,
  // Optional: Add password if your production Redis requires it
  // password: process.env.REDIS_PASSWORD || undefined
};

const emailQueue = new Queue("email-queue", {
  connection: redisConnection
});

console.log(`🔌 Email Queue connected to Redis at ${redisConnection.host}:${redisConnection.port}`);

export default emailQueue;