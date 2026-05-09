import { Request, Response, NextFunction } from "express";

/**
 * Async Route Handler Wrapper
 *
 * A higher-order function that wraps Express asynchronous route handlers.
 *
 * Problem Solved:
 * Express v4 does not automatically catch unhandled promise rejections
 * inside async route handlers. Without this wrapper, every controller
 * method would need an explicit `try/catch` block calling `next(error)`.
 *
 * How It Works:
 * It executes the async handler, catches any rejected promises, and
 * passes them to the `next()` function, routing the error straight to
 * the `globalErrorHandler`.
 */
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
