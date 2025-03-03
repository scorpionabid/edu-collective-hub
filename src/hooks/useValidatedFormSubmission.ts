
import { useState } from 'react';
import { api } from '@/lib/api';
import { z } from 'zod';
import { FormData } from '@/lib/api/types';

interface SubmissionOptions {
  categoryId: string;
  schoolId: string;
  id?: string;
  isUpdate?: boolean;
}

interface SubmissionResult {
  success: boolean;
  message?: string;
  data?: FormData;
}

export const useValidatedFormSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const submitFormData = async <T extends Record<string, any>>(
    formData: T, 
    options: SubmissionOptions
  ): Promise<SubmissionResult | undefined> => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Submit the data to the API
      let result;

      if (options.isUpdate && options.id) {
        // Update existing data
        result = await api.formData.updateFormData(options.id, {
          data: formData,
          status: 'submitted'
        });

        if (!result) {
          throw new Error('Failed to update form data');
        }

        setIsSubmitting(false);
        return {
          success: true,
          message: 'Form data updated successfully',
          data: result
        };
      } else {
        // Create new data
        result = await api.formData.createFormData({
          categoryId: options.categoryId,
          schoolId: options.schoolId,
          data: formData,
          status: 'submitted',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });

        if (!result) {
          throw new Error('Failed to submit form data');
        }

        setIsSubmitting(false);
        return {
          success: true,
          message: 'Form data submitted successfully',
          data: result
        };
      }
    } catch (error: any) {
      setIsSubmitting(false);
      const errorMessage = error.message || 'An unknown error occurred';
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    }
  };

  return {
    submitFormData,
    isSubmitting,
    error,
    clearError
  };
};
