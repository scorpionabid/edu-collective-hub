
import * as z from 'zod';
import DOMPurify from 'dompurify';

/**
 * Creates a string validation schema with common validations
 */
export const createStringSchema = ({
  required = true,
  minLength,
  maxLength,
  pattern,
  patternErrorMessage,
  label = 'Field',
}: {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  patternErrorMessage?: string;
  label?: string;
} = {}) => {
  let schema = z.string().trim();

  // Add min validation if specified
  if (minLength !== undefined) {
    schema = schema.min(minLength, `${label} must be at least ${minLength} characters`);
  }

  // Add max validation if specified
  if (maxLength !== undefined) {
    schema = schema.max(maxLength, `${label} must not exceed ${maxLength} characters`);
  }

  // Add pattern validation if specified
  if (pattern !== undefined) {
    schema = schema.regex(pattern, patternErrorMessage || `${label} has an invalid format`);
  }

  // Make it required or optional
  if (required) {
    schema = schema.min(1, `${label} is required`);
  } else {
    // Use z.string().trim() for empty string handling
    schema = z.string().trim().optional();
  }

  return schema;
};

/**
 * Creates an email validation schema
 */
export const createEmailSchema = ({
  required = true,
  label = 'Email',
}: {
  required?: boolean;
  label?: string;
} = {}) => {
  let schema = z
    .string()
    .trim()
    .email(`${label} must be a valid email address`);

  if (!required) {
    // Use a proper transformation for optional email
    return z.union([
      z.literal(''),
      schema
    ]).transform(val => val === '' ? undefined : val).optional();
  }

  return schema;
};

/**
 * Creates a number validation schema
 */
export const createNumberSchema = ({
  required = true,
  min,
  max,
  integer = false,
  label = 'Number',
}: {
  required?: boolean;
  min?: number;
  max?: number;
  integer?: boolean;
  label?: string;
} = {}) => {
  let schema = z.number();

  // Add integer validation if specified
  if (integer) {
    schema = schema.int(`${label} must be an integer`);
  }

  // Add min validation if specified
  if (min !== undefined) {
    schema = schema.min(min, `${label} must be at least ${min}`);
  }

  // Add max validation if specified
  if (max !== undefined) {
    schema = schema.max(max, `${label} must not exceed ${max}`);
  }

  // Make it required or optional
  if (!required) {
    return schema.optional();
  }

  return schema;
};

/**
 * Creates a number validation schema that can be parsed from a string
 */
export const createNumberFromStringSchema = ({
  required = true,
  min,
  max,
  integer = false,
  label = 'Number',
}: {
  required?: boolean;
  min?: number;
  max?: number;
  integer?: boolean;
  label?: string;
} = {}) => {
  const numberSchema = createNumberSchema({
    required,
    min,
    max,
    integer,
    label,
  });

  // Create a schema that transforms strings to numbers
  const transformSchema = z.preprocess((val) => {
    if (val === '' || val === null || val === undefined) {
      return undefined;
    }
    const parsed = Number(val);
    return isNaN(parsed) ? undefined : parsed;
  }, required ? numberSchema : numberSchema.optional());

  return transformSchema;
};

/**
 * Creates a URL validation schema
 */
export const createUrlSchema = ({
  required = true,
  label = 'URL',
}: {
  required?: boolean;
  label?: string;
} = {}) => {
  let schema = z
    .string()
    .trim()
    .url(`${label} must be a valid URL`);

  if (!required) {
    // Use a proper transformation for optional URL
    return z.union([
      z.literal(''),
      schema
    ]).transform(val => val === '' ? undefined : val).optional();
  }

  return schema;
};

/**
 * Sanitizes HTML to prevent XSS attacks
 */
export const sanitizeHtml = (html: string): string => {
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
  }) as string; // Cast the return value to string
};

/**
 * Creates an HTML content validation schema with sanitization
 */
export const createHtmlSchema = ({
  required = true,
  minLength,
  maxLength,
  label = 'Content',
}: {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  label?: string;
} = {}) => {
  let schema = z
    .string()
    .trim()
    .transform((val) => sanitizeHtml(val));

  // Add min validation if specified
  if (minLength !== undefined) {
    schema = schema.min(minLength, `${label} must be at least ${minLength} characters`);
  }

  // Add max validation if specified
  if (maxLength !== undefined) {
    schema = schema.max(maxLength, `${label} must not exceed ${maxLength} characters`);
  }

  // Make it required or optional
  if (required) {
    schema = schema.min(1, `${label} is required`);
  } else {
    schema = schema.optional();
  }

  return schema;
};
