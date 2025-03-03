
import { useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { FormData } from '@/lib/api/types';
import { useAuth } from '@/hooks/useAuth';
import sanitizationService from '@/lib/validation/sanitization';
import { toast } from 'sonner';
import * as z from 'zod';
import { ZodType, ZodTypeDef } from 'zod';

export function useValidatedFormSubmission() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionErrors, setSubmissionErrors] = useState<Record<string, string>>({});
  const { user } = useAuth();

  const validateAndSubmitForm = useCallback(async <T>(
    formData: Record<string, any>,
    schema: ZodType<T, ZodTypeDef, T>,
    options: {
      categoryId: string;
      schoolId: string;
      onSuccess?: (data: FormData) => void;
      onError?: (errors: Record<string, string>) => void;
    }
  ) => {
    setIsSubmitting(true);
    setSubmissionErrors({});

    try {
      // First, sanitize the form data
      const sanitizedData = sanitizationService.sanitize.formData(formData);

      // Then validate with schema
      const parseResult = schema.safeParse(sanitizedData);

      if (!parseResult.success) {
        const errors = parseResult.error.errors.reduce((acc, error) => {
          const path = error.path.join('.');
          acc[path] = error.message;
          return acc;
        }, {} as Record<string, string>);

        setSubmissionErrors(errors);
        
        if (options.onError) {
          options.onError(errors);
        }
        
        toast.error('Please fix the form errors before submitting');
        setIsSubmitting(false);
        return null;
      }

      // Prepare the submission data
      const submissionData: Omit<FormData, 'id'> = {
        categoryId: options.categoryId,
        schoolId: options.schoolId,
        data: sanitizedData,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Add user information if available
      if (user) {
        submissionData.createdBy = user.id;
      }

      // Submit the form
      const response = await api.formData.submit(submissionData);

      if (response) {
        toast.success('Form submitted successfully');
        
        if (options.onSuccess) {
          options.onSuccess(response);
        }
        
        setIsSubmitting(false);
        return response;
      } else {
        throw new Error('Failed to submit form: No response received');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred during form submission';
      
      toast.error(errorMessage);
      
      setSubmissionErrors({
        form: errorMessage
      });
      
      if (options.onError) {
        options.onError({ form: errorMessage });
      }
      
      setIsSubmitting(false);
      return null;
    }
  }, [user]);

  return {
    isSubmitting,
    submissionErrors,
    validateAndSubmitForm
  };
}

export default useValidatedFormSubmission;
