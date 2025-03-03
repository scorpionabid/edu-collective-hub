
import DOMPurify from 'dompurify';
import { z } from 'zod';

/**
 * Configuration profiles for HTML sanitization
 */
const sanitizationProfiles = {
  // Extremely restrictive - almost no tags allowed
  strict: {
    ALLOWED_TAGS: ['p', 'b', 'i', 'em', 'strong', 'span', 'br'],
    ALLOWED_ATTR: [],
  },
  // Basic formatting only
  basic: {
    ALLOWED_TAGS: ['p', 'b', 'i', 'em', 'strong', 'span', 'br', 'ul', 'ol', 'li', 'a', 'hr'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  },
  // Medium level - common formatting + tables
  medium: {
    ALLOWED_TAGS: [
      'p', 'b', 'i', 'em', 'strong', 'span', 'br', 'ul', 'ol', 'li', 'a', 'hr',
      'table', 'thead', 'tbody', 'tr', 'th', 'td', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'blockquote', 'pre', 'code', 'img'
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'width', 'height', 'style'],
  },
  // Rich text - more permissive for admin usage
  rich: {
    ALLOWED_TAGS: [
      'p', 'b', 'i', 'em', 'strong', 'span', 'br', 'ul', 'ol', 'li', 'a', 'hr',
      'table', 'thead', 'tbody', 'tr', 'th', 'td', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'blockquote', 'pre', 'code', 'img', 'div', 'section', 'article', 'header', 'footer',
      'sub', 'sup', 'dl', 'dt', 'dd', 'figure', 'figcaption'
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'width', 'height', 'style', 'class', 'id'],
  },
  // Custom profiles can be created by the caller
  custom: {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  },
};

/**
 * Sanitize HTML string to prevent XSS attacks
 * @param dirtyHtml Input HTML that might contain malicious code
 * @param profile Sanitization profile to use
 * @returns Sanitized HTML string
 */
export const sanitizeHTML = (
  dirtyHtml: string,
  profile: keyof typeof sanitizationProfiles = 'basic'
): string => {
  if (typeof dirtyHtml !== 'string') {
    return '';
  }

  const config = sanitizationProfiles[profile];
  return DOMPurify.sanitize(dirtyHtml, config);
};

/**
 * Zod transformer that sanitizes HTML
 * @param profile Sanitization profile to use 
 */
export const createSanitizedString = (
  profile: keyof typeof sanitizationProfiles = 'basic'
) => {
  return z.string().transform((val) => sanitizeHTML(val, profile));
};

// Create Zod schemas for text with various sanitization levels
export const sanitizedText = {
  strict: createSanitizedString('strict'),
  basic: createSanitizedString('basic'),
  medium: createSanitizedString('medium'),
  rich: createSanitizedString('rich'),
  custom: (config: typeof sanitizationProfiles.custom) => {
    // Store the custom config temporarily
    const originalConfig = { ...sanitizationProfiles.custom };
    sanitizationProfiles.custom = config;
    const schema = createSanitizedString('custom');
    // Restore original empty custom config
    sanitizationProfiles.custom = originalConfig;
    return schema;
  },
};

// Function to sanitize a record of string values
export const sanitizeObject = <T extends Record<string, unknown>>(
  obj: T,
  profile: keyof typeof sanitizationProfiles = 'basic'
): T => {
  const result = { ...obj };
  for (const key in result) {
    if (typeof result[key] === 'string') {
      result[key] = sanitizeHTML(result[key] as string, profile) as unknown;
    }
  }
  return result;
};

export default {
  sanitizeHTML,
  sanitizeObject,
  sanitizedText
};
