import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import {
  checkRateLimit,
  getRateLimitTier,
  shouldSkipRateLimit,
  getRateLimitIdentifier,
  detectSuspiciousRequest,
} from '@/lib/rate-limit';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip rate limiting for static assets and health checks
  if (shouldSkipRateLimit(pathname)) {
    return NextResponse.next();
  }

  // Only apply rate limiting to API routes
  if (!pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Detect suspicious requests
  const suspiciousCheck = detectSuspiciousRequest(request);
  if (suspiciousCheck.suspicious) {
    console.warn(`[RateLimit] Suspicious request blocked: ${suspiciousCheck.reason}`, {
      path: pathname,
    });
    return new NextResponse(
      JSON.stringify({
        error: 'Request blocked',
        code: 'SUSPICIOUS_REQUEST',
      }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Get user ID from session token if authenticated
  let userId: string | undefined;
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
    userId = token?.sub;
  } catch {
    // Token extraction failed - continue without user ID
  }

  // Get rate limit tier and identifier
  const tier = getRateLimitTier(pathname);
  const identifier = getRateLimitIdentifier(request, userId);

  // Check rate limit
  const result = await checkRateLimit(tier, identifier);

  // Add rate limit headers to response
  const response = result.success ? NextResponse.next() : createRateLimitResponse(result);

  // Always set rate limit headers for transparency
  response.headers.set('X-RateLimit-Limit', result.limit.toString());
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
  response.headers.set('X-RateLimit-Reset', result.reset.toString());

  if (!result.success && result.retryAfter) {
    response.headers.set('Retry-After', result.retryAfter.toString());
  }

  return response;
}

/**
 * Create a rate limit exceeded response
 */
function createRateLimitResponse(result: {
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}): NextResponse {
  return new NextResponse(
    JSON.stringify({
      error: 'Too many requests. Please try again later.',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: result.retryAfter,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all API routes
     * Exclude:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/api/:path*',
  ],
};
