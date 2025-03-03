
import * as DOMPurify from 'dompurify';
import { z } from 'zod';

// Configuration profiles for different sanitization levels
const sanitizationProfiles = {
  strict: {
    allowedTags: ['b', 'i', 'em', 'strong', 'a', 'br'],
    strip: true
  },
  basic: {
    allowedTags: ['p', 'b', 'i', 'em', 'strong', 'a', 'br', 'ul', 'ol', 'li'],
    strip: true
  },
  medium: {
    allowedTags: ['p', 'b', 'i', 'em', 'strong', 'a', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    strip: true
  },
  rich: {
    allowedTags: [
      'p', 'b', 'i', 'em', 'strong', 'a', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'blockquote', 'pre', 'code', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td'
    ],
    allowedAttributes: {
      'a': ['href', 'title', 'target'],
      'img': ['src', 'alt', 'title', 'width', 'height']
    },
    strip: true
  },
  custom: (config: DOMPurify.Config) => ({
    ...config,
    strip: true
  })
};

// Sanitize HTML content with configurable options
export const sanitizeHtml = (html: string, profile: keyof typeof sanitizationProfiles = 'strict'): string => {
  let config = sanitizationProfiles[profile] || sanitizationProfiles.strict;
  
  // Apply the sanitization
  if (typeof config === 'function') {
    return DOMPurify.sanitize(html, config({}));
  }
  
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: config.allowedTags,
    ...(config.allowedAttributes ? { ALLOWED_ATTR: config.allowedAttributes } : {}),
    KEEP_CONTENT: config.strip
  });
};

// Sanitize plain text (strip all HTML)
export const sanitizeText = (text: string): string => {
  const config: DOMPurify.Config = {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true
  };
  
  return DOMPurify.sanitize(text, config);
};

// Create Zod transformers for sanitization
export const createSanitizedStringSchema = (options?: {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  label?: string;
  allowHtml?: boolean;
  htmlProfile?: keyof typeof sanitizationProfiles;
}) => {
  const { 
    required = true, 
    minLength, 
    maxLength, 
    label = 'Field',
    allowHtml = false,
    htmlProfile = 'strict'
  } = options || {};
  
  // Create the base string schema
  let schema = z.string().transform(val => {
    return allowHtml ? sanitizeHtml(val, htmlProfile) : sanitizeText(val);
  });
  
  // Add length constraints if provided
  if (minLength) {
    schema = schema.refine(
      (val) => val.length >= minLength,
      { message: `${label} must be at least ${minLength} characters` }
    );
  }
  
  if (maxLength) {
    schema = schema.refine(
      (val) => val.length <= maxLength,
      { message: `${label} must not exceed ${maxLength} characters` }
    );
  }
  
  // Make it required or optional
  return required ? schema : schema.optional();
};

export const sanitizationService = {
  sanitizeHtml,
  sanitizeText,
  createSanitizedStringSchema
};

export default sanitizationService;
