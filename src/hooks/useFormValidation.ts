
import { useState, useCallback } from 'react';
import * as z from 'zod';
import { categories } from '@/lib/api';
import { ValidationRule, ValidationTextOptions } from '@/lib/api/types';

export interface ValidationSchema {
  [key: string]: z.ZodType<any>;
}

export interface ValidationErrors {
  [key: string]: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationErrors;
}

export const useFormValidation = () => {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isValid, setIsValid] = useState(true);
  
  // Function to generate a schema object from a category's columns
  const generateSchemaFromCategory = async (categoryId: string) => {
    try {
      const category = await categories.getById(categoryId);
      if (!category || !category.columns) {
        throw new Error('Category or columns not found');
      }
      
      // Get columns from the category
      const columns = await categories.getCategoryColumns(categoryId);
      
      // Create a schema object using Zod
      const schemaObj: Record<string, z.ZodType<any>> = {};
      
      // Process each column and create appropriate validation rules
      columns.forEach(column => {
        let fieldSchema: z.ZodType<any>;
        
        switch(column.type) {
          case 'text':
          case 'textarea':
            fieldSchema = z.string().optional();
            break;
          case 'number':
            fieldSchema = z.number().optional();
            break;
          case 'date':
            fieldSchema = z.string().optional();
            break;
          case 'select':
          case 'radio':
            fieldSchema = z.string().optional();
            break;
          case 'checkbox':
            fieldSchema = z.boolean().optional();
            break;
          default:
            fieldSchema = z.any().optional();
        }
        
        schemaObj[column.name] = fieldSchema;
      });
      
      return z.object(schemaObj);
    } catch (error) {
      console.error('Error generating schema:', error);
      return z.object({});
    }
  };
  
  // Validate text fields with various options
  const validateTextField = (
    value: string,
    options: ValidationTextOptions = {}
  ): ValidationResult => {
    const { required = false, minLength, maxLength, errorMessage, label } = options;
    
    try {
      let schema = z.string();
      
      if (required) {
        schema = schema.min(1, { message: errorMessage || `${label || 'Field'} is required` });
      } else {
        schema = schema.optional();
      }
      
      if (minLength) {
        schema = schema.min(minLength, {
          message: `${label || 'Field'} must be at least ${minLength} characters`,
        });
      }
      
      if (maxLength) {
        schema = schema.max(maxLength, {
          message: `${label || 'Field'} must be at most ${maxLength} characters`,
        });
      }
      
      schema.parse(value);
      return { isValid: true, errors: {} };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.reduce(
          (acc, err) => ({
            ...acc,
            [err.path[0] || 'value']: err.message,
          }),
          {}
        );
        return { isValid: false, errors: errorMessages };
      }
      return {
        isValid: false,
        errors: { value: 'Invalid input' },
      };
    }
  };
  
  // Validate email fields
  const validateEmailField = (
    value: string,
    options: ValidationTextOptions = {}
  ): ValidationResult => {
    const { required = false, errorMessage, label } = options;
    
    try {
      let schema = z.string().email({
        message: errorMessage || `${label || 'Email'} must be a valid email address`,
      });
      
      if (!required) {
        schema = schema.optional();
      }
      
      schema.parse(value);
      return { isValid: true, errors: {} };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          errors: { email: error.errors[0]?.message || 'Invalid email' },
        };
      }
      return {
        isValid: false,
        errors: { email: 'Invalid email format' },
      };
    }
  };
  
  // Validate an entire form against a Zod schema
  const validateForm = <SchemaType extends z.ZodType<any>>(
    data: Record<string, any>,
    schema: SchemaType
  ): ValidationResult => {
    try {
      schema.parse(data);
      return { isValid: true, errors: {} };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.reduce(
          (acc, err) => ({
            ...acc,
            [err.path[0] || 'value']: err.message,
          }),
          {}
        );
        return { isValid: false, errors: errorMessages };
      }
      return {
        isValid: false,
        errors: { form: 'Form validation failed' },
      };
    }
  };
  
  // Clear all validation errors
  const clearErrors = useCallback(() => {
    setErrors({});
    setIsValid(true);
  }, []);
  
  // Set a specific error
  const setError = useCallback((field: string, message: string) => {
    setErrors(prev => ({ ...prev, [field]: message }));
    setIsValid(false);
  }, []);
  
  // Remove a specific error
  const removeError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
    
    // If no more errors, set isValid to true
    setIsValid(Object.keys(errors).length === 0);
  }, [errors]);
  
  return {
    errors,
    isValid,
    validateForm,
    validateTextField,
    validateEmailField,
    generateSchemaFromCategory,
    clearErrors,
    setError,
    removeError,
    setErrors,
    setIsValid
  };
};
