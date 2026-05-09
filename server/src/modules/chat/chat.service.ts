import mongoose from "mongoose";

import User from "../auth/auth.model";
import ChatMessage from "./chat.model";
import { AppError } from "../../errors/AppError";

// ── Constants ────────────────────────────────────────────────

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * Chat Service
 *
 * Handles HTTP retrieval of paginated chat history and aggregation of
 * unread message counts.
 * 
 * Architecture Notes:
 * - Write operations (sending messages, marking read) are handled
 *   exclusively via Websockets (`chat.socket.ts`) for real-time speed.
 * - This service handles the initial "hydration" of state when a client
 *   first opens a chat window or boots the app.
 */
export class ChatService {
  /**
   * Get paginated chat history for a specific match.
   * 
   * Security:
   * - Validates that the current user is part of the match.
   * 
   * @throws AppError 404 if the match does not exist.
   * @throws AppError 403 if the user is not part of the match.
   */
  async getChatHistory(
    currentUserId: string,
    matchId: string,
    pageRaw?: number,
    limitRaw?: number
  ) {
    const page =
      pageRaw && Number.isInteger(pageRaw) && pageRaw > 0
        ? pageRaw
        : DEFAULT_PAGE;
    const limit =
      limitRaw && Number.isInteger(limitRaw) && limitRaw > 0
        ? Math.min(limitRaw, MAX_LIMIT)
        : DEFAULT_LIMIT;
    const skip = (page - 1) * limit;

    const match = await mongoose.model("Match").findById(matchId);
    if (!match) {
      throw AppError.notFound("Match not found");
    }

    if (!match.users.map((u: any) => u.toString()).includes(currentUserId)) {
      throw AppError.forbidden("You are not part of this match");
    }

    const [user1, user2] = match.users;

    const messages = await ChatMessage.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 },
      ],
    })
      .sort({ createdAt: -1 }) // Sort by newest first for pagination
      .skip(skip)
      .limit(limit)
      .select("-__v");

    // Return in ascending order for the UI with property mapping
    return messages.reverse().map(m => ({
      _id: m._id,
      senderId: m.sender,
      receiverId: m.receiver,
      content: m.text,
      isRead: m.isRead,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt
    }));
  }

  /**
   * Send a new message within a match.
   */
  async sendMessage(currentUserId: string, matchId: string, text: string) {
    const match = await mongoose.model("Match").findById(matchId);
    if (!match) throw AppError.notFound("Match not found");

    if (!match.users.map((u: any) => u.toString()).includes(currentUserId)) {
      throw AppError.forbidden("You are not part of this match");
    }

    const receiverId = match.users.find((u: any) => u.toString() !== currentUserId);

    const message = await ChatMessage.create({
      sender: currentUserId,
      receiver: receiverId,
      text,
    });

    return {
      _id: message._id,
      senderId: message.sender,
      receiverId: message.receiver,
      content: message.text,
      isRead: message.isRead,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt
    };
  }

  /**
   * Mark all messages in a match as read.
   */
  async markAsRead(currentUserId: string, matchId: string) {
    const match = await mongoose.model("Match").findById(matchId);
    if (!match) throw AppError.notFound("Match not found");

    if (!match.users.map((u: any) => u.toString()).includes(currentUserId)) {
      throw AppError.forbidden("You are not part of this match");
    }

    const otherUserId = match.users.find((u: any) => u.toString() !== currentUserId);

    await ChatMessage.updateMany(
      {
        sender: otherUserId,
        receiver: currentUserId,
        isRead: false,
      },
      { $set: { isRead: true } }
    );

    return { success: true };
  }

  /**
   * Get unread message counts grouped by conversation partner.
   * 
   * Performance:
   * - Uses MongoDB Aggregation to group and count unread messages
   *   in a single optimized database trip, returning exactly what
   *   the UI needs to render notification badges.
   */
  async getUnreadCounts(userId: string) {
    const unreadPerConversation = await ChatMessage.aggregate([
      {
        $match: {
          receiver: new mongoose.Types.ObjectId(userId),
          isRead: false,
        },
      },
      {
        $group: {
          _id: "$sender",
          unreadCount: { $sum: 1 },
          latestMessageAt: { $max: "$createdAt" },
        },
      },
      { $sort: { latestMessageAt: -1 } },
      {
        $project: {
          _id: 0,
          userId: "$_id",
          unreadCount: 1,
          latestMessageAt: 1,
        },
      },
    ]);

    const totalUnread = unreadPerConversation.reduce(
      (acc, item) => acc + item.unreadCount,
      0
    );

    return { totalUnread, conversations: unreadPerConversation };
  }
}

export const chatService = new ChatService();
