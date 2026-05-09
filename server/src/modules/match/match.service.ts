import User from "../auth/auth.model";
import Match from "./match.model";
import Swipe from "../swipe/swipe.model";
import { AppError } from "../../errors/AppError";
import { deleteCacheByPattern } from "../../redis/cache";
import {
  getRedisClient,
  isRedisConnected,
} from "../../redis/redis";
import { createAndEmitNotification } from "../notification/notification.socket";
import { logger } from "../../logger/logger";

// ── Constants ────────────────────────────────────────────────

const DAILY_SWIPE_LIMIT = 10;

// ── Private helpers ──────────────────────────────────────────

/**
 * Invalidates recommendation caches for specific users after a swipe.
 * Ensures that users do not see people they've already swiped on.
 */
const invalidateRecommendationCaches = async (
  ...userIds: string[]
) => {
  const uniqueUserIds = Array.from(new Set(userIds));
  for (const userId of uniqueUserIds) {
    const deleted = await deleteCacheByPattern(
      `recommendations:${userId}:*`
    );
    if (deleted > 0) {
      console.log(
        `[cache invalidated] recommendations:${userId}:* (${deleted})`
      );
    }
  }
};

/**
 * Enforces the daily swipe limit.
 * Uses Redis for high performance, falls back to DB query if Redis is down.
 * Premium users bypass this check.
 */
const enforceSwipeLimit = async (params: {
  userId: string;
  isPremium: boolean;
}) => {
  if (params.isPremium) {
    return { allowed: true };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let currentCount = 0;

  if (isRedisConnected()) {
    const key = `swipe_count:${params.userId}`;
    const redis = getRedisClient();
    currentCount = await redis.incr(key);

    if (currentCount === 1) {
      await redis.expire(key, 24 * 60 * 60); // 24 hours TTL
    }
  } else {
    // DB Fallback: Count swipes created today
    currentCount = await Swipe.countDocuments({
      swiperId: params.userId,
      createdAt: { $gte: today }
    });
    // Add 1 because we are checking for the NEXT swipe
    currentCount += 1;
  }

  if (currentCount > DAILY_SWIPE_LIMIT) {
    return {
      allowed: false,
      remaining: 0,
      limit: DAILY_SWIPE_LIMIT,
    };
  }

  return {
    allowed: true,
    remaining: DAILY_SWIPE_LIMIT - currentCount,
    limit: DAILY_SWIPE_LIMIT,
  };
};

/**
 * Match Service
 *
 * Handles the core interaction loop of the dating app: swiping right (like),
 * swiping left (dislike), and mutual match detection.
 *
 * Architecture Notes:
 * - Swipe limits are tracked via Redis for high write throughput.
 * - Match detection is performed inline during the swipe action. If a mutual
 *   like is found, the system creates a Match document and emits real-time
 *   Socket.IO notifications.
 * - Cache invalidation ensures the recommendation feed updates immediately.
 */
export class MatchService {
  /**
   * Swipe right (like) on a target user.
   * Handles match detection, notification emission, and swipe limits.
   * 
   * Flow:
   * 1. Check swipe limits (Redis).
   * 2. Add target to current user's `likedUsers`.
   * 3. Check if target user already liked current user (Match Detection).
   * 4. If Match: Create Match document, update both users' `matches` array, emit sockets.
   * 5. If No Match: Emit simple "profile_like" notification.
   * 
   * @throws AppError 400 if self-swipe or already liked.
   * @throws AppError 404 if either user not found.
   * @throws AppError 429 if daily swipe limit reached.
   */
  async swipeRight(currentUserId: string, targetUserId: string) {
    if (currentUserId === targetUserId) {
      throw AppError.badRequest("You cannot swipe yourself");
    }

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!currentUser || !targetUser) {
      logger.warn("Swipe failed: User not found", { currentUserId, targetUserId });
      throw AppError.notFound("User not found");
    }

    const swipeLimit = await enforceSwipeLimit({
      userId: currentUserId,
      isPremium: Boolean(currentUser.isPremium),
    });
    if (!swipeLimit.allowed) {
      throw AppError.tooManyRequests(
        "Daily swipe limit reached. Upgrade to premium for unlimited swipes.",
        [{ swipeLimit: swipeLimit.limit, remainingSwipes: 0 }]
      );
    }

    const alreadySwiped = await Swipe.findOne({
      swiperId: currentUserId,
      targetId: targetUserId,
    });

    if (alreadySwiped) {
      logger.warn("Swipe failed: Already swiped", { currentUserId, targetUserId });
      if (alreadySwiped.type === "like") {
        throw AppError.badRequest("Already liked");
      } else {
        throw AppError.badRequest("Already swiped");
      }
    }

    await Swipe.create({
      swiperId: currentUserId,
      targetId: targetUserId,
      type: "like"
    });

    await invalidateRecommendationCaches(currentUserId, targetUserId);

    // ── Check for match ────────────────────────────────────────
    const isMatch = await Swipe.exists({
      swiperId: targetUserId,
      targetId: currentUserId,
      type: "like"
    });

    if (isMatch) {
      const match = await Match.create({
        users: [currentUserId, targetUserId],
      });

      // Emit real-time match notifications
      try {
        await createAndEmitNotification({
          sender: currentUserId,
          receiver: targetUserId,
          type: "new_match",
          metadata: { matchId: match._id.toString() },
        });
        await createAndEmitNotification({
          sender: targetUserId,
          receiver: currentUserId,
          type: "new_match",
          metadata: { matchId: match._id.toString() },
        });
      } catch (error) {
        logger.warn("Failed to emit match notifications", {
          error: String(error),
        });
      }

      await invalidateRecommendationCaches(currentUserId, targetUserId);

      return {
        matched: true,
        match,
        remainingSwipes: swipeLimit.remaining,
      };
    }

    // Emit standard profile like notification
    try {
      await createAndEmitNotification({
        sender: currentUserId,
        receiver: targetUserId,
        type: "profile_like",
        metadata: {},
      });
    } catch (error) {
      logger.warn("Failed to emit profile-like notification", {
        error: String(error),
      });
    }

    return {
      matched: false,
      remainingSwipes: swipeLimit.remaining,
    };
  }

  /**
   * Swipe left (dislike) on a target user.
   * 
   * Flow:
   * 1. Check swipe limits.
   * 2. Add target to `dislikedUsers`.
   * 3. Invalidate caches.
   * 
   * @throws AppError 404 if user not found.
   * @throws AppError 400 if already disliked.
   * @throws AppError 429 if daily swipe limit reached.
   */
  async swipeLeft(currentUserId: string, targetUserId: string) {
    const currentUser = await User.findById(currentUserId);

    if (!currentUser) {
      throw AppError.notFound("User not found");
    }

    const swipeLimit = await enforceSwipeLimit({
      userId: currentUserId,
      isPremium: Boolean(currentUser.isPremium),
    });
    if (!swipeLimit.allowed) {
      throw AppError.tooManyRequests(
        "Daily swipe limit reached. Upgrade to premium for unlimited swipes.",
        [{ swipeLimit: swipeLimit.limit, remainingSwipes: 0 }]
      );
    }

    const alreadySwiped = await Swipe.exists({
      swiperId: currentUserId,
      targetId: targetUserId,
    });

    if (alreadySwiped) {
      throw AppError.badRequest("Already swiped");
    }

    await Swipe.create({
      swiperId: currentUserId,
      targetId: targetUserId,
      type: "dislike"
    });

    await invalidateRecommendationCaches(currentUserId, targetUserId);

    return { remainingSwipes: swipeLimit.remaining };
  }

  async getMatches(userId: string) {
    const matches = await Match.find({ users: userId }).populate(
      "users",
      "name email bio photos interests profileImage"
    );

    return matches;
  }
}

export const matchService = new MatchService();
