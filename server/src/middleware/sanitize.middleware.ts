/**
 * Data Sanitization Middleware
 *
 * Protects the database against NoSQL Injection attacks.
 *
 * Security:
 * - Recursively scans the incoming `req.body`.
 * - Strips out keys containing `$` or `.` characters, which are
 *   reserved operators in MongoDB (e.g., `$gt`, `$ne`).
 * - Prevents attackers from injecting query operators into JSON
 *   payloads that are blindly passed to Mongoose queries.
 *
 * Architecture Notes:
 * - Applied globally before route validation.
 * - Written as a lightweight custom utility to avoid heavy
 *   dependencies like `express-mongo-sanitize` while maintaining
 *   exact control over object traversal.
 */
import { NextFunction, Request, Response } from "express";

/**
 * Recursively traverses an object/array and strips keys with forbidden characters.
 */
const sanitizeValue = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item));
  }

  if (value && typeof value === "object") {
    const sanitized: Record<string, unknown> = {};
    for (const [key, nestedValue] of Object.entries(
      value as Record<string, unknown>
    )) {
      // MongoDB reserved characters
      if (key.includes("$") || key.includes(".")) {
        continue;
      }
      sanitized[key] = sanitizeValue(nestedValue);
    }
    return sanitized;
  }

  return value;
};

export const sanitizeRequest = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeValue(req.body);
  }
  next();
};
