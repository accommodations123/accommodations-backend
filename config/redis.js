import Redis from "ioredis";

let redis = null;

if (process.env.USE_REDIS === "true") {
  redis = new Redis(process.env.REDIS_URL);

  redis.on("connect", () => {
    console.log("Redis connected");
  });

  redis.on("error", err => {
    console.error("Redis error:", err);
  });
}

export default redis;
