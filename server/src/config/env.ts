/**
 * Environment Configuration
 *
 * Centralized, type-safe environment variable handling using Zod.
 *
 * How It Works:
 * - Every env var is declared in a single Zod schema with
 *   validation constraints and sensible defaults.
 * - On startup, `safeParse` validates the entire process.env.
 *   If any required variable is missing or malformed, the
 *   process exits immediately with a descriptive error —
 *   eliminating silent `undefined` failures in production.
 * - After parsing, `env` is a fully-typed object: consumers
 *   get autocomplete and compile-time safety.
 *
 * Design Decisions:
 * - REDIS_URL and RAZORPAY_* are optional because the app
 *   degrades gracefully without them (cache becomes no-op,
 *   payment endpoints return errors).
 * - PORT is transformed from string to number because all
 *   env vars arrive as strings from the OS.
 *
 * Usage:
 *   import { env } from "./config/env";
 *   // env.PORT is typed as `number`, env.JWT_SECRET as `string`
 */
import { z } from "zod";

const envSchema = z.object({
  // ── Server ───────────────────────────────────────────────────
  PORT: z
    .string()
    .default("5000")
    .transform((val) => parseInt(val, 10)),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // ── MongoDB ──────────────────────────────────────────────────
  MONGO_URI: z.string().min(1, "MONGO_URI is required"),

  // ── JWT — dual-token strategy (access + refresh) ─────────────
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  JWT_REFRESH_SECRET: z.string().min(1, "JWT_REFRESH_SECRET is required"),

  // ── Cloudinary — profile photo CDN ───────────────────────────
  CLOUDINARY_NAME: z.string().min(1, "CLOUDINARY_NAME is required"),
  CLOUDINARY_KEY: z.string().min(1, "CLOUDINARY_KEY is required"),
  CLOUDINARY_SECRET: z.string().min(1, "CLOUDINARY_SECRET is required"),

  // ── Client — allowed CORS origin ─────────────────────────────
  CLIENT_URL: z.string().default(process.env.CLIENT_URL || "http://localhost:5173"),

  // ── Redis (optional — app degrades gracefully without it) ────
  REDIS_URL: z.string().optional(),

  // ── Razorpay (optional — payment features disabled if missing)
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "❌ Invalid environment variables:",
    JSON.stringify(parsed.error.flatten().fieldErrors, null, 2)
  );
  process.exit(1);
}

export const env = parsed.data;
