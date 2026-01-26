import { Queue } from "bullmq";
import dotenv from "dotenv";

dotenv.config();

const redisConnection = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT) || 6379
};

const emailQueue = new Queue("email-queue", {
  connection: redisConnection
});

// ✅ CRITICAL FIX: SANITIZE JOB DATA AUTOMATICALLY
export const createJob = async (jobType, data, options = {}) => {
  try {
    // 1. If data is already a string/object, stringify it to be safe
    const safeData = typeof data === 'string' ? data : JSON.stringify(data);
    
    // 2. If 'metadata' exists, ensure it is stringified
    if (data.metadata && typeof data.metadata !== 'string') {
      data.metadata = JSON.stringify(data.metadata);
    }

    // 3. Use the sanitized data to create the job
    return await emailQueue.add(jobType, safeData, options);
  } catch (error) {
    console.error("❌ Job creation error:", error);
    throw error; // Re-throw so the controller knows it failed
  }
};

console.log(`🔌 Email Queue connected to Redis at ${redisConnection.host}:${redisConnection.port}`);

export default emailQueue;