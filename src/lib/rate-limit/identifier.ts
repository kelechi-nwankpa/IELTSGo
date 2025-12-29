import { NextRequest } from 'next/server';

/**
 * Trusted proxy headers in order of preference
 * We check multiple headers to handle various proxy configurations
 */
const IP_HEADERS = [
  'cf-connecting-ip', // Cloudflare
  'x-real-ip', // Nginx
  'x-forwarded-for', // Standard proxy header
  'x-client-ip', // Apache
  'true-client-ip', // Akamai
];

/**
 * Private IP ranges that should not be trusted from forwarded headers
 */
const PRIVATE_IP_PATTERNS = [
  /^127\./, // Loopback
  /^10\./, // Class A private
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // Class B private
  /^192\.168\./, // Class C private
  /^::1$/, // IPv6 loopback
  /^fc00:/, // IPv6 private
  /^fe80:/, // IPv6 link-local
];

/**
 * Check if an IP address is private/internal
 */
function isPrivateIP(ip: string): boolean {
  return PRIVATE_IP_PATTERNS.some((pattern) => pattern.test(ip));
}

/**
 * Validate and sanitize an IP address
 */
function sanitizeIP(ip: string | null | undefined): string | null {
  if (!ip) return null;

  // Remove any whitespace
  ip = ip.trim();

  // For X-Forwarded-For, take the first (client) IP
  if (ip.includes(',')) {
    ip = ip.split(',')[0].trim();
  }

  // Remove port if present
  if (ip.includes(':') && !ip.includes('::')) {
    // IPv4 with port
    ip = ip.split(':')[0];
  }

  // Basic validation - must not be empty and must not contain suspicious characters
  if (!ip || ip.length > 45 || /[^\da-fA-F.:]/g.test(ip)) {
    return null;
  }

  return ip;
}

/**
 * Extract the client's IP address from request headers
 * Implements bypass prevention by validating header values
 */
export function getClientIP(request: NextRequest): string {
  // Check trusted proxy headers
  for (const header of IP_HEADERS) {
    const value = request.headers.get(header);
    const ip = sanitizeIP(value);

    if (ip && !isPrivateIP(ip)) {
      return ip;
    }
  }

  // Fallback to socket IP or anonymous identifier
  // In Next.js middleware, we don't have direct socket access
  // Use a hash of available identifiers as fallback
  return 'anonymous';
}

/**
 * Simple hash function for fingerprinting (Edge Runtime compatible)
 * Not cryptographically secure, but sufficient for fingerprinting
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

/**
 * Generate a fingerprint from request characteristics
 * Used as a secondary identifier to prevent bypass
 */
export function getRequestFingerprint(request: NextRequest): string {
  const components = [
    request.headers.get('user-agent') || '',
    request.headers.get('accept-language') || '',
    request.headers.get('accept-encoding') || '',
  ];

  // Use simple hash for Edge Runtime compatibility
  const hash = simpleHash(components.join('|'));

  return hash.substring(0, 16);
}

/**
 * Get the rate limit identifier for a request
 * Combines IP and fingerprint for better bypass prevention
 */
export function getRateLimitIdentifier(request: NextRequest, userId?: string): string {
  // If user is authenticated, use user ID as primary identifier
  // This ensures rate limits are per-user regardless of IP
  if (userId) {
    return `user:${userId}`;
  }

  // For unauthenticated requests, combine IP and fingerprint
  const ip = getClientIP(request);
  const fingerprint = getRequestFingerprint(request);

  // Use IP as primary, fingerprint as secondary
  return `ip:${ip}:fp:${fingerprint}`;
}

/**
 * Detect potentially spoofed or suspicious requests
 */
export function detectSuspiciousRequest(request: NextRequest): {
  suspicious: boolean;
  reason?: string;
} {
  // Check for multiple conflicting IP headers
  const ipHeaders = IP_HEADERS.map((h) => request.headers.get(h)).filter(Boolean);

  if (ipHeaders.length > 3) {
    return { suspicious: true, reason: 'Too many IP headers present' };
  }

  // Check for obviously spoofed headers
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor && forwardedFor.split(',').length > 10) {
    return { suspicious: true, reason: 'Excessive X-Forwarded-For chain' };
  }

  // Check for missing User-Agent (very unusual for legitimate clients)
  if (!request.headers.get('user-agent')) {
    return { suspicious: true, reason: 'Missing User-Agent header' };
  }

  return { suspicious: false };
}
