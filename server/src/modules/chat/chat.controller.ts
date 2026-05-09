import { Response } from "express";

import { chatService } from "./chat.service";
import { AppError } from "../../errors/AppError";
import { asyncHandler } from "../../utils/asyncHandler";
import { AuthRequest } from "../../middleware/auth.middleware";
import { getIO } from "../../socket";
import { createAndEmitNotification } from "../notification/notification.socket";

/**
 * Chat Controller
 *
 * REST endpoints for initial client hydration (history and unread badges).
 */

/**
 * Get paginated chat history for a match.
 * GET /api/v1/chat/:matchId/messages
 */
export const getChatHistory = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.userId) throw AppError.unauthorized();

    const { matchId } = req.params;
    const page = Number(req.query.page) || undefined;
    const limit = Number(req.query.limit) || undefined;

    const result = await chatService.getChatHistory(
      req.userId,
      matchId,
      page,
      limit
    );

    return res.status(200).json({ success: true, data: result });
  }
);

/**
 * Send a message via REST.
 * POST /api/v1/chat/:matchId/messages
 */
export const sendMessage = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.userId) throw AppError.unauthorized();

    const { matchId } = req.params;
    const { content } = req.body;

    const message = await chatService.sendMessage(req.userId, matchId, content);

    // Emit to socket for real-time delivery
    try {
      const io = getIO();
      const messagePayload = {
        _id: message._id,
        matchId: matchId, // Added for client-side cache updating
        senderId: message.senderId,
        receiverId: message.receiverId,
        content: message.content,
        isRead: message.isRead,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
      };

      io.to(message.receiverId.toString()).emit("receive-message", messagePayload);
      io.to(message.senderId.toString()).emit("receive-message", messagePayload);

      // Create and emit notification
      await createAndEmitNotification({
        sender: message.senderId.toString(),
        receiver: message.receiverId.toString(),
        type: "new_message",
        metadata: { messageId: message._id.toString() },
      });
    } catch (err) {
      // Socket errors shouldn't break the REST response
    }

    return res.status(201).json({ success: true, data: message });
  }
);

/**
 * Mark messages as read.
 * PUT /api/v1/chat/:matchId/read
 */
export const markAsRead = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.userId) throw AppError.unauthorized();

    const { matchId } = req.params;

    const result = await chatService.markAsRead(req.userId, matchId);

    return res.status(200).json({ success: true, data: result });
  }
);

/**
 * Get unread message counts per conversation.
 * GET /api/v1/chat/unread-count
 */
export const getUnreadCounts = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.userId) throw AppError.unauthorized();

    const result = await chatService.getUnreadCounts(req.userId);
    return res.status(200).json({ success: true, data: result });
  }
);
