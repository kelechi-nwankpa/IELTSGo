'use client';

import { useMemo } from 'react';
import { sanitizeAIFeedback } from '@/lib/security/xss-sanitizer';

interface SafeTextProps {
  /** The text to sanitize and render */
  children: string;
  /** HTML element to render as (default: span) */
  as?: 'span' | 'p' | 'div' | 'li' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  /** Additional className to apply */
  className?: string;
}

/**
 * SafeText component for rendering AI-generated feedback safely.
 *
 * This component sanitizes text content before rendering to prevent XSS attacks.
 * Use this for any AI-generated content that might contain user-echoed input.
 *
 * @example
 * <SafeText as="p" className="text-gray-700">
 *   {evaluation.overall_feedback}
 * </SafeText>
 */
export function SafeText({ children, as: Component = 'span', className }: SafeTextProps) {
  // Memoize the sanitization to avoid re-sanitizing on every render
  const sanitizedText = useMemo(() => {
    if (typeof children !== 'string') {
      return '';
    }
    return sanitizeAIFeedback(children);
  }, [children]);

  return <Component className={className}>{sanitizedText}</Component>;
}

interface SafeTextListProps {
  /** Array of strings to sanitize and render as list items */
  items: string[];
  /** Prefix to show before each item (e.g., "+", "!", "•") */
  prefix?: string;
  /** Additional className for each list item */
  itemClassName?: string;
  /** Additional className for the prefix */
  prefixClassName?: string;
}

/**
 * SafeTextList component for rendering arrays of AI feedback items safely.
 *
 * @example
 * <SafeTextList
 *   items={criterion.strengths}
 *   prefix="+"
 *   prefixClassName="text-green-500"
 *   itemClassName="text-sm text-gray-600"
 * />
 */
export function SafeTextList({
  items,
  prefix,
  itemClassName = '',
  prefixClassName = '',
}: SafeTextListProps) {
  // Memoize all sanitized items
  const sanitizedItems = useMemo(() => {
    return items.map((item) => (typeof item === 'string' ? sanitizeAIFeedback(item) : ''));
  }, [items]);

  return (
    <>
      {sanitizedItems.map((item, index) => (
        <li key={index} className={`flex items-start gap-1 ${itemClassName}`}>
          {prefix && <span className={prefixClassName}>{prefix}</span>}
          {item}
        </li>
      ))}
    </>
  );
}

export default SafeText;
