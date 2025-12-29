/**
 * PII Detection and Redaction
 *
 * Detects personally identifiable information in user content
 * and provides options to redact or warn about sensitive data.
 */

export interface PIIMatch {
  type: PIIType;
  value: string;
  startIndex: number;
  endIndex: number;
  confidence: 'high' | 'medium' | 'low';
}

export type PIIType =
  | 'email'
  | 'phone'
  | 'ssn'
  | 'credit_card'
  | 'passport'
  | 'address'
  | 'ip_address'
  | 'date_of_birth'
  | 'name_pattern';

export interface PIIDetectionResult {
  hasPII: boolean;
  matches: PIIMatch[];
  riskLevel: 'none' | 'low' | 'medium' | 'high';
}

export interface PIIRedactionResult {
  redactedText: string;
  redactedCount: number;
  originalMatches: PIIMatch[];
}

// PII detection patterns with confidence levels
const PII_PATTERNS: {
  type: PIIType;
  pattern: RegExp;
  confidence: 'high' | 'medium' | 'low';
  description: string;
}[] = [
  // Email addresses - high confidence
  {
    type: 'email',
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    confidence: 'high',
    description: 'Email address',
  },

  // Phone numbers - various formats
  {
    type: 'phone',
    pattern: /\b(?:\+?1[-.\s]?)?(?:\(?[0-9]{3}\)?[-.\s]?)?[0-9]{3}[-.\s]?[0-9]{4}\b/g,
    confidence: 'medium',
    description: 'US phone number',
  },
  {
    type: 'phone',
    pattern: /\b(?:\+?44[-.\s]?)?(?:0?[0-9]{2,4}[-.\s]?)?[0-9]{3,4}[-.\s]?[0-9]{3,4}\b/g,
    confidence: 'low',
    description: 'UK phone number',
  },

  // SSN - US Social Security Number
  {
    type: 'ssn',
    pattern: /\b[0-9]{3}[-\s]?[0-9]{2}[-\s]?[0-9]{4}\b/g,
    confidence: 'high',
    description: 'US Social Security Number',
  },

  // Credit card numbers (basic patterns)
  {
    type: 'credit_card',
    pattern:
      /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})\b/g,
    confidence: 'high',
    description: 'Credit card number',
  },
  {
    type: 'credit_card',
    pattern: /\b[0-9]{4}[-\s]?[0-9]{4}[-\s]?[0-9]{4}[-\s]?[0-9]{4}\b/g,
    confidence: 'medium',
    description: 'Credit card number with separators',
  },

  // Passport numbers (basic patterns for common formats)
  {
    type: 'passport',
    pattern: /\b[A-Z]{1,2}[0-9]{6,9}\b/g,
    confidence: 'low',
    description: 'Passport number',
  },

  // IP addresses
  {
    type: 'ip_address',
    pattern:
      /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g,
    confidence: 'high',
    description: 'IPv4 address',
  },

  // Date of birth patterns (various formats)
  {
    type: 'date_of_birth',
    pattern:
      /\b(?:born|dob|birth(?:day|date)?)[:\s]+[0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{2,4}\b/gi,
    confidence: 'high',
    description: 'Date of birth',
  },
  {
    type: 'date_of_birth',
    pattern: /\b(?:0?[1-9]|[12][0-9]|3[01])[\/\-](?:0?[1-9]|1[0-2])[\/\-](?:19|20)[0-9]{2}\b/g,
    confidence: 'low',
    description: 'Date pattern (could be DOB)',
  },

  // Street addresses (basic US pattern)
  {
    type: 'address',
    pattern:
      /\b[0-9]{1,5}\s+[A-Za-z]+(?:\s+[A-Za-z]+)*\s+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way|Court|Ct|Circle|Cir)\b/gi,
    confidence: 'medium',
    description: 'Street address',
  },
];

/**
 * Detect PII in text content
 *
 * @param text - Text to scan for PII
 * @returns Detection result with matches and risk level
 */
export function detectPII(text: string): PIIDetectionResult {
  const matches: PIIMatch[] = [];

  for (const { type, pattern, confidence } of PII_PATTERNS) {
    // Reset regex state
    pattern.lastIndex = 0;

    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text)) !== null) {
      // Capture values to avoid null check issues in callback
      const matchIndex = match.index;
      const matchValue = match[0];
      const matchEnd = matchIndex + matchValue.length;

      // Avoid duplicate matches at same position
      const isDuplicate = matches.some(
        (m) => m.startIndex === matchIndex && m.endIndex === matchEnd
      );

      if (!isDuplicate) {
        matches.push({
          type,
          value: matchValue,
          startIndex: matchIndex,
          endIndex: matchEnd,
          confidence,
        });
      }
    }
  }

  // Sort by position
  matches.sort((a, b) => a.startIndex - b.startIndex);

  // Calculate risk level
  const riskLevel = calculateRiskLevel(matches);

  return {
    hasPII: matches.length > 0,
    matches,
    riskLevel,
  };
}

/**
 * Calculate overall risk level based on PII matches
 */
function calculateRiskLevel(matches: PIIMatch[]): 'none' | 'low' | 'medium' | 'high' {
  if (matches.length === 0) return 'none';

  const highConfidenceCount = matches.filter((m) => m.confidence === 'high').length;
  const sensitiveTypes: PIIType[] = ['ssn', 'credit_card', 'passport'];
  const hasSensitiveType = matches.some((m) => sensitiveTypes.includes(m.type));

  if (hasSensitiveType || highConfidenceCount >= 2) return 'high';
  if (highConfidenceCount >= 1 || matches.length >= 3) return 'medium';
  return 'low';
}

/**
 * Redact PII from text content
 *
 * @param text - Text to redact PII from
 * @param options - Redaction options
 * @returns Redacted text and metadata
 */
export function redactPII(
  text: string,
  options: {
    placeholder?: string;
    preserveLength?: boolean;
    minConfidence?: 'low' | 'medium' | 'high';
  } = {}
): PIIRedactionResult {
  const { placeholder = '[REDACTED]', preserveLength = false, minConfidence = 'medium' } = options;

  const detection = detectPII(text);

  // Filter by confidence level
  const confidenceOrder = { low: 1, medium: 2, high: 3 };
  const minConfidenceLevel = confidenceOrder[minConfidence];
  const matchesToRedact = detection.matches.filter(
    (m) => confidenceOrder[m.confidence] >= minConfidenceLevel
  );

  if (matchesToRedact.length === 0) {
    return {
      redactedText: text,
      redactedCount: 0,
      originalMatches: detection.matches,
    };
  }

  // Redact from end to start to preserve indices
  let redactedText = text;
  const sortedMatches = [...matchesToRedact].sort((a, b) => b.startIndex - a.startIndex);

  for (const match of sortedMatches) {
    const replacement = preserveLength ? '*'.repeat(match.value.length) : `${placeholder}`;

    redactedText =
      redactedText.slice(0, match.startIndex) + replacement + redactedText.slice(match.endIndex);
  }

  return {
    redactedText,
    redactedCount: matchesToRedact.length,
    originalMatches: detection.matches,
  };
}

/**
 * Check if text contains high-risk PII that should block submission
 *
 * @param text - Text to check
 * @returns true if high-risk PII is detected
 */
export function containsHighRiskPII(text: string): boolean {
  const detection = detectPII(text);
  return detection.riskLevel === 'high';
}

/**
 * Get a user-friendly warning message about detected PII
 *
 * @param detection - PII detection result
 * @returns Warning message or null if no warning needed
 */
export function getPIIWarningMessage(detection: PIIDetectionResult): string | null {
  if (!detection.hasPII) return null;

  const typeDescriptions: Record<PIIType, string> = {
    email: 'email address',
    phone: 'phone number',
    ssn: 'social security number',
    credit_card: 'credit card number',
    passport: 'passport number',
    address: 'street address',
    ip_address: 'IP address',
    date_of_birth: 'date of birth',
    name_pattern: 'personal name',
  };

  const detectedTypes = [...new Set(detection.matches.map((m) => m.type))];
  const descriptions = detectedTypes.map((t) => typeDescriptions[t]);

  if (detection.riskLevel === 'high') {
    return `Warning: Your submission contains sensitive personal information (${descriptions.join(', ')}). Please remove this information before submitting.`;
  }

  if (detection.riskLevel === 'medium') {
    return `Note: Your submission may contain personal information (${descriptions.join(', ')}). Consider removing it for privacy.`;
  }

  return null;
}

/**
 * Sanitize text for logging by redacting all PII
 *
 * @param text - Text to sanitize for logs
 * @returns Sanitized text safe for logging
 */
export function sanitizeForLogging(text: string): string {
  const { redactedText } = redactPII(text, {
    placeholder: '[***]',
    minConfidence: 'low',
  });
  return redactedText;
}
