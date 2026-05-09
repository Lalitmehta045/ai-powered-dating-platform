import User from "../../auth/auth.model";
import Match from "../../match/match.model";
import Swipe from "../../swipe/swipe.model";
import ChatMessage from "../../chat/chat.model";
import { AppError } from "../../../errors/AppError";
import { auditService } from "../audit/audit.service";

export class AdminUserService {
  /**
   * Get paginated and filtered list of users
   */
  async getUsers(query: any) {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      status, 
      gender, 
      isPremium, 
      sortBy = "createdAt", 
      sortOrder = "desc" 
    } = query;

    const filter: any = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    if (status) filter.status = status;
    if (gender) filter.gender = gender;
    if (isPremium !== undefined) filter.isPremium = isPremium === "true";

    const skip = (Number(page) - 1) * Number(limit);
    const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-password")
        .sort(sort as any)
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(filter)
    ]);

    return {
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    };
  }

  /**
   * Get detailed user profile with activity stats
   */
  async getUserById(userId: string) {
    const user = await User.findById(userId).select("-password");
    if (!user) {
      throw AppError.notFound("User not found");
    }

    const [matchCount, swipeCount, messageCount] = await Promise.all([
      Match.countDocuments({ users: userId }),
      Swipe.countDocuments({ swiperId: userId }),
      ChatMessage.countDocuments({ sender: userId })
    ]);

    return {
      user,
      activity: {
        matchCount,
        swipeCount,
        messageCount
      }
    };
  }

  /**
   * Update user administrative status
   */
  async updateUserStatus(userId: string, status: string, suspensionDays: number | undefined, adminId: string, ip?: string, ua?: string) {
    const update: any = { status };

    if (status === "suspended" && suspensionDays) {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + suspensionDays);
      update.suspensionExpiresAt = expiry;
    } else {
      update.suspensionExpiresAt = null;
    }

    const user = await User.findByIdAndUpdate(userId, update, { new: true }).select("-password");
    if (!user) {
      throw AppError.notFound("User not found");
    }

    // Record Audit Log
    await auditService.recordLog({
      adminId,
      action: `USER_${status.toUpperCase()}`,
      targetType: "User",
      targetId: userId,
      details: { status, suspensionDays },
      ipAddress: ip,
      userAgent: ua
    });

    return user;
  }

  /**
   * Toggle premium status
   */
  async togglePremium(userId: string, isPremium: boolean, adminId: string, ip?: string, ua?: string) {
    const update: any = { isPremium };
    if (isPremium) {
      update.subscriptionType = "yearly";
      const expiry = new Date();
      expiry.setFullYear(expiry.getFullYear() + 1);
      update.premiumExpiresAt = expiry;
    } else {
      update.subscriptionType = "free";
      update.premiumExpiresAt = null;
    }

    const user = await User.findByIdAndUpdate(userId, update, { new: true }).select("-password");
    
    // Record Audit Log
    await auditService.recordLog({
      adminId,
      action: isPremium ? "PREMIUM_GRANT" : "PREMIUM_REVOKE",
      targetType: "User",
      targetId: userId,
      details: { isPremium },
      ipAddress: ip,
      userAgent: ua
    });

    return user;
  }
}

export const adminUserService = new AdminUserService();
