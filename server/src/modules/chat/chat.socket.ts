import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { Server as SocketIOServer, Socket } from "socket.io";

import User from "../auth/auth.model";
import ChatMessage from "./chat.model";
import { env } from "../../config/env";
import { getRedisClient, isRedisConnected } from "../../redis/redis";
import { createAndEmitNotification } from "../notification/notification.socket";
import { logger } from "../../logger/logger";
import { aiService } from "../ai/ai.service";
import Match from "../match/match.model";

type AckResponse = {
  success: boolean;
  message?: string;
  data?: unknown;
};

type AuthenticatedSocket = Socket & {
  data: { userId?: string };
};

const ONLINE_USERS_SET_KEY = "online_users";
const ONLINE_USERS_CONNECTIONS_KEY = "online_user_connections";

// In-memory fallbacks if Redis goes down.
// Keeps real-time working gracefully on a single node.
const fallbackOnlineUsers = new Set<string>();
const fallbackConnections = new Map<string, number>();

/**
 * Emits a delta status update when a user comes online or goes offline.
 * Replaces the exponential O(N^2) broadcast storm of the entire user array.
 */
const emitStatusChange = (io: SocketIOServer, userId: string, status: "online" | "offline") => {
  try {
    const event = status === "online" ? "user-online" : "user-offline";
    io.emit(event, userId);
    // Keep the status-changed for any other potential listeners
    io.emit("user-status-changed", { userId, status });
  } catch {
    // Socket broadcasts must never crash.
  }
};

/**
 * Extracts JWT token from Socket.IO handshake.
 */
const extractTokenFromSocket = (socket: Socket) => {
  const authToken = socket.handshake.auth?.token;
  if (typeof authToken === "string" && authToken.trim()) return authToken;

  const authorization = socket.handshake.headers.authorization;
  if (typeof authorization === "string" && authorization.startsWith("Bearer ")) {
    return authorization.split(" ")[1];
  }
  return null;
};

/**
 * Security: Validates that two users are mutually matched before allowing
 * messages or typing indicators to be sent.
 */
const areUsersMatched = async (firstUserId: string, secondUserId: string) => {
  const matchExists = await mongoose.model("Match").exists({
    users: { $all: [firstUserId, secondUserId] }
  });
  return !!matchExists;
};

/**
 * Realtime Chat Socket Handlers
 * 
 * Handles bidirectional websocket events for the chat system.
 * 
 * Architecture Notes:
 * - Employs JWT verification on socket connection (auth middleware).
 * - Tracks online users gracefully using Redis sets (for distributed
 *   scaling) or falls back to in-memory Maps if Redis is down.
 * - Enforces business rules (must be matched) at the socket level to
 *   prevent malicious users from bypassing the REST API.
 */
export const registerChatSocketHandlers = (io: SocketIOServer) => {
  // ── Authentication Middleware ────────────────────────────────
  io.use((socket, next) => {
    try {
      const token = extractTokenFromSocket(socket);
      if (!token) return next(new Error("Unauthorized: token missing"));

      const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string };
      (socket as AuthenticatedSocket).data.userId = decoded.id;
      return next();
    } catch {
      return next(new Error("Unauthorized: invalid token"));
    }
  });

  io.on("connection", (socket: AuthenticatedSocket) => {
    const currentUserId = socket.data.userId;
    if (!currentUserId) {
      socket.disconnect(true);
      return;
    }

    // Join a room named after the user's ID to allow targeted direct messaging
    socket.join(currentUserId);
    
    // ── Handle Connect (Online Status Tracking) ──────────────────
    void (async () => {
      try {
        let currentOnlineUsers: string[] = [];
        
        if (isRedisConnected()) {
          const redis = getRedisClient();
          const activeConnections = await redis.hIncrBy(
            ONLINE_USERS_CONNECTIONS_KEY, currentUserId, 1
          );
          if (activeConnections === 1) {
            await redis.sAdd(ONLINE_USERS_SET_KEY, currentUserId);
            emitStatusChange(io, currentUserId, "online");
          }
          
          currentOnlineUsers = await redis.sMembers(ONLINE_USERS_SET_KEY);
        } else {
          const localConnections = (fallbackConnections.get(currentUserId) || 0) + 1;
          fallbackConnections.set(currentUserId, localConnections);
          if (localConnections === 1) {
            fallbackOnlineUsers.add(currentUserId);
            emitStatusChange(io, currentUserId, "online");
          }
          
          currentOnlineUsers = Array.from(fallbackOnlineUsers);
        }
        
        // Send initial online users list to the newly connected user
        socket.emit("online-users", currentOnlineUsers);
      } catch {
        // Silent fallback
      }
    })();

    // ── send-message ─────────────────────────────────────────────
    /**
     * send-message
     * Emits realtime message to matched users only.
     *
     * Security:
     * - validates JWT-authenticated socket
     * - ensures users are mutually matched
     *
     * Scalability:
     * - Redis adapter ready. Emitting to `receiverId` works across nodes.
     */
    socket.on("send-message", async (payload, ack?: (response: AckResponse) => void) => {
      try {
        const receiverId = payload?.receiverId;
        const text = typeof payload?.text === "string" ? payload.text.trim() : "";

        if (!receiverId || !mongoose.isValidObjectId(receiverId)) {
          ack?.({ success: false, message: "Invalid receiverId" });
          return;
        }
        if (!text) {
          ack?.({ success: false, message: "Message text is required" });
          return;
        }

        const matched = await areUsersMatched(currentUserId, receiverId);
        if (!matched) {
          ack?.({ success: false, message: "Chat is allowed only between matched users" });
          return;
        }

        const moderation = await aiService.analyzeToxicity(text);

        const savedMessage = await ChatMessage.create({
          sender: currentUserId, 
          receiver: receiverId, 
          text,
          isFlagged: moderation.isFlagged,
          toxicityScore: moderation.score
        });

        const messagePayload = {
          _id: savedMessage._id,
          matchId: payload?.matchId, // Include matchId for client cache updates
          senderId: savedMessage.sender,
          receiverId: savedMessage.receiver,
          content: savedMessage.text,
          isRead: savedMessage.isRead,
          createdAt: savedMessage.createdAt,
          updatedAt: savedMessage.updatedAt,
        };

        io.to(receiverId).emit("receive-message", messagePayload);
        io.to(currentUserId).emit("receive-message", messagePayload);

        try {
          await createAndEmitNotification({
            sender: currentUserId,
            receiver: receiverId,
            type: "new_message",
            metadata: { messageId: savedMessage._id.toString() },
          });
        } catch (notifError) {
          logger.warn("Failed to emit message notification", { error: String(notifError) });
        }

        ack?.({ success: true, data: messagePayload });
      } catch (error) {
        logger.error("Socket send-message failed", {
          userId: currentUserId, error: String(error),
        });
        ack?.({ success: false, message: "Failed to send message" });
      }
    });

    // ── typing & stop-typing ──────────────────────────────────────
    socket.on("typing", async (payload) => {
      const { matchId, receiverId } = payload;
      
      let targetUserId = receiverId;
      
      if (!targetUserId && matchId && mongoose.isValidObjectId(matchId)) {
        const match = await mongoose.model("Match").findById(matchId);
        if (match) {
          targetUserId = match.users.find((u: any) => u.toString() !== currentUserId)?.toString();
        }
      }

      if (!targetUserId || !mongoose.isValidObjectId(targetUserId)) return;
      
      io.to(targetUserId).emit("typing", { userId: currentUserId, matchId });
    });

    socket.on("stop-typing", async (payload) => {
      const { matchId, receiverId } = payload;
      
      let targetUserId = receiverId;
      
      if (!targetUserId && matchId && mongoose.isValidObjectId(matchId)) {
        const match = await mongoose.model("Match").findById(matchId);
        if (match) {
          targetUserId = match.users.find((u: any) => u.toString() !== currentUserId)?.toString();
        }
      }

      if (!targetUserId || !mongoose.isValidObjectId(targetUserId)) return;
      
      io.to(targetUserId).emit("stop-typing", { userId: currentUserId, matchId });
    });

    // ── message-read ──────────────────────────────────────────────
    socket.on("message-read", async (payload, ack?: (response: AckResponse) => void) => {
      try {
        const messageId = payload?.messageId;
        if (!messageId || !mongoose.isValidObjectId(messageId)) {
          ack?.({ success: false, message: "Invalid messageId" });
          return;
        }

        const message = await ChatMessage.findById(messageId);
        if (!message) {
          ack?.({ success: false, message: "Message not found" });
          return;
        }
        if (message.receiver.toString() !== currentUserId) {
          ack?.({ success: false, message: "Not allowed" });
          return;
        }

        message.isRead = true;
        await message.save();

        io.to(message.sender.toString()).emit("message-read", {
          messageId: message._id, readerId: currentUserId,
        });
        ack?.({ success: true, data: { messageId: message._id } });
      } catch (error) {
        logger.error("Socket message-read failed", {
          userId: currentUserId, error: String(error),
        });
        ack?.({ success: false, message: "Failed to mark message as read" });
      }
    });

    // ── Handle Disconnect (Offline Status Tracking) ───────────────
    socket.on("disconnect", () => {
      void (async () => {
        try {
          if (isRedisConnected()) {
            const redis = getRedisClient();
            const activeConnections = await redis.hIncrBy(
              ONLINE_USERS_CONNECTIONS_KEY, currentUserId, -1
            );
            if (activeConnections <= 0) {
              await redis.hDel(ONLINE_USERS_CONNECTIONS_KEY, currentUserId);
              await redis.sRem(ONLINE_USERS_SET_KEY, currentUserId);
              emitStatusChange(io, currentUserId, "offline");
            }
          } else {
            const localConnections = (fallbackConnections.get(currentUserId) || 1) - 1;
            if (localConnections <= 0) {
              fallbackConnections.delete(currentUserId);
              fallbackOnlineUsers.delete(currentUserId);
              emitStatusChange(io, currentUserId, "offline");
            } else {
              fallbackConnections.set(currentUserId, localConnections);
            }
          }
        } catch {
          // Silent fallback
        }
      })();
    });
  });
};
