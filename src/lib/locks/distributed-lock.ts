import { getRedis } from '@/lib/rate-limit';
import crypto from 'crypto';

/**
 * Distributed Locking for Critical Operations
 *
 * Implements Redis-based distributed locks to prevent race conditions
 * in critical operations like:
 * - Subscription state changes
 * - Mock test submissions
 * - Study plan generation
 * - Concurrent evaluation requests
 */

/**
 * Lock configuration
 */
export interface LockConfig {
  /** Lock key prefix */
  prefix?: string;
  /** Lock TTL in milliseconds (default: 30 seconds) */
  ttlMs?: number;
  /** Retry attempts if lock is held (default: 3) */
  retryAttempts?: number;
  /** Delay between retries in milliseconds (default: 100ms) */
  retryDelayMs?: number;
  /** Whether to extend lock automatically (default: false) */
  autoExtend?: boolean;
}

const DEFAULT_CONFIG: Required<LockConfig> = {
  prefix: 'lock:',
  ttlMs: 30_000,
  retryAttempts: 3,
  retryDelayMs: 100,
  autoExtend: false,
};

/**
 * Lock handle returned when a lock is acquired
 */
export interface LockHandle {
  key: string;
  token: string;
  expiresAt: number;
  release: () => Promise<boolean>;
  extend: (additionalMs: number) => Promise<boolean>;
}

/**
 * Generate a unique lock token
 */
function generateLockToken(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Acquire a distributed lock
 */
export async function acquireLock(
  resourceId: string,
  config: LockConfig = {}
): Promise<LockHandle | null> {
  const redis = getRedis();

  // If Redis is not available, return a fake lock (single-instance mode)
  if (!redis) {
    console.warn('[Lock] Redis not available, using no-op lock');
    return createNoOpLock(resourceId);
  }

  const { prefix, ttlMs, retryAttempts, retryDelayMs } = {
    ...DEFAULT_CONFIG,
    ...config,
  };

  const key = `${prefix}${resourceId}`;
  const token = generateLockToken();

  for (let attempt = 0; attempt <= retryAttempts; attempt++) {
    // Try to acquire lock using SET NX EX
    const result = await redis.set(key, token, {
      nx: true, // Only set if not exists
      px: ttlMs, // TTL in milliseconds
    });

    if (result === 'OK') {
      // Lock acquired successfully
      const expiresAt = Date.now() + ttlMs;

      return {
        key,
        token,
        expiresAt,
        release: () => releaseLock(key, token),
        extend: (additionalMs: number) => extendLock(key, token, additionalMs),
      };
    }

    // Lock is held by someone else
    if (attempt < retryAttempts) {
      await sleep(retryDelayMs * (attempt + 1)); // Exponential backoff
    }
  }

  // Failed to acquire lock after all retries
  return null;
}

/**
 * Release a distributed lock
 * Uses Lua script to ensure we only release our own lock
 */
async function releaseLock(key: string, token: string): Promise<boolean> {
  const redis = getRedis();
  if (!redis) return true;

  // Lua script for atomic check-and-delete
  // Only delete if the token matches
  const script = `
    if redis.call("get", KEYS[1]) == ARGV[1] then
      return redis.call("del", KEYS[1])
    else
      return 0
    end
  `;

  try {
    const result = await redis.eval(script, [key], [token]);
    return result === 1;
  } catch (error) {
    console.error('[Lock] Failed to release lock:', error);
    return false;
  }
}

/**
 * Extend a lock's TTL
 * Uses Lua script to ensure we only extend our own lock
 */
async function extendLock(key: string, token: string, additionalMs: number): Promise<boolean> {
  const redis = getRedis();
  if (!redis) return true;

  // Lua script for atomic check-and-extend
  const script = `
    if redis.call("get", KEYS[1]) == ARGV[1] then
      return redis.call("pexpire", KEYS[1], ARGV[2])
    else
      return 0
    end
  `;

  try {
    const result = await redis.eval(script, [key], [token, additionalMs.toString()]);
    return result === 1;
  } catch (error) {
    console.error('[Lock] Failed to extend lock:', error);
    return false;
  }
}

/**
 * Create a no-op lock for when Redis is not available
 */
function createNoOpLock(resourceId: string): LockHandle {
  return {
    key: resourceId,
    token: 'no-op',
    expiresAt: Date.now() + 30_000,
    release: async () => true,
    extend: async () => true,
  };
}

/**
 * Sleep helper
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Execute a function with a distributed lock
 * Automatically acquires and releases the lock
 */
export async function withLock<T>(
  resourceId: string,
  fn: (lock: LockHandle) => Promise<T>,
  config: LockConfig = {}
): Promise<T> {
  const lock = await acquireLock(resourceId, config);

  if (!lock) {
    throw new Error(`Failed to acquire lock for resource: ${resourceId}`);
  }

  try {
    return await fn(lock);
  } finally {
    await lock.release();
  }
}

/**
 * Execute a function with a distributed lock, with a fallback if lock cannot be acquired
 */
export async function withLockOrFallback<T>(
  resourceId: string,
  fn: (lock: LockHandle) => Promise<T>,
  fallback: () => Promise<T>,
  config: LockConfig = {}
): Promise<T> {
  const lock = await acquireLock(resourceId, config);

  if (!lock) {
    return fallback();
  }

  try {
    return await fn(lock);
  } finally {
    await lock.release();
  }
}

// ============================================
// Pre-defined Lock Helpers for Common Operations
// ============================================

/**
 * Lock for subscription state changes
 */
export function subscriptionLock(userId: string): Promise<LockHandle | null> {
  return acquireLock(`subscription:${userId}`, {
    ttlMs: 60_000, // 60 seconds for payment processing
    retryAttempts: 5,
  });
}

/**
 * Lock for mock test operations
 */
export function mockTestLock(mockTestId: string): Promise<LockHandle | null> {
  return acquireLock(`mock-test:${mockTestId}`, {
    ttlMs: 30_000, // 30 seconds
    retryAttempts: 3,
  });
}

/**
 * Lock for study plan generation
 */
export function studyPlanLock(userId: string): Promise<LockHandle | null> {
  return acquireLock(`study-plan:${userId}`, {
    ttlMs: 120_000, // 2 minutes for AI generation
    retryAttempts: 0, // Don't retry, just reject duplicate requests
  });
}

/**
 * Lock for evaluation requests (prevent duplicate submissions)
 */
export function evaluationLock(userId: string, module: string): Promise<LockHandle | null> {
  return acquireLock(`evaluation:${userId}:${module}`, {
    ttlMs: 90_000, // 90 seconds for AI evaluation
    retryAttempts: 0, // Don't retry, reject duplicate
  });
}
