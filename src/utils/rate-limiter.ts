import { LRUCache } from 'lru-cache';
import { NextApiResponse } from 'next';

type RateLimitOptions = {
  uniqueTokenPerInterval?: number;
  interval?: number;
};

// Simple in-memory rate limiter using LRU cache
export const rateLimit = (options?: RateLimitOptions) => {
  const tokenCache = new LRUCache<string, number>({
    max: options?.uniqueTokenPerInterval || 500, // Max users per interval
    ttl: options?.interval || 60000, // Cache TTL in milliseconds (default 1 minute)
  });

  return {
    check: (res: NextApiResponse, limit: number, token: string): Promise<void> =>
      new Promise((resolve, reject) => {
        const tokenCount = tokenCache.get(token) || 0;
        const currentUsage = tokenCount + 1;
        tokenCache.set(token, currentUsage);

        const isRateLimited = currentUsage > limit;
        res.setHeader('X-RateLimit-Limit', limit);
        res.setHeader('X-RateLimit-Remaining', isRateLimited ? 0 : limit - currentUsage);

        if (isRateLimited) {
          res.status(429).json({ error: 'Rate limit exceeded' });
          return reject();
        }

        return resolve();
      }),
  };
};
