
import { useState } from 'react';
import { ZodType, ZodTypeDef } from 'zod';
import { formData } from '@/lib/api';
import * as sanitization from '@/lib/validation/sanitization';

export const useValidatedFormSubmission = () => {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Clear error state
  const clearError = () => setError(null);

  // Sanitize form data before submission to prevent XSS
  const sanitizeFormData = <T extends Record<string, any>>(data: T): T => {
    const sanitizedData = { ...data };
    
    for (const key in sanitizedData) {
      // Only sanitize string values
      if (typeof sanitizedData[key] === 'string') {
        sanitizedData[key] = sanitization.sanitizeHTML(sanitizedData[key] as string);
      }
    }
    
    return sanitizedData;
  };

  // Submit form data with validation
  const submitFormData = async <T extends Record<string, any>>(
    data: T,
    schema: ZodType<any, ZodTypeDef, any>,
    options: {
      categoryId: string;
      schoolId?: string;
      id?: string;
      isUpdate?: boolean;
    }
  ) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate with Zod schema
      const validationResult = schema.safeParse(data);
      if (!validationResult.success) {
        throw new Error('Validation failed: ' + JSON.stringify(validationResult.error));
      }

      // Sanitize data to prevent XSS attacks
      const sanitizedData = sanitizeFormData(data);

      // Prepare form data structure
      const formDataPayload = {
        categoryId: options.categoryId,
        schoolId: options.schoolId || '',
        data: sanitizedData,
        status: 'draft'
      };

      // Update or create
      if (options.isUpdate && options.id) {
        return await formData.updateFormData(options.id, formDataPayload);
      } else {
        return await formData.createFormData(formDataPayload);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitFormData,
    error,
    isSubmitting,
    clearError
  };
};
