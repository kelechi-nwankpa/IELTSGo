import { URL } from 'url';
import dns from 'dns';
import { promisify } from 'util';

const dnsLookup = promisify(dns.lookup);

/**
 * Private IP ranges that should be blocked for SSRF protection
 */
const PRIVATE_IP_PATTERNS = [
  // IPv4 private ranges
  /^127\./, // Loopback
  /^10\./, // Class A private
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // Class B private
  /^192\.168\./, // Class C private
  /^169\.254\./, // Link-local (including AWS metadata)
  /^0\./, // Current network

  // IPv6 patterns
  /^::1$/, // Loopback
  /^fe80:/i, // Link-local
  /^fc00:/i, // Unique local
  /^fd00:/i, // Unique local
  /^::ffff:127\./i, // IPv4-mapped loopback
  /^::ffff:10\./i, // IPv4-mapped class A
  /^::ffff:172\.(1[6-9]|2[0-9]|3[0-1])\./i, // IPv4-mapped class B
  /^::ffff:192\.168\./i, // IPv4-mapped class C
  /^::ffff:169\.254\./i, // IPv4-mapped link-local
];

/**
 * Blocked hostnames and patterns
 */
const BLOCKED_HOSTNAMES = [
  'localhost',
  'localhost.localdomain',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  '[::1]',
  // Cloud metadata endpoints
  'metadata.google.internal',
  'metadata.google.com',
  'instance-data',
];

/**
 * Blocked hostname patterns (regex)
 */
const BLOCKED_HOSTNAME_PATTERNS = [
  /\.internal$/i,
  /\.local$/i,
  /\.localhost$/i,
  /^169\.254\.\d+\.\d+$/,
];

/**
 * Allowed protocols for external requests
 */
const ALLOWED_PROTOCOLS = ['https:', 'http:'];

/**
 * Whitelist of allowed domains (optional - can be configured per use case)
 */
const DEFAULT_ALLOWED_DOMAINS: string[] = [
  // Add trusted external domains here if needed
];

export interface SSRFValidationOptions {
  /** Additional allowed domains for this specific request */
  allowedDomains?: string[];
  /** Whether to allow HTTP (not just HTTPS) */
  allowHttp?: boolean;
  /** Whether to perform DNS lookup validation */
  validateDns?: boolean;
  /** Request timeout in milliseconds */
  timeout?: number;
}

export interface SSRFValidationResult {
  safe: boolean;
  error?: string;
  resolvedIp?: string;
}

/**
 * Check if an IP address is private/internal
 */
function isPrivateIP(ip: string): boolean {
  return PRIVATE_IP_PATTERNS.some((pattern) => pattern.test(ip));
}

/**
 * Check if a hostname is blocked
 */
function isBlockedHostname(hostname: string): boolean {
  const lowerHostname = hostname.toLowerCase();

  // Check exact matches
  if (BLOCKED_HOSTNAMES.includes(lowerHostname)) {
    return true;
  }

  // Check pattern matches
  return BLOCKED_HOSTNAME_PATTERNS.some((pattern) => pattern.test(lowerHostname));
}

/**
 * Validate a URL for SSRF vulnerabilities
 */
export async function validateUrlForSSRF(
  urlString: string,
  options: SSRFValidationOptions = {}
): Promise<SSRFValidationResult> {
  const {
    allowedDomains = DEFAULT_ALLOWED_DOMAINS,
    allowHttp = false,
    validateDns = true,
  } = options;

  try {
    // Parse URL
    const url = new URL(urlString);

    // Check protocol
    if (!ALLOWED_PROTOCOLS.includes(url.protocol)) {
      return { safe: false, error: `Protocol ${url.protocol} is not allowed` };
    }

    // Enforce HTTPS unless explicitly allowed
    if (!allowHttp && url.protocol === 'http:') {
      return { safe: false, error: 'Only HTTPS URLs are allowed' };
    }

    // Check for blocked hostnames
    if (isBlockedHostname(url.hostname)) {
      return { safe: false, error: 'Hostname is not allowed' };
    }

    // Check if hostname is already an IP address
    if (isPrivateIP(url.hostname)) {
      return { safe: false, error: 'Private IP addresses are not allowed' };
    }

    // Check against whitelist if configured
    if (allowedDomains.length > 0) {
      const isAllowed = allowedDomains.some(
        (domain) => url.hostname === domain || url.hostname.endsWith(`.${domain}`)
      );
      if (!isAllowed) {
        return { safe: false, error: 'Domain is not in the allowed list' };
      }
    }

    // DNS lookup validation
    if (validateDns) {
      try {
        const { address } = await dnsLookup(url.hostname);

        if (isPrivateIP(address)) {
          return {
            safe: false,
            error: 'URL resolves to a private IP address',
            resolvedIp: address,
          };
        }

        return { safe: true, resolvedIp: address };
      } catch (dnsError) {
        // DNS lookup failed
        return {
          safe: false,
          error: `DNS lookup failed: ${dnsError instanceof Error ? dnsError.message : 'Unknown error'}`,
        };
      }
    }

    return { safe: true };
  } catch (error) {
    return {
      safe: false,
      error: `Invalid URL: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Sanitize a URL for safe external requests
 * Returns null if the URL is not safe
 */
export async function sanitizeExternalUrl(
  urlString: string,
  options: SSRFValidationOptions = {}
): Promise<string | null> {
  const result = await validateUrlForSSRF(urlString, options);
  return result.safe ? urlString : null;
}

/**
 * Create a safe fetch wrapper that validates URLs before fetching
 */
export async function safeFetch(
  urlString: string,
  fetchOptions: RequestInit = {},
  ssrfOptions: SSRFValidationOptions = {}
): Promise<Response> {
  const validation = await validateUrlForSSRF(urlString, ssrfOptions);

  if (!validation.safe) {
    throw new Error(`SSRF protection blocked request: ${validation.error}`);
  }

  const timeout = ssrfOptions.timeout || 30000;

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(urlString, {
      ...fetchOptions,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Validate webhook/callback URLs
 */
export async function validateWebhookUrl(url: string): Promise<SSRFValidationResult> {
  return validateUrlForSSRF(url, {
    allowHttp: false, // Webhooks must use HTTPS
    validateDns: true,
  });
}
