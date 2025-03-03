
import DOMPurify from 'dompurify';
import { z } from 'zod';

interface SanitizeHtmlOptions {
  allowedTags?: string[];
  allowedAttrs?: string[];
  forbiddenTags?: string[];
  forbiddenAttrs?: string[];
}

/**
 * Sanitizes HTML content to prevent XSS attacks
 */
export function sanitizeHtml(html: string, options?: SanitizeHtmlOptions): string {
  const config: DOMPurify.Config = {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: options?.allowedTags || [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'a', 
      'ul', 'ol', 'li', 'b', 'i', 'strong', 'em', 'strike', 
      'code', 'hr', 'table', 'thead', 'tbody', 'tr', 'th', 
      'td', 'pre', 'blockquote', 'img', 'span'
    ],
    ALLOWED_ATTR: options?.allowedAttrs || [
      'href', 'name', 'target', 'src', 'alt', 'class', 'id', 'style'
    ],
    FORBID_TAGS: options?.forbiddenTags || [
      'script', 'iframe', 'object', 'embed', 'form', 'input', 'button'
    ],
    FORBID_ATTR: options?.forbiddenAttrs || [
      'onerror', 'onload', 'onclick', 'onmouseover'
    ],
  };

  // Convert TrustedHTML to string
  return String(DOMPurify.sanitize(html, config));
}

/**
 * Creates a schema for sanitized HTML content
 */
export function createSanitizedHtmlSchema(options?: {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  label?: string;
  sanitizeOptions?: SanitizeHtmlOptions;
}) {
  const label = options?.label || 'HTML content';
  let schema = z.string().transform(val => sanitizeHtml(val, options?.sanitizeOptions));
  
  if (options?.minLength) {
    schema = schema.refine(
      html => html.length >= (options.minLength || 0),
      { message: `${label} must be at least ${options.minLength} characters` }
    );
  }
  
  if (options?.maxLength) {
    schema = schema.refine(
      html => html.length <= (options.maxLength || 0),
      { message: `${label} must be no more than ${options.maxLength} characters` }
    );
  }
  
  if (options?.required !== false) {
    schema = schema.refine(
      html => html.trim().length > 0,
      { message: `${label} is required` }
    );
  } else {
    schema = schema.optional();
  }
  
  return schema;
}

/**
 * Sanitize all HTML fields in an object
 */
export function sanitizeHtmlFields<T extends Record<string, any>>(
  data: T,
  htmlFields: Array<keyof T>
): T {
  const result = { ...data };
  
  for (const field of htmlFields) {
    if (typeof result[field] === 'string') {
      result[field] = sanitizeHtml(result[field] as string) as any;
    }
  }
  
  return result;
}
