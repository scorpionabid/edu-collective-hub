
// Common validation utility functions for forms
import { z } from 'zod';

// Value must be unique in an array of objects by a specific key
export const uniqueInArray = <T>(
  array: T[],
  key: keyof T,
  message: string = 'Value must be unique'
) => (value: T[typeof key]) => 
  !array.some(item => item[key] === value) || message;

// Value must be one of the allowed values
export const isOneOf = <T>(
  allowedValues: T[],
  message: string = 'Value must be one of the allowed values'
) => (value: T) => 
  allowedValues.includes(value) || message;

// Value must be a valid Azerbaijani phone number
export const isAzerbaijanPhoneNumber = (
  message: string = 'Invalid phone number format'
) => (value: string) => 
  /^(\+994|0)(50|51|55|70|77|99|10|60)[0-9]{7}$/.test(value) || message;

// Value must be a valid Azerbaijani postal code
export const isAzerbaijanPostalCode = (
  message: string = 'Invalid postal code format'
) => (value: string) => 
  /^(AZ)?[0-9]{4}$/.test(value) || message;

// Value must be a valid Azerbaijani ID card number
export const isAzerbaijanIdCard = (
  message: string = 'Invalid ID card number format'
) => (value: string) => 
  /^[A-Z]{3}[0-9]{6}$/.test(value) || message;

// Value must be a valid date in a specific range
export const isDateInRange = (
  min: Date,
  max: Date,
  message: string = 'Date must be in the valid range'
) => (value: string) => {
  const date = new Date(value);
  return (date >= min && date <= max) || message;
};

// Value is a fiscal year (e.g. 2023-2024)
export const isFiscalYear = (
  message: string = 'Invalid fiscal year format (must be YYYY-YYYY)'
) => (value: string) => 
  /^[0-9]{4}-[0-9]{4}$/.test(value) || message;

// Value is a valid educational grade (1-12)
export const isEducationalGrade = (
  message: string = 'Grade must be between 1 and 12'
) => (value: number) => 
  (value >= 1 && value <= 12) || message;

// Value is a valid percentage (0-100)
export const isPercentage = (
  message: string = 'Percentage must be between 0 and 100'
) => (value: number) => 
  (value >= 0 && value <= 100) || message;

// Value must be a valid URL with https
export const isSecureUrl = (
  message: string = 'URL must start with https://'
) => (value: string) => 
  /^https:\/\//.test(value) || message;

// Create refined schemas for common validation patterns
export const createAzerbaijanPhoneSchema = (options?: { required?: boolean; label?: string }) => {
  const { required = true, label = 'Phone Number' } = options || {};
  
  let schema = z.string().refine(
    (val) => /^(\+994|0)(50|51|55|70|77|99|10|60)[0-9]{7}$/.test(val),
    {
      message: `Invalid ${label.toLowerCase()} format`,
    }
  );
  
  if (!required) {
    schema = schema.optional();
  }
  
  return schema;
};

export const createAzerbaijanIdCardSchema = (options?: { required?: boolean; label?: string }) => {
  const { required = true, label = 'ID Card' } = options || {};
  
  let schema = z.string().refine(
    (val) => /^[A-Z]{3}[0-9]{6}$/.test(val),
    {
      message: `Invalid ${label.toLowerCase()} format`,
    }
  );
  
  if (!required) {
    schema = schema.optional();
  }
  
  return schema;
};

export const createPercentageSchema = (options?: { 
  required?: boolean; 
  label?: string;
  allowDecimals?: boolean;
}) => {
  const { required = true, label = 'Percentage', allowDecimals = false } = options || {};
  
  let schema = z.number()
    .min(0, `${label} must be at least 0`)
    .max(100, `${label} must not exceed 100`);
  
  if (!allowDecimals) {
    schema = schema.int(`${label} must be a whole number`);
  }
  
  if (!required) {
    schema = schema.optional();
  }
  
  return schema;
};

export const createEducationalGradeSchema = (options?: { 
  required?: boolean; 
  label?: string;
}) => {
  const { required = true, label = 'Grade' } = options || {};
  
  let schema = z.number()
    .int(`${label} must be a whole number`)
    .min(1, `${label} must be at least 1`)
    .max(12, `${label} must not exceed 12`);
  
  if (!required) {
    schema = schema.optional();
  }
  
  return schema;
};

export const createFiscalYearSchema = (options?: { 
  required?: boolean; 
  label?: string;
  startYear?: number;
  endYear?: number;
}) => {
  const { 
    required = true, 
    label = 'Fiscal Year',
    startYear = 2000,
    endYear = new Date().getFullYear() + 5 
  } = options || {};
  
  let schema = z.string().refine(
    (val) => {
      const regex = /^(\d{4})-(\d{4})$/;
      const match = val.match(regex);
      
      if (!match) return false;
      
      const year1 = parseInt(match[1], 10);
      const year2 = parseInt(match[2], 10);
      
      return (
        year1 >= startYear && 
        year1 <= endYear &&
        year2 >= startYear && 
        year2 <= endYear &&
        year2 === year1 + 1
      );
    },
    {
      message: `${label} must be in format YYYY-YYYY and within valid range`,
    }
  );
  
  if (!required) {
    schema = schema.optional();
  }
  
  return schema;
};
