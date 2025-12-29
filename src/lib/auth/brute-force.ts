import { getRedis } from '@/lib/rate-limit';

/**
 * Brute force protection configuration
 */
const BRUTE_FORCE_CONFIG = {
  // Maximum failed attempts before lockout
  maxAttempts: 10,
  // Lockout duration in seconds (15 minutes)
  lockoutDuration: 15 * 60,
  // Progressive delay base (doubles each attempt)
  baseDelayMs: 1000,
  // Maximum delay between attempts (16 seconds)
  maxDelayMs: 16000,
  // Key prefixes
  prefixes: {
    attempts: 'bf:attempts:',
    lockout: 'bf:lockout:',
    lastAttempt: 'bf:last:',
  },
};

export interface BruteForceStatus {
  locked: boolean;
  attemptsRemaining: number;
  lockoutEndsAt?: Date;
  delayMs: number;
}

/**
 * Generate a key for brute force tracking
 * Uses both email and IP to prevent account enumeration
 */
function getKey(type: 'attempts' | 'lockout' | 'lastAttempt', identifier: string): string {
  return `${BRUTE_FORCE_CONFIG.prefixes[type]}${identifier}`;
}

/**
 * Check if an account is locked out
 */
export async function checkBruteForce(email: string, ip: string): Promise<BruteForceStatus> {
  const redis = getRedis();

  // Default response if Redis is not available
  if (!redis) {
    return {
      locked: false,
      attemptsRemaining: BRUTE_FORCE_CONFIG.maxAttempts,
      delayMs: 0,
    };
  }

  // Use email as primary identifier (case-insensitive)
  const emailKey = email.toLowerCase().trim();
  const identifier = `${emailKey}:${ip}`;

  // Check if account is locked
  const lockoutKey = getKey('lockout', identifier);
  const lockoutTTL = await redis.ttl(lockoutKey);

  if (lockoutTTL > 0) {
    return {
      locked: true,
      attemptsRemaining: 0,
      lockoutEndsAt: new Date(Date.now() + lockoutTTL * 1000),
      delayMs: 0,
    };
  }

  // Get current attempt count
  const attemptsKey = getKey('attempts', identifier);
  const attempts = parseInt((await redis.get<string>(attemptsKey)) || '0', 10);

  // Calculate progressive delay
  const delayMs = Math.min(
    BRUTE_FORCE_CONFIG.baseDelayMs * Math.pow(2, attempts),
    BRUTE_FORCE_CONFIG.maxDelayMs
  );

  return {
    locked: false,
    attemptsRemaining: BRUTE_FORCE_CONFIG.maxAttempts - attempts,
    delayMs: attempts > 0 ? delayMs : 0,
  };
}

/**
 * Record a failed login attempt
 */
export async function recordFailedAttempt(email: string, ip: string): Promise<BruteForceStatus> {
  const redis = getRedis();

  if (!redis) {
    return {
      locked: false,
      attemptsRemaining: BRUTE_FORCE_CONFIG.maxAttempts,
      delayMs: 0,
    };
  }

  const emailKey = email.toLowerCase().trim();
  const identifier = `${emailKey}:${ip}`;
  const attemptsKey = getKey('attempts', identifier);
  const lockoutKey = getKey('lockout', identifier);

  // Increment attempt count
  const attempts = await redis.incr(attemptsKey);

  // Set expiry on attempts key (reset after 1 hour of no attempts)
  await redis.expire(attemptsKey, 3600);

  // Check if we should lock out
  if (attempts >= BRUTE_FORCE_CONFIG.maxAttempts) {
    // Set lockout
    await redis.set(lockoutKey, '1', {
      ex: BRUTE_FORCE_CONFIG.lockoutDuration,
    });

    // Reset attempt counter
    await redis.del(attemptsKey);

    return {
      locked: true,
      attemptsRemaining: 0,
      lockoutEndsAt: new Date(Date.now() + BRUTE_FORCE_CONFIG.lockoutDuration * 1000),
      delayMs: 0,
    };
  }

  // Calculate progressive delay
  const delayMs = Math.min(
    BRUTE_FORCE_CONFIG.baseDelayMs * Math.pow(2, attempts),
    BRUTE_FORCE_CONFIG.maxDelayMs
  );

  return {
    locked: false,
    attemptsRemaining: BRUTE_FORCE_CONFIG.maxAttempts - attempts,
    delayMs,
  };
}

/**
 * Clear brute force tracking on successful login
 */
export async function clearBruteForce(email: string, ip: string): Promise<void> {
  const redis = getRedis();

  if (!redis) return;

  const emailKey = email.toLowerCase().trim();
  const identifier = `${emailKey}:${ip}`;

  await Promise.all([
    redis.del(getKey('attempts', identifier)),
    redis.del(getKey('lockout', identifier)),
    redis.del(getKey('lastAttempt', identifier)),
  ]);
}

/**
 * Apply progressive delay before authentication
 * Returns the delay that was applied in milliseconds
 */
export async function applyBruteForceDelay(status: BruteForceStatus): Promise<number> {
  if (status.delayMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, status.delayMs));
  }
  return status.delayMs;
}

/**
 * Get brute force error message based on status
 */
export function getBruteForceErrorMessage(status: BruteForceStatus): string {
  if (status.locked) {
    const minutes = status.lockoutEndsAt
      ? Math.ceil((status.lockoutEndsAt.getTime() - Date.now()) / 60000)
      : BRUTE_FORCE_CONFIG.lockoutDuration / 60;
    return `Account temporarily locked. Please try again in ${minutes} minutes.`;
  }

  if (status.attemptsRemaining <= 3) {
    return `Invalid credentials. ${status.attemptsRemaining} attempts remaining before lockout.`;
  }

  return 'Invalid credentials.';
}
