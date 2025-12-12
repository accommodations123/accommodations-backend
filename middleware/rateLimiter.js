import redis from "../config/redis.js";
import { RateLimiterRedis, RateLimiterMemory } from "rate-limiter-flexible";

let limiter;

if (redis) {
  limiter = new RateLimiterRedis({
    storeClient: redis,
    points: 3,
    duration: 60
  });
} else {
  limiter = new RateLimiterMemory({
    points: 50,
    duration: 60
  });
}

export const rateLimit = async (req, res, next) => {
  try {
    await limiter.consume(req.ip);
    next();
  } catch {
    res.status(429).json({ message: "Too many requests" });
  }
};
