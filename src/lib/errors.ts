/**
 * Error handling utilities for IELTSGo
 * Provides user-friendly error messages for various error scenarios
 */

export enum ErrorCode {
  // API/Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',

  // AI Service errors
  AI_QUOTA_EXCEEDED = 'AI_QUOTA_EXCEEDED',
  AI_RATE_LIMITED = 'AI_RATE_LIMITED',
  AI_AUTHENTICATION_FAILED = 'AI_AUTHENTICATION_FAILED',
  AI_RESPONSE_INVALID = 'AI_RESPONSE_INVALID',
  AI_SERVICE_UNAVAILABLE = 'AI_SERVICE_UNAVAILABLE',

  // Validation errors
  MISSING_FIELDS = 'MISSING_FIELDS',
  INVALID_INPUT = 'INVALID_INPUT',
  CONTENT_NOT_FOUND = 'CONTENT_NOT_FOUND',

  // Generic
  UNKNOWN = 'UNKNOWN',
}

export interface AppError {
  code: ErrorCode;
  message: string;
  userMessage: string;
  retry: boolean;
}

/**
 * User-friendly error messages mapped to error codes
 */
const ERROR_MESSAGES: Record<ErrorCode, { userMessage: string; retry: boolean }> = {
  [ErrorCode.NETWORK_ERROR]: {
    userMessage: 'Unable to connect to the server. Please check your internet connection and try again.',
    retry: true,
  },
  [ErrorCode.TIMEOUT]: {
    userMessage: 'The evaluation is taking longer than expected. Please try again.',
    retry: true,
  },
  [ErrorCode.AI_QUOTA_EXCEEDED]: {
    userMessage: 'Our AI service is temporarily at capacity. Please try again in a few minutes.',
    retry: true,
  },
  [ErrorCode.AI_RATE_LIMITED]: {
    userMessage: 'Too many requests. Please wait a moment before trying again.',
    retry: true,
  },
  [ErrorCode.AI_AUTHENTICATION_FAILED]: {
    userMessage: 'Service configuration error. Please contact support if this persists.',
    retry: false,
  },
  [ErrorCode.AI_RESPONSE_INVALID]: {
    userMessage: 'We received an unexpected response. Please try submitting your essay again.',
    retry: true,
  },
  [ErrorCode.AI_SERVICE_UNAVAILABLE]: {
    userMessage: 'The evaluation service is temporarily unavailable. Please try again later.',
    retry: true,
  },
  [ErrorCode.MISSING_FIELDS]: {
    userMessage: 'Please fill in all required fields before submitting.',
    retry: false,
  },
  [ErrorCode.INVALID_INPUT]: {
    userMessage: 'Please check your input and try again.',
    retry: false,
  },
  [ErrorCode.CONTENT_NOT_FOUND]: {
    userMessage: 'The writing prompt could not be found. Please refresh the page and try again.',
    retry: false,
  },
  [ErrorCode.UNKNOWN]: {
    userMessage: 'Something went wrong. Please try again later.',
    retry: true,
  },
};

/**
 * Create a standardized AppError from an error code
 */
export function createAppError(code: ErrorCode, originalMessage?: string): AppError {
  const { userMessage, retry } = ERROR_MESSAGES[code];
  return {
    code,
    message: originalMessage || userMessage,
    userMessage,
    retry,
  };
}

/**
 * Detect error type from Anthropic API errors
 */
export function detectAnthropicError(error: unknown): ErrorCode {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Check for specific Anthropic error patterns
    if (message.includes('credit balance is too low') || message.includes('quota')) {
      return ErrorCode.AI_QUOTA_EXCEEDED;
    }
    if (message.includes('rate limit') || message.includes('429')) {
      return ErrorCode.AI_RATE_LIMITED;
    }
    if (message.includes('authentication') || message.includes('api key') || message.includes('401')) {
      return ErrorCode.AI_AUTHENTICATION_FAILED;
    }
    if (message.includes('timeout') || message.includes('timed out')) {
      return ErrorCode.TIMEOUT;
    }
    if (message.includes('failed to parse') || message.includes('invalid json')) {
      return ErrorCode.AI_RESPONSE_INVALID;
    }
    if (message.includes('503') || message.includes('service unavailable') || message.includes('overloaded')) {
      return ErrorCode.AI_SERVICE_UNAVAILABLE;
    }
    if (message.includes('network') || message.includes('fetch failed') || message.includes('econnrefused')) {
      return ErrorCode.NETWORK_ERROR;
    }
  }

  return ErrorCode.UNKNOWN;
}

/**
 * Detect error type from HTTP response status codes
 */
export function detectHttpError(status: number): ErrorCode {
  switch (status) {
    case 400:
      return ErrorCode.INVALID_INPUT;
    case 401:
      return ErrorCode.AI_AUTHENTICATION_FAILED;
    case 404:
      return ErrorCode.CONTENT_NOT_FOUND;
    case 429:
      return ErrorCode.AI_RATE_LIMITED;
    case 503:
      return ErrorCode.AI_SERVICE_UNAVAILABLE;
    case 504:
      return ErrorCode.TIMEOUT;
    default:
      return ErrorCode.UNKNOWN;
  }
}

/**
 * Format error for API response (server-side)
 */
export function formatApiError(code: ErrorCode, originalMessage?: string): {
  error: string;
  code: ErrorCode;
  retry: boolean;
} {
  const appError = createAppError(code, originalMessage);
  return {
    error: appError.userMessage,
    code: appError.code,
    retry: appError.retry,
  };
}
