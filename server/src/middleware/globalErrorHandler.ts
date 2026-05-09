import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { ZodError } from "zod";

import { AppError } from "../errors/AppError";
import { logger } from "../logger/logger";

/**
 * Global Error Handling Middleware
 *
 * Catches all errors forwarded via next(err) or thrown inside
 * asyncHandler-wrapped controllers. Normalizes error shapes into
 * a standard, predictable API response format for the client.
 *
 * Error Mapping Strategy:
 * 1. AppError: Operational errors thrown intentionally by business logic (e.g., 404 Not Found, 400 Bad Request).
 * 2. ZodError: Schema validation failures from `validateRequest` middleware. Maps to 400 Bad Request.
 * 3. Mongoose Errors:
 *    - CastError: Invalid ObjectIds in params (400 Bad Request).
 *    - ValidationError: DB-level schema validation failures (400 Bad Request).
 *    - MongoServerError (code 11000): Unique index violations (e.g., duplicate email) (409 Conflict).
 * 4. Unhandled/Unknown Errors: Treated as 500 Internal Server Error. Stack traces are omitted in production for security.
 *
 * Security & Observability:
 * - Logs all unexpected (non-operational) errors with stack traces.
 * - Hides stack traces from clients in production environments.
 */
export const globalErrorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // ── Operational AppError ────────────────────────────────────
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors.length > 0 ? { errors: err.errors } : {}),
    });
  }

  // ── Zod validation errors ──────────────────────────────────
  if (err instanceof ZodError) {
    const formatted = err.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: formatted,
    });
  }

  // ── Mongoose CastError (invalid ObjectId, etc.) ────────────
  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({
      success: false,
      message: `Invalid ${err.path}: ${String(err.value)}`,
    });
  }

  // ── Mongoose ValidationError ───────────────────────────────
  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  // ── MongoDB duplicate key error (code 11000) ───────────────
  if (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: number }).code === 11000
  ) {
    const keyValue = (err as { keyValue?: Record<string, unknown> }).keyValue;
    const field = keyValue ? Object.keys(keyValue)[0] : "field";

    return res.status(409).json({
      success: false,
      message: `Duplicate value for ${field}`,
    });
  }

  // ── Unexpected / non-operational errors ────────────────────
  const isProduction = process.env.NODE_ENV === "production";
  const errorMessage =
    err instanceof Error ? err.message : "Unknown error";

  // Only log non-operational 500 errors to avoid log spam from standard 400s/404s
  logger.error("Unhandled error", {
    error: errorMessage,
    ...(err instanceof Error && !isProduction
      ? { stack: err.stack }
      : {}),
  });

  return res.status(500).json({
    success: false,
    message: isProduction
      ? "Internal server error"
      : errorMessage,
    ...(!isProduction && err instanceof Error
      ? { stack: err.stack }
      : {}),
  });
};
