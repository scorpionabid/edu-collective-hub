
import { useState, useCallback } from 'react';
import { z } from 'zod';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import * as sanitize from '@/lib/validation/sanitization';

interface FormSubmissionOptions {
  categoryId: string;
  schoolId?: string;
  id?: string;
  isUpdate?: boolean;
}

export const useValidatedFormSubmission = () => {
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper to sanitize form data before submission
  const sanitizeFormData = <T extends Record<string, any>>(data: T): T => {
    const sanitizedData = { ...data };
    
    // Create a safe copy to avoid mutation issues
    const copyOfData = { ...data };
    
    // Apply sanitization to each field
    Object.keys(copyOfData).forEach(key => {
      const value = copyOfData[key];
      
      if (typeof value === 'string') {
        // Use our sanitize text function
        sanitizedData[key] = sanitize.sanitizeText(value) as any;
      }
    });
    
    return sanitizedData;
  };

  // Submit form data after validation
  const submitFormData = async <T extends Record<string, any>>(
    data: T,
    schema: z.ZodType<any, z.ZodTypeDef, any>,
    options: FormSubmissionOptions
  ) => {
    try {
      setIsSubmitting(true);
      setError('');
      
      // Validate form data with Zod schema
      const validateResult = schema.safeParse(data);
      
      if (!validateResult.success) {
        const formattedErrors = validateResult.error.format();
        const firstError = validateResult.error.errors[0]?.message || 'Validation failed';
        setError(firstError);
        toast.error(firstError);
        return { success: false, errors: formattedErrors };
      }
      
      // Sanitize form data
      const sanitizedData = sanitizeFormData(data);
      
      // Prepare form data object
      const formDataToSubmit = {
        categoryId: options.categoryId,
        schoolId: options.schoolId || '',
        data: sanitizedData,
        status: 'pending'
      };
      
      // Update or create based on isUpdate flag
      if (options.isUpdate && options.id) {
        const result = await api.formData.updateFormData(options.id, formDataToSubmit);
        toast.success('Form data updated successfully');
        return { success: true, result };
      } else {
        const result = await api.formData.createFormData(formDataToSubmit);
        toast.success('Form data submitted successfully');
        return { success: true, result };
      }
    } catch (err) {
      console.error('Error submitting form data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearError = useCallback(() => {
    setError('');
  }, []);

  return {
    submitFormData,
    error,
    isSubmitting,
    clearError
  };
};
