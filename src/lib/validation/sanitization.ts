
import { z } from 'zod';
import DOMPurify from 'dompurify';

// Options for HTML sanitization
interface SanitizeHtmlOptions {
  allowedTags?: string[];
  allowedAttributes?: { [key: string]: string[] };
  allowedClasses?: { [key: string]: string[] };
  dropDisallowedElements?: boolean;
  stripIgnoreTag?: boolean;
}

// Basic sanitization for all text inputs
export const sanitizeText = (text: string): string => {
  return DOMPurify.sanitize(text, {
    USE_PROFILES: { html: false },
  });
};

// HTML sanitization with configurable options
export const sanitizeHtml = (html: string, options?: SanitizeHtmlOptions): string => {
  // Configure DOMPurify based on options
  const config: DOMPurify.Config = {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: options?.allowedTags || [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'a', 'ul', 'ol', 'li',
      'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'table', 'thead', 'tbody',
      'tr', 'th', 'td', 'pre', 'blockquote', 'img', 'span',
    ],
    ALLOWED_ATTR: options?.allowedAttributes ? 
      Object.entries(options.allowedAttributes).flatMap(([tag, attrs]) => attrs) : 
      ['href', 'name', 'target', 'src', 'alt', 'class', 'id', 'style'],
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
    DROP_UNWANTED: options?.dropDisallowedElements || false,
    FORCE_BODY: true,
  };

  // Return sanitized HTML
  return DOMPurify.sanitize(html, config);
};

// Create a Zod schema for sanitized HTML content
export const createSanitizedHtmlSchema = (options?: {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  htmlOptions?: SanitizeHtmlOptions;
  errorMessage?: string;
}) => {
  let schema = z.string()
    .transform(value => sanitizeHtml(value, options?.htmlOptions));

  if (options?.minLength) {
    schema = schema.refine(
      val => val.length >= options.minLength!,
      { message: `Content must be at least ${options.minLength} characters` }
    );
  }

  if (options?.maxLength) {
    schema = schema.refine(
      val => val.length <= options.maxLength!,
      { message: `Content cannot exceed ${options.maxLength} characters` }
    );
  }

  if (options?.required) {
    schema = schema.refine(
      val => val.trim().length > 0,
      { message: options.errorMessage || 'This field is required' }
    );
  }

  if (!options?.required) {
    return z.union([z.literal(''), schema]).optional();
  }

  return schema;
};

// Function to sanitize all string fields in an object
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const result = { ...obj };
  
  for (const key in result) {
    if (typeof result[key] === 'string') {
      result[key] = sanitizeText(result[key] as string) as unknown as T[keyof T];
    } else if (typeof result[key] === 'object' && result[key] !== null) {
      result[key] = sanitizeObject(result[key]) as unknown as T[keyof T];
    }
  }
  
  return result;
}
