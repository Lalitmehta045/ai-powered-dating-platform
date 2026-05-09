import { Response } from "express";

/**
 * Standardized API Response Format
 *
 * Enforces a strict, predictable JSON shape across all endpoints.
 * This simplifies frontend consumption and error handling.
 *
 * Standard Shape:
 * {
 *   success: boolean;
 *   message: string;
 *   ...data (e.g., user object, token, etc.)
 * }
 *
 * Pagination Shape:
 * {
 *   success: true;
 *   message: string;
 *   page: number;
 *   limit: number;
 *   results: number;
 *   ...data
 * }
 *
 * Architecture Notes:
 * - Encapsulates standard HTTP status codes (200, 201) to keep
 *   controllers clean.
 * - Used universally by controllers for successful responses;
 *   errors are handled by the AppError class and globalErrorHandler.
 */
export class ApiResponse {
  static success(
    res: Response,
    statusCode: number,
    message: string,
    data?: any
  ) {
    return res.status(statusCode).json({
      success: true,
      message,
      data: data || null,
    });
  }

  static created(
    res: Response,
    message: string,
    data?: any
  ) {
    return ApiResponse.success(res, 201, message, data);
  }

  static ok(
    res: Response,
    message: string,
    data?: any
  ) {
    return ApiResponse.success(res, 200, message, data);
  }

  static paginated(
    res: Response,
    message: string,
    pagination: {
      page: number;
      limit: number;
      results: number;
      [key: string]: unknown;
    }
  ) {
    return res.status(200).json({
      success: true,
      message,
      data: pagination,
    });
  }
}
