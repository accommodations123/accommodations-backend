import redis from "../config/redis.js";

export const setCache = async (key, value, ttl = 60) => {
  if (!redis) return; 
  await redis.set(key, JSON.stringify(value), "EX", ttl);
};

export const getCache = async (key) => {
  if (!redis) return null;
  const value = await redis.get(key);
  return value ? JSON.parse(value) : null;
};

export const deleteCache = async (key) => {
  if (!redis) return;
  await redis.del(key);
};
