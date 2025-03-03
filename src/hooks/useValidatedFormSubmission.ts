
import { useState } from 'react';
import { api } from '@/lib/api';
import { z } from 'zod';
import * as sanitization from '@/lib/validation/sanitization';

export function useValidatedFormSubmission() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Submit sanitized and validated form data
  const submitFormData = async <T extends Record<string, any>>(
    data: T,
    schema: z.ZodType<any>,
    options: {
      categoryId: string;
      schoolId?: string;
      id?: string;
      isUpdate?: boolean;
    }
  ) => {
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Sanitize all string data
      const sanitizedData = { ...data };
      Object.keys(sanitizedData).forEach(key => {
        const value = sanitizedData[key];
        if (typeof value === 'string') {
          sanitizedData[key] = sanitization.sanitizeText(value);
        }
      });

      // Validate the sanitized data
      const parseResult = schema.safeParse(sanitizedData);
      if (!parseResult.success) {
        throw new Error(`Validation failed: ${parseResult.error.message}`);
      }

      // Submit the validated data
      let result;
      
      if (options.isUpdate && options.id) {
        // Update existing form data
        result = await api.formData.update(options.id, {
          categoryId: options.categoryId,
          schoolId: options.schoolId || '',
          data: sanitizedData,
          status: 'draft'
        });
        setSuccessMessage('Form data updated successfully.');
      } else {
        // Create new form data
        result = await api.formData.create({
          categoryId: options.categoryId,
          schoolId: options.schoolId || '',
          data: sanitizedData,
          status: 'draft'
        });
        setSuccessMessage('Form data submitted successfully.');
      }

      setIsSubmitting(false);
      return result;
    } catch (err) {
      console.error('Error submitting form data:', err);
      setError(err instanceof Error ? err : new Error('Failed to submit form'));
      setIsSubmitting(false);
      throw err;
    }
  };

  return {
    submitFormData,
    isSubmitting,
    error,
    successMessage,
    clearSuccessMessage: () => setSuccessMessage(null),
    clearError: () => setError(null)
  };
}
