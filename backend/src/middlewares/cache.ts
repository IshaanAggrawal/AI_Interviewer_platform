import { Request, Response, NextFunction } from "express";
import Redis from "ioredis";
import config from "../config";
import { getAuth } from "@clerk/express";

// Create a shared Redis client for caching
export const redisCache = new Redis(config.redisUrl, {
  maxRetriesPerRequest: null,
});

redisCache.on("error", (err) => {
  console.error("Redis Cache Connection Error:", err.message);
});

/**
 * Middleware to cache GET requests per user.
 * Duration is in seconds.
 */
export const cacheMiddleware = (durationInSeconds: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== "GET") return next();

    const { userId } = getAuth(req);
    if (!userId) return next();

    // Create a unique cache key based on the user and the exact URL requested
    const key = `cache:${userId}:${req.originalUrl}`;

    try {
      const cachedResponse = await redisCache.get(key);
      if (cachedResponse) {
        return res.json(JSON.parse(cachedResponse));
      } else {
        // Intercept res.json to cache the response before sending it
        const originalJson = res.json.bind(res);
        res.json = (body: any) => {
          // Fire and forget caching
          redisCache.setex(key, durationInSeconds, JSON.stringify(body)).catch(err => {
            console.error("Redis SetEx Error:", err);
          });
          return originalJson(body);
        };
        next();
      }
    } catch (error) {
      console.error("Redis Cache Middleware Error:", error);
      next(); // If Redis fails, silently fallback to normal database query
    }
  };
};

/**
 * Helper to invalidate all cache entries for a specific user.
 * Call this when a user's data changes (e.g., after completing an interview).
 */
export const invalidateUserCache = async (userId: string) => {
  try {
    const keys = await redisCache.keys(`cache:${userId}:*`);
    if (keys.length > 0) {
      await redisCache.del(...keys);
    }
  } catch (error) {
    console.error("Redis Cache Invalidation Error:", error);
  }
};
