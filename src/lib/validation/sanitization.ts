
import DOMPurify from 'dompurify';
import { z } from 'zod';

/**
 * Sanitizes HTML content to prevent XSS attacks
 */
export const sanitizeHtml = (html: string): string => {
  if (!html) return '';
  
  // Use DOMPurify to sanitize HTML
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'a', 'ul', 'ol', 'li',
      'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'table', 'thead', 'tbody',
      'tr', 'th', 'td', 'pre', 'blockquote', 'img', 'span',
    ],
    ALLOWED_ATTR: [
      'href', 'name', 'target', 'src', 'alt', 'class', 'id', 'style',
    ],
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
  }).toString();
};

/**
 * Sanitizes text to be used in HTML context
 */
export const sanitizeText = (text: string): string => {
  if (!text) return '';
  
  // Convert special characters to HTML entities
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Sanitizes input for SQL injection prevention
 */
export const sanitizeSql = (input: string): string => {
  if (!input) return '';
  
  // Remove SQL injection patterns
  return input
    .replace(/'/g, "''")
    .replace(/;/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '')
    .replace(/xp_/gi, '')
    .replace(/exec\s+/gi, '')
    .replace(/UNION\s+SELECT/gi, '');
};

/**
 * Creates a schema for HTML content with sanitization
 */
export const createHtmlSchema = (options?: {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  label?: string;
}) => {
  const { required = true, minLength, maxLength, label = 'Content' } = options || {};
  
  let schema = z.string().transform(sanitizeHtml);
  
  if (minLength) {
    schema = schema.min(minLength, `${label} must be at least ${minLength} characters`);
  }
  
  if (maxLength) {
    schema = schema.max(maxLength, `${label} must not exceed ${maxLength} characters`);
  }
  
  if (!required) {
    return schema.optional();
  }
  
  return schema.min(1, `${label} is required`);
};

/**
 * Validates and sanitizes an object according to a schema
 */
export const validateAndSanitize = <T>(data: any, schema: z.ZodType<T>): { 
  success: boolean; 
  data?: T; 
  errors?: z.ZodIssue[] | Record<string, string>;
} => {
  try {
    const result = schema.safeParse(data);
    
    if (!result.success) {
      // Format errors to be more user-friendly
      const formattedErrors: Record<string, string> = {};
      
      result.error.issues.forEach(issue => {
        const path = issue.path.join('.');
        formattedErrors[path] = issue.message;
      });
      
      return { 
        success: false, 
        errors: formattedErrors 
      };
    }
    
    return { 
      success: true, 
      data: result.data 
    };
  } catch (error) {
    console.error('Validation error:', error);
    return { 
      success: false, 
      errors: [{ path: ['_form'], message: 'An unexpected error occurred during validation' }] as z.ZodIssue[] 
    };
  }
};

export default {
  sanitizeHtml,
  sanitizeText,
  sanitizeSql,
  createHtmlSchema,
  validateAndSanitize,
};
