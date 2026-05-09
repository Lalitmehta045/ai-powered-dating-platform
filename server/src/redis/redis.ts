/**
 * Redis Client Singleton
 *
 * Manages the Redis connection lifecycle and state.
 *
 * Architecture Notes:
 * - Implements a resilient singleton pattern: if Redis is down
 *   on startup or crashes during runtime, the app will NOT crash.
 *   Instead, `isRedisReady` flips to false, and consumers of
 *   `getCache`/`setCache` will bypass Redis and degrade to
 *   database queries gracefully.
 * - This ensures high availability of core features (like profile
 *   viewing and matching) even during cache infrastructure outages.
 *
 * TODO: Integrate a robust circuit-breaker for prolonged outages.
 */
import { createClient, RedisClientType } from "redis";
import { logger } from "../logger/logger";

let redisClient: RedisClientType | null = null;
let isRedisReady = false;

/**
 * Normalizes the Redis URL.
 * Handles quirks like render.com appending 'redis-cli -u '.
 */
const normalizeRedisUrl = (rawUrl?: string) => {
  if (!rawUrl) {
    return undefined;
  }

  const trimmed = rawUrl.trim();
  if (trimmed.startsWith("redis-cli -u ")) {
    return trimmed.replace("redis-cli -u ", "").trim();
  }

  return trimmed;
};

/**
 * Retrieves the Redis client instance.
 * Initializes the client and attaches lifecycle event listeners
 * if it doesn't already exist.
 */
export const getRedisClient = () => {
  if (redisClient) {
    return redisClient;
  }

  const url = normalizeRedisUrl(process.env.REDIS_URL);
  redisClient = createClient(url ? { url } : undefined);

  redisClient.on("error", (error) => {
    isRedisReady = false;
    logger.error("Redis connection error", {
      error: String(error),
    });
  });

  redisClient.on("ready", () => {
    isRedisReady = true;
    logger.info("Redis connected");
  });

  redisClient.on("end", () => {
    isRedisReady = false;
    logger.warn("Redis connection closed");
  });

  redisClient.on("reconnecting", () => {
    logger.info("Redis reconnecting");
  });

  return redisClient;
};

/**
 * Bootstraps the Redis connection.
 * Called once during application startup in server.ts.
 */
export const connectRedis = async () => {
  try {
    const client = getRedisClient();
    if (!client.isOpen) {
      await client.connect();
    }
  } catch (error) {
    isRedisReady = false;
    logger.error("Redis bootstrap failed", {
      error: String(error),
    });
  }
};

/**
 * Checks if Redis is currently connected and ready to accept commands.
 * Used by services to fallback to DB queries when false.
 */
export const isRedisConnected = () => isRedisReady;
