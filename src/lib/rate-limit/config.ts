/**
 * Rate limiting configuration for different API routes
 */

export type RateLimitTier = 'auth' | 'ai' | 'general' | 'strict';

export interface RateLimitConfig {
  requests: number;
  window: string; // e.g., '1 m', '1 h', '1 d'
  prefix: string;
}

/**
 * Rate limit configurations by tier
 * - auth: Authentication endpoints (login, signup, password reset)
 * - ai: AI evaluation endpoints (writing, speaking evaluation)
 * - general: Standard API endpoints
 * - strict: Sensitive operations (password change, account deletion)
 */
export const RATE_LIMIT_TIERS: Record<RateLimitTier, RateLimitConfig> = {
  auth: {
    requests: 5,
    window: '1 m',
    prefix: 'rl:auth',
  },
  ai: {
    requests: 10,
    window: '1 m',
    prefix: 'rl:ai',
  },
  general: {
    requests: 60,
    window: '1 m',
    prefix: 'rl:general',
  },
  strict: {
    requests: 3,
    window: '1 m',
    prefix: 'rl:strict',
  },
};

/**
 * Route patterns and their corresponding rate limit tiers
 */
export const ROUTE_RATE_LIMITS: Array<{ pattern: RegExp; tier: RateLimitTier }> = [
  // Auth endpoints - strict rate limiting
  { pattern: /^\/api\/auth\/signin/, tier: 'auth' },
  { pattern: /^\/api\/auth\/signup/, tier: 'auth' },
  { pattern: /^\/api\/auth\/callback/, tier: 'auth' },
  { pattern: /^\/api\/auth\/forgot-password/, tier: 'auth' },
  { pattern: /^\/api\/auth\/reset-password/, tier: 'auth' },

  // AI evaluation endpoints - moderate rate limiting
  { pattern: /^\/api\/writing\/evaluate/, tier: 'ai' },
  { pattern: /^\/api\/speaking\/evaluate/, tier: 'ai' },
  { pattern: /^\/api\/speaking\/re-evaluate/, tier: 'ai' },
  { pattern: /^\/api\/study-plan\/generate/, tier: 'ai' },
  { pattern: /^\/api\/diagnostic/, tier: 'ai' },

  // Sensitive operations - very strict
  { pattern: /^\/api\/account\/delete/, tier: 'strict' },
  { pattern: /^\/api\/account\/change-password/, tier: 'strict' },
  { pattern: /^\/api\/stripe\/checkout/, tier: 'strict' },
];

/**
 * Get the rate limit tier for a given path
 */
export function getRateLimitTier(pathname: string): RateLimitTier {
  for (const { pattern, tier } of ROUTE_RATE_LIMITS) {
    if (pattern.test(pathname)) {
      return tier;
    }
  }
  // Default to general rate limiting
  return 'general';
}

/**
 * Paths that should skip rate limiting entirely
 */
export const RATE_LIMIT_SKIP_PATHS = [
  /^\/api\/health/,
  /^\/_next/,
  /^\/static/,
  /^\/favicon\.ico/,
  /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/,
];

/**
 * Check if a path should skip rate limiting
 */
export function shouldSkipRateLimit(pathname: string): boolean {
  return RATE_LIMIT_SKIP_PATHS.some((pattern) => pattern.test(pathname));
}
