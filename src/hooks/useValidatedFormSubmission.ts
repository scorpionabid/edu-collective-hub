
import { useState } from 'react';
import { ZodType } from 'zod';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { FormData } from '@/lib/api/types';

interface SubmitOptions {
  categoryId: string;
  schoolId?: string;
  id?: string;
  isUpdate?: boolean;
}

export const useValidatedFormSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const clearError = () => {
    setError('');
  };

  const submitFormData = async <T extends Record<string, any>>(
    data: T,
    schema: ZodType<any>,
    options: SubmitOptions
  ): Promise<{ success: boolean; data?: FormData } | undefined> => {
    setIsSubmitting(true);
    clearError();

    try {
      // Validate data with schema
      const validationResult = schema.safeParse(data);
      
      if (!validationResult.success) {
        const errorMessage = "Form validation failed";
        setError(errorMessage);
        toast.error(errorMessage);
        return { success: false };
      }

      let result: FormData;

      // If id is provided, update existing form data
      if (options.isUpdate && options.id) {
        result = await api.formData.updateFormData(options.id, {
          data: data as Record<string, any>,
          status: 'submitted'
        });
        toast.success('Form updated successfully');
      } else {
        // Create new form data
        // Add required fields to match FormData type
        const formDataToSubmit: Partial<FormData> = {
          categoryId: options.categoryId,
          schoolId: options.schoolId || '',
          data: data as Record<string, any>,
          status: 'submitted',
        };
        
        result = await api.formData.createFormData(formDataToSubmit as Omit<FormData, "id">);
        toast.success('Form submitted successfully');
      }

      return { success: true, data: result };
    } catch (error) {
      console.error('Error submitting form data:', error);
      let errorMessage = 'Failed to submit form';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitFormData,
    isSubmitting,
    error,
    clearError
  };
};
