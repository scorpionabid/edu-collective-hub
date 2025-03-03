
import { useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { sanitization } from '@/lib/validation/sanitization';
import { FormData } from '@/lib/api/types';
import { toast } from 'sonner';

export const useValidatedFormSubmission = (categoryId: string) => {
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Array<{ field: string; message: string }>>([]);
  
  const submitForm = useCallback(async (
    formValues: Record<string, any>,
    schoolId: string,
    mode: 'draft' | 'submit' = 'submit',
    existingFormId?: string
  ) => {
    setSubmitting(true);
    setFormErrors([]);
    
    try {
      // First, sanitize all text inputs to prevent XSS
      const sanitizedValues = { ...formValues };
      
      for (const [key, value] of Object.entries(formValues)) {
        if (typeof value === 'string') {
          // Use sanitizeText instead of sanitize
          sanitizedValues[key] = sanitization.sanitizeText(value);
        }
      }
      
      // Prepare form data object
      const formData: Omit<FormData, 'id'> = {
        categoryId,
        schoolId,
        data: sanitizedValues,
        status: mode === 'submit' ? 'submitted' : 'draft',
        submittedAt: mode === 'submit' ? new Date().toISOString() : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      let result;
      
      if (existingFormId) {
        // Use updateFormData instead of submit
        result = await api.formData.updateFormData(existingFormId, formData);
      } else {
        // Use createFormData for new forms
        result = await api.formData.createFormData(formData);
      }
      
      if (result.success) {
        toast.success(
          mode === 'submit'
            ? 'Form submitted successfully!'
            : 'Form saved as draft.'
        );
        return result.data;
      } else {
        toast.error(result.error || 'Failed to save form data.');
        return null;
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('An error occurred while submitting the form.');
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [categoryId]);
  
  return {
    submitForm,
    submitting,
    formErrors,
    setFormErrors
  };
};
