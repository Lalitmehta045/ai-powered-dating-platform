import Transaction from "../../payment/transaction.model";
import User from "../../auth/auth.model";
import { AppError } from "../../../errors/AppError";
import { auditService } from "../audit/audit.service";

export class AdminPremiumService {
  /**
   * Get revenue statistics and trends
   */
  async getRevenueStats() {
    const now = new Date();
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setFullYear(now.getFullYear() - 1);

    const [totalRevenue, monthlyRevenue, yearlyRevenue] = await Promise.all([
      Transaction.aggregate([{ $match: { status: "success" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
      Transaction.countDocuments({ subscriptionType: "monthly", status: "success" }),
      Transaction.countDocuments({ subscriptionType: "yearly", status: "success" })
    ]);

    const trends = await Transaction.aggregate([
      { 
        $match: { 
          status: "success", 
          timestamp: { $gte: twelveMonthsAgo } 
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$timestamp" } },
          revenue: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const totalUsers = await User.countDocuments();
    const premiumUsers = await User.countDocuments({ isPremium: true });

    return {
      overview: {
        totalRevenue: totalRevenue[0]?.total || 0,
        monthlySubs: monthlyRevenue,
        yearlySubs: yearlyRevenue,
        conversionRate: totalUsers > 0 ? ((premiumUsers / totalUsers) * 100).toFixed(2) : 0,
        totalPremiumUsers: premiumUsers
      },
      trends: trends.map(t => ({ month: t._id, revenue: t.revenue, count: t.count }))
    };
  }

  /**
   * Get premium user directory
   */
  async getPremiumUsers(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    
    const [users, total] = await Promise.all([
      User.find({ isPremium: true })
        .select("name email subscriptionType premiumExpiresAt createdAt photos")
        .sort({ premiumExpiresAt: 1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments({ isPremium: true })
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Manually adjust user subscription
   */
  async adjustSubscription(userId: string, data: any, adminId: string, ip?: string, ua?: string) {
    const { isPremium, subscriptionType, expiryDays } = data;
    
    const update: any = { isPremium };
    if (isPremium) {
      update.subscriptionType = subscriptionType || "monthly";
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + (expiryDays || 30));
      update.premiumExpiresAt = expiry;
    } else {
      update.subscriptionType = "free";
      update.premiumExpiresAt = null;
    }

    const user = await User.findByIdAndUpdate(userId, update, { new: true }).select("-password");
    if (!user) throw AppError.notFound("User not found");
    
    // Record Audit Log
    await auditService.recordLog({
      adminId,
      action: "SUBSCRIPTION_ADJUST",
      targetType: "User",
      targetId: userId,
      details: { isPremium, subscriptionType, expiryDays },
      ipAddress: ip,
      userAgent: ua
    });

    return user;
  }
}

export const adminPremiumService = new AdminPremiumService();
