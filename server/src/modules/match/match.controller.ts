import { Response } from "express";

import { matchService } from "./match.service";
import { AppError } from "../../errors/AppError";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import { AuthRequest } from "../../middleware/auth.middleware";

/**
 * Match Controller
 *
 * HTTP endpoints for swipe actions and retrieving the user's match list.
 */

/**
 * Swipe right (like) on a user.
 * POST /api/v1/swipes/right/:id
 */
export const swipeRight = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.userId) throw AppError.unauthorized();

    const targetUserId = String(req.params.id);
    const result = await matchService.swipeRight(req.userId, targetUserId);

    if (result.matched) {
      return ApiResponse.ok(res, "It's a match ❤️", {
        match: result.match as unknown as Record<string, unknown>,
        remainingSwipes: result.remainingSwipes as unknown as Record<string, unknown>,
      });
    }

    return ApiResponse.ok(res, "User liked", {
      remainingSwipes: result.remainingSwipes as unknown as Record<string, unknown>,
    });
  }
);

/**
 * Swipe left (dislike) on a user.
 * POST /api/v1/swipes/left/:id
 */
export const swipeLeft = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.userId) throw AppError.unauthorized();

    const targetUserId = String(req.params.id);
    const result = await matchService.swipeLeft(req.userId, targetUserId);

    return ApiResponse.ok(res, "User disliked", {
      remainingSwipes: result.remainingSwipes as unknown as Record<string, unknown>,
    });
  }
);

/**
 * Get all matches for the current user.
 * GET /api/v1/matches/list
 */
export const getMatches = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.userId) throw AppError.unauthorized();

    const matches = await matchService.getMatches(req.userId);
    return ApiResponse.ok(res, "Matches retrieved", matches);
  }
);