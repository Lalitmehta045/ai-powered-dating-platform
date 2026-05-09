/**
 * Custom Operational Error Class
 *
 * Extends the native JavaScript Error object to include HTTP status codes
 * and validation payload structures.
 *
 * Architecture Notes:
 * - Distinguishes between "Operational" errors (predictable things like
 *   "User not found" or "Invalid password") and "Programming" errors
 *   (like a syntax error or failed database connection).
 * - Controllers and Services throw `AppError` instances, which are
 *   automatically caught by `asyncHandler` and formatted into standard
 *   JSON by `globalErrorHandler`.
 * - Factory methods (e.g., `AppError.notFound()`) ensure consistent
 *   status codes and reduce boilerplate across the service layer.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errors: unknown[];

  constructor(
    message: string,
    statusCode: number,
    errors: unknown[] = [],
    isOperational = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  // ── Factory methods ────────────────────────────────────────

  static badRequest(message = "Bad request", errors: unknown[] = []) {
    return new AppError(message, 400, errors);
  }

  static unauthorized(message = "Unauthorized") {
    return new AppError(message, 401);
  }

  static forbidden(message = "Forbidden") {
    return new AppError(message, 403);
  }

  static notFound(message = "Resource not found") {
    return new AppError(message, 404);
  }

  static conflict(message = "Conflict") {
    return new AppError(message, 409);
  }

  static tooManyRequests(message = "Too many requests", errors: unknown[] = []) {
    return new AppError(message, 429, errors);
  }

  static internal(message = "Internal server error") {
    return new AppError(message, 500, [], false);
  }
}
