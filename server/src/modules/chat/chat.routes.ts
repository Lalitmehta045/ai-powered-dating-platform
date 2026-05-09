import express from "express";

import protect from "../../middleware/auth.middleware";
import { validateRequest } from "../../middleware/validateRequest";
import { chatParamsSchema, sendMessageSchema } from "./chat.validation";
import { getChatHistory, getUnreadCounts, sendMessage, markAsRead } from "./chat.controller";

/**
 * Chat Router
 * 
 * Handles REST operations for the messaging system.
 */
const router = express.Router();

// GET /chat/unread-count — Unread message counts per conversation
router.get("/unread-count", protect, getUnreadCounts);

// GET /chat/:matchId/messages — Paginated chat history for a match
router.get(
  "/:matchId/messages",
  protect,
  validateRequest({ params: chatParamsSchema }),
  getChatHistory
);

// POST /chat/:matchId/messages — Send a new message
router.post(
  "/:matchId/messages",
  protect,
  validateRequest({ params: chatParamsSchema, body: sendMessageSchema }),
  sendMessage
);

// PUT /chat/:matchId/read — Mark messages as read
router.put(
  "/:matchId/read",
  protect,
  validateRequest({ params: chatParamsSchema }),
  markAsRead
);

export default router;
