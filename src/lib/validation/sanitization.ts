
import DOMPurify from 'dompurify';
import { z } from 'zod';

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param html HTML content to sanitize
 * @param profile Sanitization profile to use (basic, strict, medium, rich, or custom)
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(html: string, profile: 'basic' | 'strict' | 'medium' | 'rich' | 'custom' = 'basic'): string {
  if (!html) return '';
  
  const config: DOMPurify.Config = {};
  
  // Configure different sanitization profiles
  switch (profile) {
    case 'strict':
      // Only allow plain text, strip all HTML
      config.ALLOWED_TAGS = [];
      config.ALLOWED_ATTR = [];
      break;
      
    case 'basic':
      // Allow basic formatting tags only
      config.ALLOWED_TAGS = ['b', 'i', 'u', 'p', 'span', 'br'];
      config.ALLOWED_ATTR = ['style'];
      break;
      
    case 'medium':
      // Allow basic formatting plus lists and links
      config.ALLOWED_TAGS = ['b', 'i', 'u', 'p', 'span', 'br', 'ul', 'ol', 'li', 'a'];
      config.ALLOWED_ATTR = ['style', 'href', 'target'];
      break;
      
    case 'rich':
      // Allow most formatting but restrict scripts and iframes
      config.ALLOWED_TAGS = ['b', 'i', 'u', 'p', 'span', 'br', 'ul', 'ol', 'li', 'a', 
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'code', 'hr', 'table', 
        'thead', 'tbody', 'tr', 'th', 'td', 'strong', 'em', 'img', 'figure', 'figcaption'];
      config.ALLOWED_ATTR = ['style', 'href', 'target', 'src', 'alt', 'title', 'width', 'height'];
      break;
      
    case 'custom':
      // Will use the default DOMPurify settings
      break;
  }
  
  return DOMPurify.sanitize(html, config);
}

/**
 * Sanitizes plain text input (no HTML allowed)
 * @param text Text to sanitize
 * @returns Sanitized string
 */
export function sanitizeText(text: string): string {
  if (!text) return '';
  // Use strict mode to strip all HTML
  return sanitizeHtml(text, 'strict');
}

/**
 * Creates a sanitized string schema for Zod
 * @param options Configuration options for text validation
 * @returns Zod schema for sanitized string
 */
export function createSanitizedStringSchema(options: {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  errorMessage?: string;
  isHtml?: boolean;
  htmlProfile?: 'basic' | 'strict' | 'medium' | 'rich' | 'custom';
} = {}) {
  // Start with a basic string schema
  let schema = z.string().transform(val => val.trim());
  
  // Apply sanitization
  schema = schema.transform(val => 
    options.isHtml 
      ? sanitizeHtml(val, options.htmlProfile || 'basic') 
      : sanitizeText(val)
  );
  
  // Make it optional if not required
  if (!options.required) {
    schema = schema.optional();
  }
  
  return schema;
}

/**
 * Sanitizes an entire object's string properties
 * @param data Object to sanitize
 * @returns Sanitized object
 */
export function sanitizeObject<T extends Record<string, any>>(data: T): T {
  const result = { ...data };
  
  Object.keys(result).forEach(key => {
    const value = result[key];
    
    if (typeof value === 'string') {
      result[key] = sanitizeText(value) as any;
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = sanitizeObject(value);
    }
  });
  
  return result;
}
