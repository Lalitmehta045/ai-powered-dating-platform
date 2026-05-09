import { Response } from "express";

import { notificationService } from "./notification.service";
import { AppError } from "../../errors/AppError";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import { AuthRequest } from "../../middleware/auth.middleware";

/**
 * Notification Controller
 *
 * REST endpoints for initial client hydration and state updates.
 */

/**
 * Get paginated notifications with unread count.
 * GET /api/v1/notifications
 */
export const getNotifications = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.userId) throw AppError.unauthorized();

    const page = Number(req.query.page) || undefined;
    const limit = Number(req.query.limit) || undefined;

    const result = await notificationService.getNotifications(
      req.userId,
      page,
      limit
    );

    return ApiResponse.ok(res, "Notifications retrieved", result);
  }
);

/**
 * Mark a notification as read.
 * PATCH /api/v1/notifications/read/:id
 */
export const markNotificationRead = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.userId) throw AppError.unauthorized();

    const notification = await notificationService.markAsRead(
      req.userId,
      String(req.params.id)
    );

    return ApiResponse.ok(res, "Notification marked as read", {
      notification: notification as unknown as Record<string, unknown>,
    });
  }
);
