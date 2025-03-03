
// This file contains utility functions for sanitizing input data
import DOMPurify from 'dompurify';
import { z } from 'zod';

/**
 * Sanitizes HTML content to prevent XSS attacks.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  });
}

/**
 * Sanitizes text to prevent injection attacks.
 */
export function sanitizeText(text: string): string {
  if (!text) return '';
  // Basic text sanitization - removes HTML tags
  return text.replace(/<\/?[^>]+(>|$)/g, '');
}

/**
 * Creates a Zod schema that ensures HTML content is sanitized.
 */
export function safeHtml() {
  return z.string().transform((val) => sanitizeHtml(val));
}

/**
 * Creates a Zod schema that ensures text content is sanitized.
 */
export function safeText() {
  return z.string().transform((val) => sanitizeText(val));
}

/**
 * Creates a Zod schema for email validation and sanitization.
 */
export function safeEmail() {
  return z.string().email().transform((val) => sanitizeText(val));
}

/**
 * Creates a Zod schema for password validation.
 */
export function safePassword(minLength = 8) {
  return z.string().min(minLength);
}

/**
 * Creates a Zod schema for name validation and sanitization.
 */
export function safeName() {
  return z.string().transform((val) => sanitizeText(val));
}

/**
 * Sanitizes all string values in an object recursively.
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  if (!obj) return obj;
  
  const result = { ...obj };
  
  Object.keys(result).forEach((key) => {
    const value = result[key];
    
    if (typeof value === 'string') {
      result[key] = sanitizeText(value) as any;
    } else if (typeof value === 'object' && value !== null) {
      result[key] = sanitizeObject(value);
    }
  });
  
  return result;
}

/**
 * Creates customized Zod schemas for common form fields.
 */
export const safeFormFields = {
  name: () => safeName().min(2).max(100),
  email: () => safeEmail(),
  password: (minLength = 8) => safePassword(minLength),
  text: (options?: { min?: number; max?: number }) => {
    let schema = safeText();
    if (options?.min !== undefined) schema = schema as any;
    if (options?.max !== undefined) schema = schema as any;
    return schema;
  },
  html: () => safeHtml(),
  optional: {
    text: () => safeText().optional(),
    html: () => safeHtml().optional(),
    email: () => safeEmail().optional(),
  }
};
