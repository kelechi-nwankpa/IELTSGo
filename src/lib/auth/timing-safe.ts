import crypto from 'crypto';

/**
 * Timing-safe string comparison
 * Prevents timing attacks by ensuring comparison takes constant time
 */
export function timingSafeEqual(a: string, b: string): boolean {
  // Ensure both strings are the same length by hashing
  // This prevents length-based timing attacks
  const hashA = crypto.createHash('sha256').update(a).digest();
  const hashB = crypto.createHash('sha256').update(b).digest();

  return crypto.timingSafeEqual(hashA, hashB);
}

/**
 * Timing-safe password verification using bcrypt
 * bcrypt.compare is already timing-safe, but we add a constant-time wrapper
 * to ensure consistent response times even when user doesn't exist
 */
export async function timingSafePasswordVerify(
  password: string,
  hash: string | null | undefined,
  // Dummy hash to use when user doesn't exist (prevents user enumeration)
  dummyHash: string = '$2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
): Promise<boolean> {
  const bcrypt = await import('bcryptjs');

  // Always perform hash comparison, even if hash is null
  // This prevents timing-based user enumeration
  const hashToCompare = hash || dummyHash;

  const result = await bcrypt.compare(password, hashToCompare);

  // If we used dummy hash, always return false
  return hash ? result : false;
}

/**
 * Generate a dummy bcrypt hash for timing-safe comparisons
 * This hash can be used when a user doesn't exist to maintain constant time
 */
export async function generateDummyHash(): Promise<string> {
  const bcrypt = await import('bcryptjs');
  return bcrypt.hash('dummy-password-for-timing', 10);
}

/**
 * Add artificial timing variance to mask processing time
 * Adds a random delay between min and max milliseconds
 */
export async function addTimingVariance(minMs: number = 50, maxMs: number = 200): Promise<void> {
  const variance = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  await new Promise((resolve) => setTimeout(resolve, variance));
}

/**
 * Constant-time token comparison
 * For comparing API tokens, session tokens, etc.
 */
export function timingSafeTokenCompare(token: string, expectedToken: string): boolean {
  if (!token || !expectedToken) {
    return false;
  }

  return timingSafeEqual(token, expectedToken);
}
