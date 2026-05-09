import User from "../../auth/auth.model";
import Swipe from "../../swipe/swipe.model";
import Match from "../../match/match.model";
import ChatMessage from "../../chat/chat.model";
import { getRedisClient, isRedisConnected } from "../../../redis/redis";

export class AnalyticsService {
  private readonly CACHE_KEY_OVERVIEW = "admin:analytics:overview";
  private readonly CACHE_TTL = 3600; // 1 hour

  /**
   * Get overview statistics with caching.
   */
  async getOverviewStats() {
    // 1. Try to get from cache
    if (isRedisConnected()) {
      const cachedData = await getRedisClient().get(this.CACHE_KEY_OVERVIEW);
      if (cachedData) {
        return JSON.parse(cachedData);
      }
    }

    // 2. Aggregate data from DB
    const [
      totalUsers,
      premiumUsers,
      genderDistribution,
      swipeStats,
      matchStats,
      chatActivity
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isPremium: true }),
      this.getGenderDistribution(),
      this.getDailyStats(Swipe, "createdAt", "swipes"),
      this.getDailyStats(Match, "matchedAt", "matches"),
      this.getDailyStats(ChatMessage, "createdAt", "messages")
    ]);

    const stats = {
      overview: {
        totalUsers,
        premiumUsers,
        premiumConversionRate: totalUsers > 0 ? ((premiumUsers / totalUsers) * 100).toFixed(2) : 0,
        activeToday: await User.countDocuments({ updatedAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } })
      },
      genderDistribution,
      engagement: {
        swipes: swipeStats,
        matches: matchStats,
        messages: chatActivity
      },
      lastUpdated: new Date()
    };

    // 3. Save to cache
    if (isRedisConnected()) {
      await getRedisClient().setEx(
        this.CACHE_KEY_OVERVIEW,
        this.CACHE_TTL,
        JSON.stringify(stats)
      );
    }

    return stats;
  }

  /**
   * Get real-time metrics (lower latency, no cache or short cache).
   */
  async getRealtimeStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [onlineUsers, swipesToday, matchesToday] = await Promise.all([
      User.countDocuments({ updatedAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) } }),
      Swipe.countDocuments({ createdAt: { $gte: today } }),
      Match.countDocuments({ matchedAt: { $gte: today } })
    ]);

    return {
      onlineUsers,
      swipesToday,
      matchesToday,
      timestamp: new Date()
    };
  }

  private async getGenderDistribution() {
    const stats = await User.aggregate([
      { $group: { _id: "$gender", count: { $sum: 1 } } }
    ]);
    return stats.map((s: { _id: string; count: number }) => ({ name: s._id || "Unknown", value: s.count }));
  }

  private async getDailyStats(model: any, dateField: string, label: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const stats = await model.aggregate([
      { $match: { [dateField]: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: `$${dateField}` } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return stats.map((s: { _id: string; count: number }) => ({ date: s._id, [label]: s.count }));
  }
}

export const analyticsService = new AnalyticsService();
