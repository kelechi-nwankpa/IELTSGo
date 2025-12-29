import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';
import { RATE_LIMIT_TIERS, RateLimitTier } from './config';

/**
 * Create Redis client for rate limiting
 * Falls back to a no-op implementation if credentials are not configured
 */
function createRedisClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn(
      '[RateLimit] Upstash Redis credentials not configured. Rate limiting is disabled.'
    );
    return null;
  }

  return new Redis({
    url,
    token,
  });
}

// Singleton Redis client
let redisClient: Redis | null | undefined;

function getRedisClient(): Redis | null {
  if (redisClient === undefined) {
    redisClient = createRedisClient();
  }
  return redisClient;
}

/**
 * Export Redis client for use in other modules (e.g., distributed locking)
 */
export function getRedis(): Redis | null {
  return getRedisClient();
}

// Cache for rate limiters by tier
const rateLimiters = new Map<RateLimitTier, Ratelimit>();

/**
 * Get or create a rate limiter for a specific tier
 */
export function getRateLimiter(tier: RateLimitTier): Ratelimit | null {
  const redis = getRedisClient();
  if (!redis) return null;

  if (rateLimiters.has(tier)) {
    return rateLimiters.get(tier)!;
  }

  const config = RATE_LIMIT_TIERS[tier];

  // Parse window string (e.g., '1 m', '1 h', '1 d')
  const [amount, unit] = config.window.split(' ');
  const windowMs = parseWindowToMs(parseInt(amount), unit);

  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(config.requests, `${windowMs} ms`),
    prefix: config.prefix,
    analytics: true,
  });

  rateLimiters.set(tier, limiter);
  return limiter;
}

/**
 * Parse window string to milliseconds
 */
function parseWindowToMs(amount: number, unit: string): number {
  switch (unit) {
    case 's':
      return amount * 1000;
    case 'm':
      return amount * 60 * 1000;
    case 'h':
      return amount * 60 * 60 * 1000;
    case 'd':
      return amount * 24 * 60 * 60 * 1000;
    default:
      return amount * 60 * 1000; // Default to minutes
  }
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

/**
 * Check rate limit for a given identifier
 */
export async function checkRateLimit(
  tier: RateLimitTier,
  identifier: string
): Promise<RateLimitResult> {
  const limiter = getRateLimiter(tier);

  if (!limiter) {
    // Rate limiting disabled - allow all requests
    return {
      success: true,
      limit: RATE_LIMIT_TIERS[tier].requests,
      remaining: RATE_LIMIT_TIERS[tier].requests,
      reset: Date.now() + 60000,
    };
  }

  const result = await limiter.limit(identifier);

  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
    retryAfter: result.success ? undefined : Math.ceil((result.reset - Date.now()) / 1000),
  };
}
