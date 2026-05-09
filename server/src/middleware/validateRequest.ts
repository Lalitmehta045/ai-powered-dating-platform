/**
 * Zod Request Validation Middleware
 *
 * Centralized, type-safe request validation.
 *
 * How It Works:
 * - Accepts optional schemas for `body`, `params`, and `query`.
 * - Executes Zod's `parse()`, which simultaneously validates structure,
 *   enforces types, and strips out unknown fields.
 * - Parsed values replace the originals on the request object,
 *   ensuring downstream controllers and services receive pristine,
 *   guaranteed data.
 *
 * Error Handling:
 * - If validation fails, Zod throws a `ZodError`.
 * - The error propagates automatically to the `globalErrorHandler`,
 *   which formats the detailed field-level issues into a clean
 *   400 Bad Request API response.
 *
 * @example
 * router.post(
 *   "/register",
 *   validateRequest({ body: registerSchema }),
 *   registerUser
 * );
 */
import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export const validateRequest = (schemas: {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
}) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    // Note: parse() handles stripping unknown keys if schema uses .strip() or default behavior
    if (schemas.body) {
      req.body = schemas.body.parse(req.body);
    }

    if (schemas.params) {
      req.params = schemas.params.parse(req.params) as typeof req.params;
    }

    if (schemas.query) {
      req.query = schemas.query.parse(req.query) as typeof req.query;
    }

    next();
  };
};
