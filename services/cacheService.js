import redis from "../config/redis.js";

export const setCache = async (key, value, ttl = 60) => {
  if (!redis) return;
  await redis.set(key, JSON.stringify(value), "EX", ttl);
};

export const getCache = async (key) => {
  if (!redis) return null;

  const value = await redis.get(key);
  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch {
    await redis.del(key);
    return null;
  }
};

export const deleteCache = async (key) => {
  if (!redis) return;
  await redis.del(key);
};

export const deleteCacheByPrefix = async (prefix) => {
  if (!redis) return;

  const keys = await redis.keys(`${prefix}*`);
  if (keys.length > 0) {
    await redis.del(keys);
  }
};
