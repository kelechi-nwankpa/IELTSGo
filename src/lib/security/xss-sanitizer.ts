import sanitizeHtml from 'sanitize-html';

/**
 * XSS Sanitization for AI Response Rendering
 *
 * Defense-in-depth layer for sanitizing AI-generated content before
 * rendering in the browser. While React escapes by default, this provides
 * additional protection when:
 * - Using dangerouslySetInnerHTML
 * - Rendering markdown/rich text
 * - Displaying AI feedback that might contain user-echoed content
 */

/**
 * Strict sanitization - removes all HTML
 * Use for plain text fields where no HTML is expected
 */
export function sanitizeStrict(input: string): string {
  return sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: 'discard',
  });
}

/**
 * Safe markdown sanitization options
 * Allows safe formatting tags but strips dangerous ones
 */
const markdownSafeOptions: sanitizeHtml.IOptions = {
  allowedTags: [
    // Text formatting
    'b',
    'i',
    'em',
    'strong',
    'u',
    's',
    'strike',
    'del',
    // Structure
    'p',
    'br',
    'hr',
    // Lists
    'ul',
    'ol',
    'li',
    // Headers (for markdown-rendered content)
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    // Code (for technical feedback)
    'code',
    'pre',
    // Quotes
    'blockquote',
    // Tables (for structured feedback)
    'table',
    'thead',
    'tbody',
    'tr',
    'th',
    'td',
  ],
  allowedAttributes: {
    // Allow class for styling code blocks
    code: ['class'],
    pre: ['class'],
    // Allow class for custom styling
    '*': ['class'],
  },
  allowedClasses: {
    code: ['language-*', 'hljs-*'],
    pre: ['language-*'],
  },
  disallowedTagsMode: 'discard',
  // Prevent attribute injection
  allowedSchemes: [],
  allowedSchemesByTag: {},
  allowProtocolRelative: false,
  enforceHtmlBoundary: true,
  // Text transformation
  textFilter: (text) => {
    // Escape any remaining angle brackets in text nodes
    return text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  },
};

/**
 * Markdown-safe sanitization
 * Allows basic formatting but strips scripts, iframes, etc.
 */
export function sanitizeMarkdown(input: string): string {
  return sanitizeHtml(input, markdownSafeOptions);
}

/**
 * Sanitize AI feedback content
 * Specifically designed for IELTS feedback which may contain:
 * - Band scores and criteria names
 * - Quoted excerpts from user's essay
 * - Improvement suggestions with examples
 */
export function sanitizeAIFeedback(input: string): string {
  // First pass: remove any HTML completely
  const textOnly = sanitizeStrict(input);

  // The result is plain text, safe for rendering
  return textOnly;
}

/**
 * Sanitize an array of feedback strings
 */
export function sanitizeFeedbackArray(inputs: string[]): string[] {
  return inputs.map(sanitizeAIFeedback);
}

/**
 * Sanitize a complete evaluation object recursively
 * Walks through the object and sanitizes all string values
 */
export function sanitizeEvaluationObject<T extends object>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => {
      if (typeof item === 'string') {
        return sanitizeAIFeedback(item);
      }
      if (typeof item === 'object' && item !== null) {
        return sanitizeEvaluationObject(item);
      }
      return item;
    }) as unknown as T;
  }

  const result = { ...obj } as Record<string, unknown>;

  for (const [key, value] of Object.entries(result)) {
    if (typeof value === 'string') {
      result[key] = sanitizeAIFeedback(value);
    } else if (typeof value === 'object' && value !== null) {
      result[key] = sanitizeEvaluationObject(value as object);
    }
  }

  return result as T;
}

/**
 * Escape special characters for safe rendering in HTML attributes
 */
export function escapeHtmlAttribute(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Sanitize a URL for safe use in href attributes
 * Only allows http, https, and mailto protocols
 */
export function sanitizeUrl(url: string): string {
  const trimmed = url.trim().toLowerCase();

  // Allow safe protocols only
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('mailto:')
  ) {
    // Encode any remaining dangerous characters
    return encodeURI(url.trim());
  }

  // For relative URLs, ensure they start with /
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return url.trim();
  }

  // Block all other protocols (javascript:, data:, etc.)
  return '#blocked';
}

/**
 * Create a sanitized excerpt with ellipsis
 * Useful for displaying quoted text safely
 */
export function createSafeExcerpt(text: string, maxLength: number = 200): string {
  const sanitized = sanitizeStrict(text);
  if (sanitized.length <= maxLength) {
    return sanitized;
  }
  return sanitized.slice(0, maxLength - 3) + '...';
}
