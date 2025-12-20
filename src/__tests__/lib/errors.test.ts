import { describe, it, expect } from 'vitest';
import {
  ErrorCode,
  createAppError,
  detectAnthropicError,
  detectHttpError,
  formatApiError,
} from '@/lib/errors';

describe('Error Utilities', () => {
  describe('createAppError', () => {
    it('creates an error with user-friendly message', () => {
      const error = createAppError(ErrorCode.NETWORK_ERROR);

      expect(error.code).toBe(ErrorCode.NETWORK_ERROR);
      expect(error.userMessage).toContain('internet connection');
      expect(error.retry).toBe(true);
    });

    it('includes original message when provided', () => {
      const error = createAppError(ErrorCode.UNKNOWN, 'Original error');

      expect(error.message).toBe('Original error');
      expect(error.userMessage).toContain('Something went wrong');
    });
  });

  describe('detectAnthropicError', () => {
    it('detects quota exceeded errors', () => {
      const error = new Error('Your credit balance is too low');
      expect(detectAnthropicError(error)).toBe(ErrorCode.AI_QUOTA_EXCEEDED);
    });

    it('detects rate limit errors', () => {
      const error = new Error('Rate limit exceeded');
      expect(detectAnthropicError(error)).toBe(ErrorCode.AI_RATE_LIMITED);
    });

    it('detects authentication errors', () => {
      const error = new Error('Invalid API key');
      expect(detectAnthropicError(error)).toBe(ErrorCode.AI_AUTHENTICATION_FAILED);
    });

    it('detects timeout errors', () => {
      const error = new Error('Request timed out');
      expect(detectAnthropicError(error)).toBe(ErrorCode.TIMEOUT);
    });

    it('returns UNKNOWN for unrecognized errors', () => {
      const error = new Error('Some random error');
      expect(detectAnthropicError(error)).toBe(ErrorCode.UNKNOWN);
    });
  });

  describe('detectHttpError', () => {
    it('maps 400 to INVALID_INPUT', () => {
      expect(detectHttpError(400)).toBe(ErrorCode.INVALID_INPUT);
    });

    it('maps 401 to AI_AUTHENTICATION_FAILED', () => {
      expect(detectHttpError(401)).toBe(ErrorCode.AI_AUTHENTICATION_FAILED);
    });

    it('maps 404 to CONTENT_NOT_FOUND', () => {
      expect(detectHttpError(404)).toBe(ErrorCode.CONTENT_NOT_FOUND);
    });

    it('maps 429 to AI_RATE_LIMITED', () => {
      expect(detectHttpError(429)).toBe(ErrorCode.AI_RATE_LIMITED);
    });

    it('maps 503 to AI_SERVICE_UNAVAILABLE', () => {
      expect(detectHttpError(503)).toBe(ErrorCode.AI_SERVICE_UNAVAILABLE);
    });

    it('maps unknown status to UNKNOWN', () => {
      expect(detectHttpError(418)).toBe(ErrorCode.UNKNOWN);
    });
  });

  describe('formatApiError', () => {
    it('returns formatted error for API response', () => {
      const result = formatApiError(ErrorCode.AI_QUOTA_EXCEEDED);

      expect(result.code).toBe(ErrorCode.AI_QUOTA_EXCEEDED);
      expect(result.error).toContain('temporarily at capacity');
      expect(result.retry).toBe(true);
    });

    it('includes retry hint based on error type', () => {
      const retryableError = formatApiError(ErrorCode.NETWORK_ERROR);
      expect(retryableError.retry).toBe(true);

      const nonRetryableError = formatApiError(ErrorCode.AI_AUTHENTICATION_FAILED);
      expect(nonRetryableError.retry).toBe(false);
    });
  });
});
