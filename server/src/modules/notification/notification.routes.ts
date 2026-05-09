import express from "express";

import protect from "../../middleware/auth.middleware";
import { validateRequest } from "../../middleware/validateRequest";
import { notificationIdParamsSchema } from "./notification.validation";
import { getNotifications, markNotificationRead } from "./notification.controller";

/**
 * Notification Router
 * 
 * Handles REST read-operations and state-mutations for the notification system.
 */
const router = express.Router();

// GET /notifications — Paginated notifications with unread count
router.get("/", protect, getNotifications);

// PATCH /notifications/read/:id — Mark one notification as read
router.patch(
  "/read/:id",
  protect,
  validateRequest({ params: notificationIdParamsSchema }),
  markNotificationRead
);

export default router;
