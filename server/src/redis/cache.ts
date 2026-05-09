/**
 * Redis Cache Utilities
 *
 * Provides high-level wrapper functions for Redis commands
 * (`get`, `set`, `del`, `keys`).
 *
 * Architecture Notes:
 * - All methods silently catch errors and return null/0 if Redis
 *   is disconnected or throws an error. This enforces the graceful
 *   degradation strategy: cache misses fallback to the DB, and
 *   cache write failures do not interrupt the user request lifecycle.
 * - Values are automatically serialized/deserialized via JSON.
 *
 * Cache Strategy:
 * - Key Naming Convention: `entity:userId:identifier` (e.g., `recommendations:123:page=1`)
 * - Cache Invalidation: Uses `deleteCacheByPattern` to clear wildcard keys when
 *   underlying data changes (e.g., when a user swipes, their recommendation cache is wiped).
 */
import { getRedisClient, isRedisConnected } from "./redis";

/**
 * Retrieve and parse a JSON value from the cache.
 * Returns null on cache miss or Redis failure.
 */
export const getCache = async <T>(key: string): Promise<T | null> => {
  try {
    if (!isRedisConnected()) {
      return null;
    }

    const value = await getRedisClient().get(key);
    if (!value) {
      return null;
    }

    return JSON.parse(value) as T;
  } catch (error) {
    return null;
  }
};

/**
 * Serialize and store a value in the cache with an expiration TTL.
 * Fails silently on Redis errors.
 */
export const setCache = async (
  key: string,
  value: unknown,
  ttlSeconds: number
) => {
  try {
    if (!isRedisConnected()) {
      return;
    }

    await getRedisClient().set(key, JSON.stringify(value), {
      EX: ttlSeconds,
    });
  } catch (error) {
    // Do not fail request on cache write errors.
  }
};

/**
 * Delete a specific key from the cache.
 * Returns the number of keys deleted (0 or 1).
 */
export const deleteCache = async (key: string) => {
  try {
    if (!isRedisConnected()) {
      return 0;
    }

    return await getRedisClient().del(key);
  } catch (error) {
    return 0;
  }
};

/**
 * Delete all keys matching a pattern.
 * Critical for invalidating paginated lists (e.g. recommendations:*).
 */
export const deleteCacheByPattern = async (pattern: string) => {
  try {
    if (!isRedisConnected()) {
      return 0;
    }

    const keys = await getRedisClient().keys(pattern);
    if (!keys.length) {
      return 0;
    }

    return await getRedisClient().del(keys);
  } catch (error) {
    return 0;
  }
};
