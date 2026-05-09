import Notification from "./notification.model";
import User from "../auth/auth.model";
import { AppError } from "../../errors/AppError";
import { getIO } from "../../socket";
import { auditService } from "../admin/audit/audit.service";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export class NotificationService {
  /**
   * Create a single notification (Internal)
   */
  async createNotification(data: {
    receiver: string;
    sender?: string;
    type: string;
    title: string;
    message: string;
    metadata?: any;
  }) {
    const notification = await Notification.create(data);
    
    try {
      const io = getIO();
      io.to(data.receiver).emit("notification:new", notification);
    } catch {
      // Socket not available
    }

    return notification;
  }

  /**
   * Broadcast notification to many users
   */
  async broadcastNotification(data: {
    title: string;
    message: string;
    target: "all" | "premium" | "free" | "male" | "female";
    senderId?: string;
  }) {
    const filter: any = {};
    if (data.target === "premium") filter.isPremium = true;
    if (data.target === "free") filter.isPremium = false;
    if (data.target === "male") filter.gender = "male";
    if (data.target === "female") filter.gender = "female";

    const users = await User.find(filter).select("_id");
    const userIds = users.map(u => u._id);

    if (userIds.length === 0) {
      throw AppError.badRequest("No users found for the selected target audience");
    }

    // Bulk create notifications
    const notifications = userIds.map(id => ({
      receiver: id,
      sender: data.senderId,
      type: "announcement",
      title: data.title,
      message: data.message,
    }));

    await Notification.insertMany(notifications);

    // Record Audit Log
    await auditService.recordLog({
      adminId: data.senderId!,
      action: "BROADCAST_SEND",
      targetType: "System",
      details: { title: data.title, target: data.target, userCount: userIds.length }
    });

    // Real-time broadcast
    try {
      const io = getIO();
      // If broad enough, broadcast to all. If segmented, emit to relevant groups if possible
      // For now, emit to each userId individually or use a global room
      if (data.target === "all") {
        io.emit("notification:broadcast", { title: data.title, message: data.message });
      } else {
        userIds.forEach(id => {
          io.to(id.toString()).emit("notification:new", { 
            title: data.title, 
            message: data.message,
            type: "announcement"
          });
        });
      }
    } catch {
      // Socket not available
    }

    return { count: userIds.length };
  }

  async getNotifications(userId: string, pageRaw?: number, limitRaw?: number) {
    const page = pageRaw && Number.isInteger(pageRaw) && pageRaw > 0 ? pageRaw : DEFAULT_PAGE;
    const limit = limitRaw && Number.isInteger(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, MAX_LIMIT) : DEFAULT_LIMIT;
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

  async markAsRead(userId: string, notificationId: string) {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, receiver: userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) throw AppError.notFound("Notification not found");

    try {
      const io = getIO();
      io.to(userId).emit("notification:read", { notificationId: notification._id });
    } catch {}

    return notification;
  }
}

export const notificationService = new NotificationService();
