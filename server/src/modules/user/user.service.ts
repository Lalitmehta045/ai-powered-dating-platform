import mongoose from "mongoose";

import User from "../auth/auth.model";
import Swipe from "../swipe/swipe.model";
import cloudinary from "../../config/cloudinary";
import { AppError } from "../../errors/AppError";
import { sanitizeUser } from "../auth/user.dto";
import {
  deleteCache,
  deleteCacheByPattern,
  getCache,
  setCache,
} from "../../redis/cache";
import {
  getRedisClient,
  isRedisConnected,
} from "../../redis/redis";

// ── Constants ────────────────────────────────────────────────

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;
const PROFILE_CACHE_TTL_SECONDS = 10 * 60;
const RECOMMENDATIONS_CACHE_TTL_SECONDS = 5 * 60;
const BOOST_TTL_SECONDS = 30 * 60;
const BOOSTED_USERS_SET_KEY = "boosted_users";

// ── Cache key builders ───────────────────────────────────────

const getProfileCacheKey = (userId: string) => `profile:${userId}`;

const buildRecommendationsCacheKey = (
  userId: string,
  query: Record<string, unknown>
) => {
  const queryEntries = Object.entries(query)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return [key, value.join(",")] as const;
      }
      return [key, String(value ?? "")] as const;
    })
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`);

  return `recommendations:${userId}:${queryEntries.join("&")}`;
};

const invalidateUserProfileCache = async (userId: string) => {
  const profileKey = getProfileCacheKey(userId);
  await deleteCache(profileKey);
  
  // Also invalidate all recommendation caches for this user
  await deleteCacheByPattern(`recommendations:${userId}:*`);
  
  console.log(`[cache invalidated] Profile and Recommendations for ${userId}`);
};

/**
 * User Service
 *
 * Core domain service for user management and matchmaking discovery.
 * 
 * Architecture Notes:
 * - Implements aggressive Redis caching for profiles and recommendations
 *   to reduce MongoDB read load.
 * - Uses MongoDB Aggregation Pipeline for the recommendation engine
 *   to calculate complex scoring (shared interests, active boosts)
 *   directly inside the database.
 */
export class UserService {
  /**
   * Get the current user's profile, with Redis caching.
   * 
   * Performance:
   * - Hits Redis first. If miss, queries DB, caches result, and returns.
   * 
   * @throws AppError 404 if the user does not exist.
   */
  async getProfile(userId: string) {
    const cacheKey = getProfileCacheKey(userId);
    const cached = await getCache<{ success: boolean; user: unknown }>(
      cacheKey
    );
    if (cached) {
      console.log(`[cache hit] ${cacheKey}`);
      return cached;
    }
    console.log(`[cache miss] ${cacheKey}`);

    const user = await User.findById(userId).select(
      "-password -__v -likedUsers -dislikedUsers -matches"
    );

    if (!user) {
      throw AppError.notFound("User not found");
    }

    const responsePayload = { success: true, user };
    await setCache(cacheKey, responsePayload, PROFILE_CACHE_TTL_SECONDS);

    return responsePayload;
  }

  /**
   * Update the current user's profile.
   * 
   * Cache Strategy:
   * - Invalidates profile cache immediately on update to prevent stale reads.
   * 
   * @throws AppError 404 if the user does not exist.
   */
  async updateProfile(userId: string, data: Record<string, unknown>) {
    const updatedUser = await User.findByIdAndUpdate(userId, data, {
      new: true,
    }).select("-password");

    if (!updatedUser) {
      throw AppError.notFound("User not found");
    }

    await invalidateUserProfileCache(userId);

    return sanitizeUser(updatedUser);
  }

  /**
   * Upload a photo to Cloudinary and append it to the user's photos array.
   * 
   * Architecture Notes:
   * - Reads directly from the Multer memory buffer to avoid local file I/O.
   * 
   * @throws AppError 404 if the user does not exist.
   */
  async uploadPhoto(userId: string, file: Express.Multer.File) {
    const base64 = `data:${file.mimetype};base64,${file.buffer.toString(
      "base64"
    )}`;

    const uploaded = await cloudinary.uploader.upload(base64, {
      folder: "heartsync",
    });

    const user = await User.findById(userId);

    if (!user) {
      throw AppError.notFound("User not found");
    }

    user.photos.push(uploaded.secure_url);
    await user.save();
    await invalidateUserProfileCache(userId);

    return user.photos;
  }

  /**
   * Basic discover feed — returns users not yet liked/disliked.
   * (Used as a fallback or lightweight alternative to full recommendations).
   * 
   * @throws AppError 404 if the current user does not exist.
   */
  async discoverUsers(userId: string) {
    const currentUser = await User.findById(userId);

    if (!currentUser) {
      throw AppError.notFound("User not found");
    }

    const swipes = await Swipe.find({ swiperId: userId }).select("targetId");
    const swipedIds = swipes.map(s => s.targetId);

    const users = await User.find({
      _id: {
        $ne: userId,
        $nin: swipedIds,
      },
    })
      .select("-password")
      .limit(20);

    return users;
  }

  /**
   * Ranked recommendation engine.
   * 
   * Pipeline Strategy:
   * 1. Filter: Remove self, already-liked, already-disliked, and matches.
   *    Apply gender preferences and age constraints.
   * 2. Score: Calculate `sharedInterestsCount` via $setIntersection.
   * 3. Boost: Inject `boostScore` if user is currently boosted in Redis.
   * 4. Sort: Prioritize Boosted > High Shared Interests > Newest Accounts.
   * 5. Paginate: Apply skip/limit.
   * 
   * Caching: Results are cached based on exact query params.
   */
  async getRecommendations(
    userId: string,
    filters: {
      page?: number;
      limit?: number;
      minAge?: number;
      maxAge?: number;
    },
    rawQuery: Record<string, unknown>
  ) {
    const page =
      filters.page && filters.page > 0 ? filters.page : DEFAULT_PAGE;
    const limit =
      filters.limit && filters.limit > 0
        ? Math.min(filters.limit, MAX_LIMIT)
        : DEFAULT_LIMIT;
    const { minAge, maxAge } = filters;

    if (minAge !== undefined && minAge < 18) {
      throw AppError.badRequest("minAge must be at least 18");
    }

    if (minAge !== undefined && maxAge !== undefined && minAge > maxAge) {
      throw AppError.badRequest("minAge cannot be greater than maxAge");
    }

    const currentUser = await User.findById(userId).select(
      "_id gender interestedIn interests"
    );

    if (!currentUser) {
      throw AppError.notFound("User not found");
    }

    const swipes = await Swipe.find({ swiperId: userId }).select("targetId");
    const swipedIds = swipes.map(s => s.targetId);

    const excludedUserIds = [
      new mongoose.Types.ObjectId(userId),
      ...swipedIds,
    ];

    const matchFilters: Record<string, any> = {
      _id: { $nin: excludedUserIds },
    };

    // ── Recommendation Logic (Reciprocal Matching) ────────────────
    // 1. Filter by target gender if user has a preference
    if (currentUser.interestedIn) {
      matchFilters.gender = currentUser.interestedIn;
    } else if (currentUser.gender) {
      // Defensive: If user hasn't set preference, show opposite gender by default
      matchFilters.gender = currentUser.gender === 'male' ? 'female' : 'male';
    }

    // 2. Only show people who are interested in the current user's gender,
    // OR people who haven't specified a preference yet (broad discovery).
    // This makes the system resilient to incomplete profiles.
    if (currentUser.gender) {
      matchFilters.interestedIn = { $in: [currentUser.gender, null, undefined] };
    }

    // 3. Apply age constraints if provided
    if (minAge !== undefined || maxAge !== undefined) {
      matchFilters.age = {
        ...(minAge !== undefined ? { $gte: minAge } : {}),
        ...(maxAge !== undefined ? { $lte: maxAge } : {}),
      };
    }

    const userInterests = currentUser.interests || [];
    const skip = (page - 1) * limit;
    const cacheKey = buildRecommendationsCacheKey(userId, rawQuery);

    const cached = await getCache<{
      success: boolean;
      page: number;
      limit: number;
      results: number;
      users: unknown[];
    }>(cacheKey);
    
    if (cached) {
      return cached;
    }

    // ── Boost scoring via Redis ────────────────────────────────
    let boostedUserIds: mongoose.Types.ObjectId[] = [];
    if (isRedisConnected()) {
      try {
        const redis = getRedisClient();
        const boostedIds = await redis.sMembers(BOOSTED_USERS_SET_KEY);
        const activeBoostedIds: string[] = [];

        for (const id of boostedIds) {
          const hasBoost = await redis.exists(`boost:${id}`);
          if (hasBoost) {
            activeBoostedIds.push(id);
          } else {
            await redis.sRem(BOOSTED_USERS_SET_KEY, id);
          }
        }

        boostedUserIds = activeBoostedIds
          .filter((id) => mongoose.isValidObjectId(id))
          .map((id) => new mongoose.Types.ObjectId(id));
      } catch {
        // Continue without boost ranking if Redis is unavailable.
      }
    }

    const recommendations = await User.aggregate([
      { $match: matchFilters },
      {
        $addFields: {
          sharedInterestsCount: {
            $size: {
              $setIntersection: [
                { $ifNull: ["$interests", []] },
                userInterests
              ],
            },
          },
          boostScore: {
            $cond: [{ $in: ["$_id", boostedUserIds] }, 1, 0],
          },
        },
      },
      {
        $sort: {
          boostScore: -1,
          sharedInterestsCount: -1,
          createdAt: -1,
        },
      },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          password: 0,
          __v: 0,
          boostScore: 0,
        },
      },
    ]);

    const usersWithCompatibility = recommendations.map(rec => {
      const baseScore = 65;
      const interestScore = Math.min((rec.sharedInterestsCount || 0) * 10, 30);
      const compatibilityScore = baseScore + interestScore + Math.floor(Math.random() * 5);
      
      let matchReason = "You have similar overall preferences.";
      if (rec.sharedInterestsCount > 0 && rec.interests) {
        const shared = rec.interests.find((i: string) => userInterests.includes(i));
        if (shared) {
          matchReason = `You both enjoy ${shared.toLowerCase()}.`;
        }
      }

      return {
        ...rec,
        compatibilityScore,
        matchReason
      };
    });

    const responsePayload = {
      success: true,
      page,
      limit,
      results: recommendations.length,
      users: usersWithCompatibility,
    };

    await setCache(
      cacheKey,
      responsePayload,
      RECOMMENDATIONS_CACHE_TTL_SECONDS
    );

    return responsePayload;
  }

  /**
   * Activate a 30-minute profile boost for premium users.
   * 
   * Storage Strategy:
   * - Stores boost state entirely in Redis using TTL (`EX` flag).
   * - This acts as an automatic, self-clearing queue for the
   *   recommendation engine's `$addFields` step.
   * 
   * @throws AppError 403 if user is not premium.
   */
  async boostProfile(userId: string) {
    const user = await User.findById(userId).select(
      "isPremium premiumExpiresAt"
    );
    if (!user) {
      throw AppError.notFound("User not found");
    }

    const premiumActive =
      user.isPremium &&
      (!user.premiumExpiresAt ||
        new Date(user.premiumExpiresAt) > new Date());
    if (!premiumActive) {
      throw AppError.forbidden(
        "Profile boost is available for premium users only"
      );
    }

    if (isRedisConnected()) {
      const redis = getRedisClient();
      await redis.set(`boost:${userId}`, "1", {
        EX: BOOST_TTL_SECONDS,
      });
      await redis.sAdd(BOOSTED_USERS_SET_KEY, userId);
    }

    // Bust recommendation caches globally so the boost takes effect immediately
    await deleteCacheByPattern("recommendations:*");

    return { boostExpiresInSeconds: BOOST_TTL_SECONDS };
  }
}

export const userService = new UserService();
