
import DOMPurify from 'dompurify';
import * as z from 'zod';

// Sanitization options
const DEFAULT_ALLOWED_TAGS = ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'span'];
const STRICT_ALLOWED_TAGS: string[] = [];

// Define options for different sanitization levels
export const sanitizationLevels = {
  none: { allowedTags: [] as string[], strip: true },
  strict: { allowedTags: STRICT_ALLOWED_TAGS, strip: true },
  basic: { allowedTags: DEFAULT_ALLOWED_TAGS, strip: false },
  medium: {
    allowedTags: [
      ...DEFAULT_ALLOWED_TAGS,
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'blockquote', 'code', 'pre',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'hr', 'img'
    ],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
      img: ['src', 'alt', 'width', 'height']
    },
    strip: false
  },
  extended: {
    allowedTags: [
      ...DEFAULT_ALLOWED_TAGS,
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'blockquote', 'code', 'pre',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'hr', 'img', 'caption', 'div', 'section',
      'article', 'header', 'footer', 'aside',
      'figure', 'figcaption', 'cite', 'time', 'abbr',
      'data', 'dl', 'dt', 'dd', 'details', 'summary'
    ],
    allowedAttributes: {
      '*': ['id', 'class', 'style'],
      a: ['href', 'target', 'rel'],
      img: ['src', 'alt', 'width', 'height', 'loading']
    },
    strip: false
  }
};

// Sanitize HTML string function
export function sanitizeHtml(
  html: string,
  level: keyof typeof sanitizationLevels = 'strict'
): string {
  if (!html) return '';
  
  const options = sanitizationLevels[level];
  const sanitized = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: options.allowedTags,
    ALLOWED_ATTR: options.allowedAttributes ? Object.keys(options.allowedAttributes) : [],
    KEEP_CONTENT: !options.strip,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_DOM_IMPORT: false,
    RETURN_TRUSTED_TYPE: false
  });
  
  return sanitized;
}

// Create a Zod schema that sanitizes HTML
export function createSanitizedStringSchema(options?: {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  sanitizationLevel?: keyof typeof sanitizationLevels;
  label?: string;
}) {
  const {
    required = true,
    minLength,
    maxLength,
    sanitizationLevel = 'strict',
    label = 'Field'
  } = options || {};
  
  let schema = z.string().transform((val) => sanitizeHtml(val, sanitizationLevel));
  
  // Apply length validations after sanitizing
  if (minLength !== undefined) {
    schema = schema.refine(
      (val) => val.length >= minLength,
      { message: `${label} must be at least ${minLength} characters after sanitization` }
    );
  }
  
  if (maxLength !== undefined) {
    schema = schema.refine(
      (val) => val.length <= maxLength,
      { message: `${label} must not exceed ${maxLength} characters after sanitization` }
    );
  }
  
  if (!required) {
    return z.union([z.literal(''), schema]).optional();
  }
  
  return schema.refine((val) => val.length > 0, {
    message: `${label} is required and cannot be empty after sanitization`
  });
}

// Sanitization utility functions for different data types
export const sanitize = {
  string: (value: string, level: keyof typeof sanitizationLevels = 'strict'): string => {
    return sanitizeHtml(value, level);
  },
  
  email: (value: string): string => {
    // Basic email sanitization (no HTML allowed)
    return value.trim().toLowerCase();
  },
  
  number: (value: string | number): number => {
    if (typeof value === 'number') return value;
    const sanitized = value.replace(/[^\d.-]/g, '');
    return parseFloat(sanitized) || 0;
  },
  
  boolean: (value: any): boolean => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const lowercased = value.toLowerCase().trim();
      return lowercased === 'true' || lowercased === 'yes' || lowercased === '1';
    }
    return Boolean(value);
  },
  
  object: <T extends Record<string, any>>(
    obj: T,
    level: keyof typeof sanitizationLevels = 'strict'
  ): T => {
    if (!obj || typeof obj !== 'object') return {} as T;
    
    const result: Record<string, any> = {};
    
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        
        if (typeof value === 'string') {
          result[key] = sanitizeHtml(value, level);
        } else if (typeof value === 'object' && value !== null) {
          if (Array.isArray(value)) {
            result[key] = value.map(item => 
              typeof item === 'string' ? sanitizeHtml(item, level) : 
              typeof item === 'object' ? sanitize.object(item, level) : 
              item
            );
          } else {
            result[key] = sanitize.object(value, level);
          }
        } else {
          result[key] = value;
        }
      }
    }
    
    return result as T;
  },
  
  // Sanitize form data recursively
  formData: <T extends Record<string, any>>(
    data: T,
    level: keyof typeof sanitizationLevels = 'basic'
  ): T => {
    return sanitize.object(data, level);
  }
};

// Default export of the sanitization service
const sanitizationService = {
  sanitizeHtml,
  createSanitizedStringSchema,
  sanitize,
  sanitizationLevels
};

export default sanitizationService;
