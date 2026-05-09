import { Request, Response } from "express";

import { authService } from "./auth.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";

/**
 * Auth Controller
 *
 * Handles HTTP request/response mapping for authentication endpoints.
 * Leaves all business logic (hashing, DB queries, token generation)
 * to the `AuthService`.
 */

/**
 * Register a new user.
 * 
 * Flow:
 * 1. Zod middleware validates request body.
 * 2. Service creates user and generates tokens.
 * 3. Controller sets HTTP-only cookie for refresh token and
 *    returns access token + sanitized user profile in JSON.
 * 
 * POST /api/v1/auth/register
 */
export const registerUser = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await authService.register(req.body);

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return ApiResponse.created(res, "Registration successful", {
      accessToken: result.accessToken,
      user: result.user,
    });
  }
);

/**
 * Authenticate an existing user.
 * 
 * Flow:
 * 1. Zod middleware validates request body.
 * 2. Service verifies credentials and generates tokens.
 * 3. Controller sets HTTP-only cookie for refresh token and
 *    returns access token + sanitized user profile in JSON.
 * 
 * POST /api/v1/auth/login
 */
export const loginUser = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await authService.login(req.body);

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return ApiResponse.ok(res, "Login successful", {
      accessToken: result.accessToken,
      user: result.user,
    });
  }
);