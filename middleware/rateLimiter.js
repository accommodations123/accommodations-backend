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


export const postRateLimit = async (req, res, next) => {
  try {
    await limiter.consume(`post:${req.user.id}`, 10);
    next();
  } catch {
    return res.status(429).json({
      message: "You are posting too fast"
    });
  }
};

export const resourceRateLimit = async (req, res, next) => {
  try {
    await limiter.consume(`resource:${req.user.id}`, 5);
    next();
  } catch {
    return res.status(429).json({
      message: "Too many resource uploads"
    });
  }
};
