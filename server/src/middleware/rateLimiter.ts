/**
 * Rate Limiter Middleware
 *
 * Protects public-facing endpoints (like login/register) from
 * brute-force and credential stuffing attacks.
 *
 * Security:
 * - Limits IPs to a maximum number of requests within a defined time window.
 * - Returns 429 Too Many Requests once the limit is breached.
 *
 * Architecture Notes:
 * - Currently uses in-memory storage, which resets on app restart and
 *   is isolated per node in a multi-node cluster.
 *
 * TODO: Integrate `rate-limit-redis` store for distributed rate limiting
 *       across multiple PM2/Kubernetes instances.
 */
import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { getRedisClient, isRedisConnected } from "../redis/redis";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 5, // Limit each IP to 5 requests per `windowMs`
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  store: isRedisConnected()
    ? new RedisStore({
        sendCommand: (...args: string[]) => getRedisClient().sendCommand(args),
      })
    : undefined, // Fallback to memory store if Redis is unavailable
  message: {
    success: false,
    message: "Too many attempts, try again later",
  },
});

export const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 20, // 20 requests per hour for AI
  standardHeaders: true,
  legacyHeaders: false,
  store: isRedisConnected()
    ? new RedisStore({
        sendCommand: (...args: string[]) => getRedisClient().sendCommand(args),
      })
    : undefined,
  message: {
    success: false,
    message: "Too many AI requests, please try again later",
  },
});