
import { useState } from 'react';
import { z, ZodType, ZodTypeDef } from 'zod';
import { api } from '@/lib/api';
import { FormData } from '@/lib/api/types';
import { sanitizeText } from '@/lib/validation/sanitization';

// Options for form submission
interface SubmitOptions {
  categoryId: string;
  schoolId?: string;
  id?: string;
  isUpdate?: boolean;
}

// Hook for validated form submissions
export function useValidatedFormSubmission(categoryId: string) {
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generic function to submit form data with validation
  const submitFormData = async <T extends Record<string, any>>(
    data: T,
    options: SubmitOptions
  ): Promise<FormData | null> => {
    try {
      setIsSubmitting(true);
      setError('');

      // Sanitize text fields to prevent XSS
      const sanitizedData = { ...data };
      Object.keys(sanitizedData).forEach(key => {
        if (typeof sanitizedData[key] === 'string') {
          sanitizedData[key] = sanitizeText(sanitizedData[key]);
        }
      });

      let result: FormData | null = null;

      // If we're updating an existing form
      if (options.isUpdate && options.id) {
        result = await api.formData.updateFormData(options.id, {
          ...sanitizedData,
          categoryId: options.categoryId,
          schoolId: sanitizedData.schoolId || options.schoolId || '',
        });
      } else {
        // Creating a new form
        const formDataToSubmit: Omit<FormData, 'id'> = {
          categoryId: options.categoryId,
          schoolId: sanitizedData.schoolId || options.schoolId || '',
          data: sanitizedData.data || {},
          status: sanitizedData.status || 'draft',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        result = await api.formData.createFormData(formDataToSubmit);
      }

      return result;
    } catch (error: any) {
      console.error('Form submission error:', error);
      setError(error.message || 'An error occurred while submitting the form');
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clear any errors
  const clearError = () => {
    setError('');
  };

  return {
    submitFormData,
    error,
    isSubmitting,
    clearError
  };
}
