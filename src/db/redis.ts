import { env } from "@/env";
import Redis from "ioredis";

/**
 * Cache the Redis connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForRedis = globalThis as unknown as {
  redis?: Redis;
};

// Reuse the existing Redis connection if available
const redis = globalForRedis.redis ?? new Redis(env.REDIS_URL);

// Cache the connection in development
if (env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}

export { redis };
