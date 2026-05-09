import Notification from "./notification.model";
import { AppError } from "../../errors/AppError";
import { getIO } from "../../socket";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * Notification Service
 *
 * Handles HTTP retrieval and state management (marking as read) for user notifications.
 */
export class NotificationService {
  /**
   * Get paginated notifications with unread count.
   * 
   * Performance:
   * - Uses parallel queries (`Promise.all`) to fetch both the paginated list
   *   and the total unread count simultaneously, reducing latency.
   * - Populates basic sender details so the UI can render avatars and names.
   */
  async getNotifications(userId: string, pageRaw?: number, limitRaw?: number) {
    const page =
      pageRaw && Number.isInteger(pageRaw) && pageRaw > 0
        ? pageRaw
        : DEFAULT_PAGE;
    const limit =
      limitRaw && Number.isInteger(limitRaw) && limitRaw > 0
        ? Math.min(limitRaw, MAX_LIMIT)
        : DEFAULT_LIMIT;
    const skip = (page - 1) * limit;

    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ receiver: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("sender", "name photos")
        .select("-__v"),
      Notification.countDocuments({ receiver: userId, isRead: false }),
    ]);

    return { page, limit, unreadCount, results: notifications.length, notifications };
  }

  /**
   * Mark a single notification as read.
   * 
   * Flow:
   * 1. Update document in MongoDB.
   * 2. Immediately emit a socket event back to the user to sync UI state
   *    (e.g., if they have the app open on two tabs/devices, the badge clears everywhere).
   * 
   * @throws AppError 404 if notification doesn't exist or doesn't belong to the user.
   */
  async markAsRead(userId: string, notificationId: string) {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, receiver: userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      throw AppError.notFound("Notification not found");
    }

    try {
      const io = getIO();
      io.to(userId).emit("notification:read", { notificationId: notification._id });
    } catch {
      // Socket server may be unavailable during isolated tests.
    }

    return notification;
  }
}

export const notificationService = new NotificationService();
