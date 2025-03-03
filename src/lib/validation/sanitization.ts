import DOMPurify from 'dompurify';

// Types of data that can be sanitized
export type SanitizationTarget = string | Record<string, any> | any[];

// Sanitization options
export interface SanitizationOptions {
  allowHtml?: boolean;
  allowedTags?: string[];
  allowedAttributes?: Record<string, string[]>;
  maxLength?: number;
  trimString?: boolean;
  treatEmptyAsNull?: boolean;
  coerceTypes?: boolean;
}

// Default sanitization options
const defaultOptions: SanitizationOptions = {
  allowHtml: false,
  trimString: true,
  treatEmptyAsNull: false,
  coerceTypes: true,
};

// Sanitization service
export const sanitizationService = {
  // Sanitize a single value
  sanitizeValue: (value: any, options: SanitizationOptions = {}): any => {
    const opts = { ...defaultOptions, ...options };
    
    if (value === null || value === undefined) {
      return value;
    }
    
    // Handle different types
    if (typeof value === 'string') {
      let result = value;
      
      // Trim the string if needed
      if (opts.trimString) {
        result = result.trim();
      }
      
      // Enforce max length if specified
      if (opts.maxLength && result.length > opts.maxLength) {
        result = result.substring(0, opts.maxLength);
      }
      
      // Handle empty strings
      if (result === '' && opts.treatEmptyAsNull) {
        return null;
      }
      
      // Sanitize HTML content if present
      if (!opts.allowHtml) {
        // Remove all HTML tags
        result = DOMPurify.sanitize(result, { ALLOWED_TAGS: [] });
      } else if (opts.allowedTags && opts.allowedTags.length > 0) {
        // Allow only specific HTML tags
        const sanitizeOptions: any = {
          ALLOWED_TAGS: opts.allowedTags,
        };
        
        if (opts.allowedAttributes) {
          sanitizeOptions.ALLOWED_ATTR = Object.keys(opts.allowedAttributes).reduce(
            (acc, key) => [...acc, ...opts.allowedAttributes![key]],
            [] as string[]
          );
        }
        
        result = DOMPurify.sanitize(result, sanitizeOptions);
      }
      
      return result;
    }
    
    // Type coercion if enabled
    if (opts.coerceTypes) {
      // Convert string numbers to actual numbers
      if (typeof value === 'string' && !isNaN(Number(value)) && value.trim() !== '') {
        return Number(value);
      }
      
      // Convert "true"/"false" strings to booleans
      if (typeof value === 'string' && (value.toLowerCase() === 'true' || value.toLowerCase() === 'false')) {
        return value.toLowerCase() === 'true';
      }
    }
    
    // Objects and arrays need recursive sanitization
    if (Array.isArray(value)) {
      return value.map(item => sanitizationService.sanitizeValue(item, options));
    }
    
    if (typeof value === 'object') {
      return sanitizationService.sanitizeObject(value, options);
    }
    
    // Return unchanged for other primitive types
    return value;
  },
  
  // Sanitize an object recursively
  sanitizeObject: <T extends Record<string, any>>(obj: T, options: SanitizationOptions = {}): T => {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    
    const result = { ...obj };
    
    for (const key in result) {
      if (Object.prototype.hasOwnProperty.call(result, key)) {
        result[key] = sanitizationService.sanitizeValue(result[key], options);
      }
    }
    
    return result;
  },
  
  // Sanitize a complete form submission
  sanitizeForm: <T extends Record<string, any>>(
    formData: T,
    fieldOptions: Record<string, SanitizationOptions> = {},
    globalOptions: SanitizationOptions = {}
  ): T => {
    const result = { ...formData };
    
    for (const key in result) {
      if (Object.prototype.hasOwnProperty.call(result, key)) {
        // Use field-specific options if available, otherwise use global options
        const options = fieldOptions[key]
          ? { ...defaultOptions, ...globalOptions, ...fieldOptions[key] }
          : { ...defaultOptions, ...globalOptions };
        
        result[key] = sanitizationService.sanitizeValue(result[key], options);
      }
    }
    
    return result;
  },
  
  // Sanitize HTML content (useful for rich text editors)
  sanitizeHtml: (html: string, allowedTags?: string[], allowedAttributes?: Record<string, string[]>): string => {
    const options: any = {};
    
    if (allowedTags) {
      options.ALLOWED_TAGS = allowedTags;
    }
    
    if (allowedAttributes) {
      options.ALLOWED_ATTR = Object.keys(allowedAttributes).reduce(
        (acc, key) => [...acc, ...allowedAttributes[key]],
        [] as string[]
      );
    }
    
    return DOMPurify.sanitize(html, options);
  },
  
  // Protect against XSS in user input
  escapeHtml: (text: string): string => {
    if (!text) return text;
    
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },
  
  // Protect against SQL injection (basic protection - database should handle parameterized queries)
  escapeSql: (text: string): string => {
    if (!text) return text;
    
    return text
      .replace(/'/g, "''")
      .replace(/\\/g, '\\\\');
  },
};
