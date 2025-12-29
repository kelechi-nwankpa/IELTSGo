import { getRedis } from '@/lib/rate-limit';
import crypto from 'crypto';
import type { JWT } from 'next-auth/jwt';

/**
 * JWT hardening configuration
 */
export const JWT_CONFIG = {
  // Access token lifetime (15 minutes)
  accessTokenMaxAge: 15 * 60,
  // Refresh token lifetime (7 days)
  refreshTokenMaxAge: 7 * 24 * 60 * 60,
  // Session maximum age (30 days)
  sessionMaxAge: 30 * 24 * 60 * 60,
  // Token revocation list TTL (30 days)
  revocationListTTL: 30 * 24 * 60 * 60,
  // Redis key prefixes
  prefixes: {
    revoked: 'jwt:revoked:',
    refresh: 'jwt:refresh:',
    session: 'jwt:session:',
  },
};

/**
 * Generate a unique token identifier (jti)
 */
export function generateTokenId(): string {
  return crypto.randomUUID();
}

/**
 * Generate a secure random token
 */
export function generateSecureToken(bytes: number = 32): string {
  return crypto.randomBytes(bytes).toString('base64url');
}

/**
 * Check if a token has been revoked
 */
export async function isTokenRevoked(jti: string): Promise<boolean> {
  const redis = getRedis();
  if (!redis) return false;

  const key = `${JWT_CONFIG.prefixes.revoked}${jti}`;
  const revoked = await redis.exists(key);
  return revoked === 1;
}

/**
 * Revoke a token by its ID
 */
export async function revokeToken(jti: string, expiresAt?: Date): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  const key = `${JWT_CONFIG.prefixes.revoked}${jti}`;

  // Calculate TTL based on token expiry or use default
  let ttl = JWT_CONFIG.revocationListTTL;
  if (expiresAt) {
    const remainingTime = Math.ceil((expiresAt.getTime() - Date.now()) / 1000);
    if (remainingTime > 0) {
      ttl = Math.min(remainingTime, JWT_CONFIG.revocationListTTL);
    }
  }

  await redis.set(key, '1', { ex: ttl });
}

/**
 * Revoke all tokens for a user (logout from all devices)
 */
export async function revokeAllUserTokens(userId: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  // Store user's "revoked before" timestamp
  const key = `${JWT_CONFIG.prefixes.revoked}user:${userId}`;
  await redis.set(key, Date.now().toString(), { ex: JWT_CONFIG.revocationListTTL });
}

/**
 * Check if a token was issued before user's revocation timestamp
 */
export async function isTokenIssuedBeforeRevocation(
  userId: string,
  issuedAt: number
): Promise<boolean> {
  const redis = getRedis();
  if (!redis) return false;

  const key = `${JWT_CONFIG.prefixes.revoked}user:${userId}`;
  const revokedBefore = await redis.get<string>(key);

  if (!revokedBefore) return false;

  // Token is invalid if issued before revocation timestamp
  return issuedAt * 1000 < parseInt(revokedBefore, 10);
}

/**
 * Store refresh token metadata
 */
export async function storeRefreshToken(
  userId: string,
  tokenId: string,
  metadata: {
    userAgent?: string;
    ip?: string;
    deviceId?: string;
  }
): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  const key = `${JWT_CONFIG.prefixes.refresh}${userId}:${tokenId}`;
  await redis.set(
    key,
    JSON.stringify({
      createdAt: Date.now(),
      ...metadata,
    }),
    { ex: JWT_CONFIG.refreshTokenMaxAge }
  );
}

/**
 * Validate and rotate refresh token
 * Returns new token ID if valid, null if invalid
 */
export async function rotateRefreshToken(
  userId: string,
  oldTokenId: string
): Promise<string | null> {
  const redis = getRedis();
  if (!redis) return generateTokenId(); // Fallback without Redis

  const key = `${JWT_CONFIG.prefixes.refresh}${userId}:${oldTokenId}`;
  const tokenData = await redis.get<string>(key);

  if (!tokenData) {
    // Token doesn't exist or was already rotated
    // This could indicate token theft, so revoke all user tokens
    await revokeAllUserTokens(userId);
    return null;
  }

  // Delete old token
  await redis.del(key);

  // Generate new token
  const newTokenId = generateTokenId();

  // Store new token with same metadata
  try {
    const metadata = JSON.parse(tokenData);
    await storeRefreshToken(userId, newTokenId, metadata);
  } catch {
    await storeRefreshToken(userId, newTokenId, {});
  }

  return newTokenId;
}

/**
 * Get active sessions for a user
 */
export async function getUserActiveSessions(
  _userId: string
): Promise<Array<{ tokenId: string; createdAt: number; userAgent?: string; ip?: string }>> {
  const redis = getRedis();
  if (!redis) return [];

  // This is a simplified version - in production you might use Redis SCAN
  // For now, we return empty as we can't easily iterate without the keys pattern
  // The _userId parameter will be used when implementing SCAN-based lookup
  return [];
}

/**
 * Generate secure cookie options
 */
export function getSecureCookieOptions(
  isProduction: boolean = process.env.NODE_ENV === 'production'
) {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: JWT_CONFIG.sessionMaxAge,
  };
}

/**
 * NextAuth JWT callback configuration for hardened tokens
 */
export const jwtCallbackConfig = {
  maxAge: JWT_CONFIG.accessTokenMaxAge,

  async encode({ token, secret }: { token: JWT | null | undefined; secret: string }) {
    // Use NextAuth's default encoding
    const { encode } = await import('next-auth/jwt');
    return encode({ token: token ?? undefined, secret });
  },

  async decode({ token, secret }: { token: string; secret: string }) {
    const { decode } = await import('next-auth/jwt');
    const decoded = await decode({ token, secret });

    if (!decoded) return null;

    // Check if token was revoked
    if (decoded.jti && (await isTokenRevoked(decoded.jti as string))) {
      return null;
    }

    // Check if issued before user's global revocation
    if (
      decoded.sub &&
      decoded.iat &&
      (await isTokenIssuedBeforeRevocation(decoded.sub as string, decoded.iat as number))
    ) {
      return null;
    }

    return decoded;
  },
};
