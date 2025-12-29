/**
 * AI Input Sanitization
 *
 * Protects against prompt injection attacks by sanitizing user input
 * before sending to the AI model.
 */

import { detectPII, getPIIWarningMessage, sanitizeForLogging } from '@/lib/security/pii-detector';

/**
 * Maximum allowed length for essay content
 * ~750 words max for IELTS essay (approximately 5000 characters)
 */
const MAX_ESSAY_LENGTH = 5000;

/**
 * Maximum allowed length for question prompts
 */
const MAX_PROMPT_LENGTH = 2000;

/**
 * Patterns that indicate potential prompt injection attempts
 */
const INJECTION_PATTERNS = [
  // Direct instruction override attempts
  /ignore\s+(all\s+)?(previous|above|prior)\s+instructions/gi,
  /disregard\s+(all\s+)?(previous|above|prior)/gi,
  /forget\s+(all\s+)?(previous|above|prior)\s+instructions/gi,

  // System prompt extraction attempts
  /system\s*prompt/gi,
  /what\s+(are|were)\s+your\s+instructions/gi,
  /reveal\s+(your|the)\s+instructions/gi,
  /show\s+(me\s+)?(your|the)\s+system/gi,
  /repeat\s+(everything|all|the\s+text)\s+(above|before)/gi,

  // Role manipulation attempts
  /you\s+are\s+(now\s+)?(?:DAN|jailbroken|unrestricted|evil)/gi,
  /pretend\s+(you're|you\s+are|to\s+be)/gi,
  /act\s+as\s+(if\s+you're|a|an)/gi,
  /roleplay\s+as/gi,
  /you\s+must\s+obey/gi,

  // Special token injection
  /\[INST\]/gi,
  /\[\/INST\]/gi,
  /<<SYS>>/gi,
  /<\|.*?\|>/g,
  /```system/gi,
  /```assistant/gi,
  /```user/gi,

  // XML/HTML tag injection for prompt structure
  /<\/?system>/gi,
  /<\/?assistant>/gi,
  /<\/?user>/gi,
  /<\/?human>/gi,

  // Developer mode / bypass attempts
  /developer\s+mode/gi,
  /maintenance\s+mode/gi,
  /debug\s+mode/gi,
  /admin\s+mode/gi,
  /bypass\s+(the\s+)?filter/gi,
];

/**
 * Result of input validation
 */
export interface ValidationResult {
  valid: boolean;
  reason?: string;
}

/**
 * Result of sanitization
 */
export interface SanitizationResult {
  sanitized: string;
  wasModified: boolean;
  removedPatterns: string[];
}

/**
 * Sanitize user input to prevent prompt injection attacks
 *
 * @param input - Raw user input (essay or prompt)
 * @param maxLength - Maximum allowed length (defaults to MAX_ESSAY_LENGTH)
 * @returns Sanitized input with potential injection patterns removed
 */
export function sanitizeAIInput(
  input: string,
  maxLength: number = MAX_ESSAY_LENGTH
): SanitizationResult {
  const removedPatterns: string[] = [];
  let wasModified = false;

  // 1. Enforce length limit
  let sanitized = input.slice(0, maxLength);
  if (sanitized.length !== input.length) {
    wasModified = true;
  }

  // 2. Remove potential injection patterns
  for (const pattern of INJECTION_PATTERNS) {
    const matches = sanitized.match(pattern);
    if (matches) {
      removedPatterns.push(...matches);
      sanitized = sanitized.replace(pattern, '[FILTERED]');
      wasModified = true;
    }
  }

  // 3. Normalize whitespace (but preserve paragraph structure)
  const originalLength = sanitized.length;
  sanitized = sanitized
    .replace(/\r\n/g, '\n') // Normalize line endings
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ') // Collapse horizontal whitespace
    .replace(/\n{3,}/g, '\n\n') // Max 2 consecutive newlines
    .trim();

  if (sanitized.length !== originalLength) {
    wasModified = true;
  }

  // 4. Encode characters that could break prompt structure
  sanitized = sanitized.replace(/</g, '&lt;').replace(/>/g, '&gt;');

  return {
    sanitized,
    wasModified,
    removedPatterns,
  };
}

/**
 * Validate essay content meets basic requirements
 *
 * @param essay - Essay text to validate
 * @returns Validation result with reason if invalid
 */
export function validateEssayContent(essay: string): ValidationResult {
  // Check for empty content
  if (!essay || essay.trim().length === 0) {
    return { valid: false, reason: 'Essay content cannot be empty' };
  }

  // Check minimum word count
  const wordCount = essay.trim().split(/\s+/).length;
  if (wordCount < 50) {
    return { valid: false, reason: 'Essay too short (minimum 50 words required)' };
  }

  // Check maximum word count
  if (wordCount > 1000) {
    return { valid: false, reason: 'Essay too long (maximum 1000 words allowed)' };
  }

  // Check for excessive special characters (potential injection)
  const alphanumericCount = (essay.match(/[a-zA-Z0-9\s.,!?'"()-]/g) || []).length;
  const specialCharRatio = 1 - alphanumericCount / essay.length;
  if (specialCharRatio > 0.15) {
    return { valid: false, reason: 'Essay contains too many special characters' };
  }

  // Check for repetitive content (potential spam/abuse)
  const words = essay.toLowerCase().split(/\s+/);
  const uniqueWords = new Set(words);
  const uniqueRatio = uniqueWords.size / words.length;
  if (uniqueRatio < 0.3 && words.length > 100) {
    return { valid: false, reason: 'Essay contains too much repetitive content' };
  }

  return { valid: true };
}

/**
 * Validate and sanitize essay for AI evaluation
 *
 * @param essay - Raw essay input
 * @returns Object with processed essay or error
 */
export function prepareEssayForEvaluation(essay: string):
  | {
      success: true;
      essay: string;
      wasModified: boolean;
      piiWarning?: string;
    }
  | {
      success: false;
      error: string;
    } {
  // First validate
  const validation = validateEssayContent(essay);
  if (!validation.valid) {
    return { success: false, error: validation.reason! };
  }

  // Check for PII
  const piiDetection = detectPII(essay);
  const piiWarning = getPIIWarningMessage(piiDetection) || undefined;

  // Log PII detection for security monitoring (with redacted content)
  if (piiDetection.hasPII) {
    console.warn('[SECURITY] PII detected in essay submission:', {
      riskLevel: piiDetection.riskLevel,
      types: [...new Set(piiDetection.matches.map((m) => m.type))],
      count: piiDetection.matches.length,
      // Use sanitized version for logging
      sampleContent: sanitizeForLogging(essay.slice(0, 100)),
    });
  }

  // Then sanitize for prompt injection
  const { sanitized, wasModified, removedPatterns } = sanitizeAIInput(essay);

  // Log if injection patterns were removed (for security monitoring)
  if (removedPatterns.length > 0) {
    console.warn('[SECURITY] Potential injection patterns removed:', {
      count: removedPatterns.length,
      patterns: removedPatterns.slice(0, 5), // Log first 5 for monitoring
    });
  }

  return {
    success: true,
    essay: sanitized,
    wasModified,
    piiWarning,
  };
}

/**
 * Sanitize question prompt before including in AI request
 *
 * @param prompt - Question prompt text
 * @returns Sanitized prompt
 */
export function sanitizeQuestionPrompt(prompt: string): string {
  const { sanitized } = sanitizeAIInput(prompt, MAX_PROMPT_LENGTH);
  return sanitized;
}
