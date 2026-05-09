import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { getRedisClient, isRedisConnected } from "../redis/redis";

/**
 * Auth Rate Limiter — Brute-force protection for login/register.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  store: isRedisConnected()
    ? new RedisStore({
        sendCommand: (...args: string[]) => getRedisClient().sendCommand(args),
      })
    : undefined,
  message: {
    success: false,
    message: "Too many attempts, try again later",
  },
});

/**
 * AI API Rate Limiter — Protects expensive AI endpoints.
 */
export const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
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

/**
 * Admin Rate Limiter — Protects admin login from brute-force.
 */
export const adminAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  store: isRedisConnected()
    ? new RedisStore({
        sendCommand: (...args: string[]) => getRedisClient().sendCommand(args),
        prefix: "rl:admin:",
      })
    : undefined,
  message: {
    success: false,
    message: "Too many admin login attempts. Account locked for 15 minutes.",
  },
});

/**
 * General API Rate Limiter — Global request throttle.
 */
export const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  store: isRedisConnected()
    ? new RedisStore({
        sendCommand: (...args: string[]) => getRedisClient().sendCommand(args),
        prefix: "rl:general:",
      })
    : undefined,
  message: {
    success: false,
    message: "Too many requests. Please slow down.",
  },
});