
import { z } from 'zod';
import DOMPurify from 'dompurify';

/**
 * Sanitizes an HTML string using DOMPurify
 */
export const sanitizeHtml = (
  dirty: string,
  options: DOMPurify.Config = {}
): string => {
  // Default config for sanitization
  const defaultConfig: DOMPurify.Config = {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'ul', 'ol', 'li', 'br'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
    USE_PROFILES: { html: true }
  };

  // Merge configs
  const config = { ...defaultConfig, ...options };
  
  // Sanitize the HTML and return as string
  return DOMPurify.sanitize(dirty, config).toString();
};

/**
 * Sanitizes a plain text string
 */
export const sanitizeText = (text: string): string => {
  // Simple text sanitization
  return String(text)
    .replace(/[<>]/g, '') // Remove < and > characters
    .trim();
};

/**
 * Sanitizes a potentially dangerous filename
 */
export const sanitizeFilename = (filename: string): string => {
  return String(filename)
    .replace(/[/\\?%*:|"<>]/g, '_') // Replace illegal characters with underscore
    .trim();
};

// Zod transformers for sanitization
export const textSanitizer = <T extends z.ZodType<string, any, any>>(schema: T) => {
  return schema.transform((val) => sanitizeText(val));
};

export const htmlSanitizer = <T extends z.ZodType<string, any, any>>(
  schema: T,
  options?: DOMPurify.Config
) => {
  return schema.transform((val) => sanitizeHtml(val, options));
};

// Create a reusable Zod schema for sanitized text
export const sanitizedText = z.string().transform(sanitizeText);

// Create a reusable Zod schema for sanitized HTML
export const sanitizedHtml = z.string().transform((val) => sanitizeHtml(val));

// Sanitize an object's string fields
export const sanitizeObject = <T extends Record<string, any>>(obj: T): T => {
  const result = { ...obj };
  
  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    
    if (typeof value === 'string') {
      result[key] = sanitizeText(value) as any;
    } else if (typeof value === 'object' && value !== null) {
      result[key] = sanitizeObject(value);
    }
  });
  
  return result;
};
