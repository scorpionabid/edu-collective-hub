
import * as z from 'zod';
import DOMPurify from 'dompurify';

// Define HTML profile configurations
const htmlProfiles = {
  strict: {
    allowedTags: ['p', 'b', 'i', 'em', 'strong'],
    strip: true
  },
  basic: {
    allowedTags: ['p', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li'],
    strip: true
  },
  medium: {
    allowedTags: ['p', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote'],
    strip: true
  },
  rich: {
    allowedTags: [
      'p', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote',
      'hr', 'br', 'div', 'span', 'code', 'pre', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td'
    ],
    strip: true
  },
  custom: {
    allowedTags: [],
    strip: true
  }
};

// Singleton sanitization service
const sanitizationService = {
  // Sanitize HTML content
  sanitizeHtml: (html: string, profile: keyof typeof htmlProfiles = 'basic'): string => {
    if (!html) return '';
    
    const config = htmlProfiles[profile];
    
    // DOMPurify doesn't have sanitize property directly on the imported module
    // It has the 'sanitize' method
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: config.allowedTags,
      KEEP_CONTENT: config.strip
    });
  },
  
  // Simple text sanitization for plain text
  sanitizeText: (text: string): string => {
    if (!text) return '';
    // Use DOMPurify with all tags stripped
    return DOMPurify.sanitize(text, {
      ALLOWED_TAGS: [],
      KEEP_CONTENT: true
    });
  },
  
  // Create a Zod schema with sanitization for strings
  createSanitizedStringSchema: (options?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    errorMessage?: string;
    isHtml?: boolean;
    htmlProfile?: keyof typeof htmlProfiles;
  }): z.ZodType<string> => {
    const {
      required = true,
      minLength,
      maxLength,
      errorMessage = 'Invalid input',
      isHtml = false,
      htmlProfile = 'basic'
    } = options || {};
    
    // Start with a base string schema
    let schema = z.string().transform(val => {
      return isHtml 
        ? sanitizationService.sanitizeHtml(val, htmlProfile)
        : sanitizationService.sanitizeText(val);
    });
    
    // Add validation constraints
    if (minLength !== undefined) {
      schema = schema.refine((val) => val.length >= minLength, {
        message: `Must be at least ${minLength} characters`
      });
    }
    
    if (maxLength !== undefined) {
      schema = schema.refine((val) => val.length <= maxLength, {
        message: `Must be at most ${maxLength} characters`
      });
    }
    
    // Handle optional fields
    if (!required) {
      return z.optional(schema);
    }
    
    return schema;
  }
};

export default sanitizationService;
