import { Response } from "express";

import { userService } from "./user.service";
import { AppError } from "../../errors/AppError";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import { AuthRequest } from "../../middleware/auth.middleware";

/**
 * User Controller
 *
 * Handles HTTP request/response mapping for user profiles,
 * discovery, recommendations, and profile boosting.
 * 
 * Architecture Notes:
 * - Delegates all caching, DB, and Cloudinary interactions to `UserService`.
 */

/**
 * Get the current user's profile.
 * GET /api/v1/users/me
 */
export const getMyProfile = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.userId) throw AppError.unauthorized();

    const payload = await userService.getProfile(req.userId);
    return ApiResponse.ok(res, "Profile retrieved", { user: payload.user });
  }
);

/**
 * Update the current user's profile.
 * PATCH /api/v1/users/update
 */
export const updateProfile = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.userId) throw AppError.unauthorized();

    const user = await userService.updateProfile(req.userId, req.body);
    return ApiResponse.ok(res, "Profile updated", { user });
  }
);

/**
 * Upload a profile photo.
 * 
 * Flow:
 * 1. Multer middleware buffers file in memory.
 * 2. Service uploads buffer to Cloudinary and saves URL to DB.
 * 
 * POST /api/v1/users/upload-photo
 */
export const uploadProfilePhoto = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.userId) throw AppError.unauthorized();
    if (!req.file) throw AppError.badRequest("No file uploaded");

    const photos = await userService.uploadPhoto(req.userId, req.file);
    return ApiResponse.ok(res, "Photo uploaded", { photos: photos as unknown as Record<string, unknown> });
  }
);

/**
 * Basic discover feed.
 * GET /api/v1/users/discover
 */
export const discoverUsers = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.userId) throw AppError.unauthorized();

    const users = await userService.discoverUsers(req.userId);
    return ApiResponse.ok(res, "Users discovered", { users: users as unknown as Record<string, unknown> });
  }
);

/**
 * Ranked recommendation engine.
 * GET /api/v1/users/recommendations
 */
export const getRecommendations = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.userId) throw AppError.unauthorized();

    const filters = {
      page: Number(req.query.page) || undefined,
      limit: Number(req.query.limit) || undefined,
      minAge: Number(req.query.minAge) || undefined,
      maxAge: Number(req.query.maxAge) || undefined,
    };

    const payload = await userService.getRecommendations(
      req.userId,
      filters,
      req.query as Record<string, unknown>
    );
    
    return ApiResponse.paginated(res, "Recommendations retrieved", {
      page: payload.page,
      limit: payload.limit,
      results: payload.results,
      users: payload.users
    });
  }
);

/**
 * Activate profile boost (premium only).
 * POST /api/v1/users/boost
 */
export const boostProfile = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.userId) throw AppError.unauthorized();

    const result = await userService.boostProfile(req.userId);
    return ApiResponse.ok(res, "Profile boost activated for 30 minutes", result);
  }
);