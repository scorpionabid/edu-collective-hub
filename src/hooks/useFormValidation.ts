import { useCallback, useState } from 'react';
import * as z from 'zod';
import { ZodEffects, ZodObject, ZodType, ZodTypeDef } from 'zod';
import sanitizationService from '@/lib/validation/sanitization';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export function useFormValidation<T>() {
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [validationSchema, setValidationSchema] = useState<ZodType<T, ZodTypeDef, T>>();
  const [isValid, setIsValid] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  // Validate a single field
  const validateField = useCallback((
    field: string,
    value: any,
    formData: Record<string, any>,
    schema?: ZodType<any>
  ) => {
    if (!schema) return true;
    
    // Extract the specific field schema if it's an object schema with shape
    let fieldSchema: ZodType<any> | undefined;
    try {
      // Try to access the field schema safely
      if (schema instanceof ZodObject) {
        // @ts-ignore - this is a workaround for shape property access
        fieldSchema = schema._def.shape()[field];
      }
    } catch (err) {
      console.warn(`Could not extract schema for field ${field}:`, err);
    }
    
    // If fieldSchema is not found, we'll validate the whole form
    // but only report errors for this specific field
    const schemaToUse = fieldSchema || schema;
    
    try {
      // If we have a field-specific schema, validate just the field
      if (fieldSchema) {
        fieldSchema.parse(value);
      } else {
        // Otherwise validate the whole form data and check for field errors
        schemaToUse.parse(formData);
      }
      
      // Remove any existing error for this field
      setValidationErrors(prev => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
      
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        // Only set errors for the current field
        const fieldErrors = err.errors
          .filter(e => e.path.includes(field) || e.path[0] === field)
          .reduce((acc, curr) => {
            const path = Array.isArray(curr.path) ? curr.path.join('.') : curr.path;
            acc[path] = curr.message;
            return acc;
          }, {} as Record<string, string>);
        
        if (Object.keys(fieldErrors).length > 0) {
          setValidationErrors(prev => ({
            ...prev,
            [field]: fieldErrors[field] || fieldErrors[Object.keys(fieldErrors)[0]]
          }));
          return false;
        }
      }
      
      // If no specific field errors, it's valid for this field
      setValidationErrors(prev => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
      
      return true;
    }
  }, []);

  // Validate the entire form
  const validateForm = useCallback(async (
    formData: Record<string, any>,
    schema?: ZodType<T, ZodTypeDef, T>
  ) => {
    setIsValidating(true);
    const schemaToUse = schema || validationSchema;
    
    if (!schemaToUse) {
      setIsValid(true);
      setValidationErrors({});
      setIsValidating(false);
      return true;
    }
    
    try {
      // First sanitize the form data
      const sanitizedData = sanitizationService.sanitize.formData(formData);
      
      // Then validate with Zod
      schemaToUse.parse(sanitizedData);
      
      setIsValid(true);
      setValidationErrors({});
      setIsValidating(false);
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors = err.errors.reduce((acc, curr) => {
          const path = Array.isArray(curr.path) ? curr.path.join('.') : curr.path.toString();
          acc[path] = curr.message;
          return acc;
        }, {} as Record<string, string>);
        
        setValidationErrors(newErrors);
        setIsValid(false);
        setIsValidating(false);
        return false;
      }
      
      // For other types of errors
      console.error('Validation error:', err);
      toast.error('An unexpected error occurred during form validation');
      setIsValid(false);
      setIsValidating(false);
      return false;
    }
  }, [validationSchema]);

  // Report validation error to analytics/monitoring
  const reportValidationError = useCallback(async (
    field: string,
    value: any,
    errorMessage: string,
    formId?: string
  ) => {
    try {
      if (api.categoryValidation && api.categoryValidation.logValidationError) {
        await api.categoryValidation.logValidationError({
          fieldName: field,
          errorMessage,
          inputValue: value,
          formId,
          componentName: 'FormValidation'
        });
      }
    } catch (err) {
      console.error('Failed to report validation error:', err);
    }
  }, []);

  return {
    validationErrors,
    setValidationErrors,
    validationSchema,
    setValidationSchema,
    isValid,
    isValidating,
    validateField,
    validateForm,
    reportValidationError
  };
}

export default useFormValidation;
