
import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { sanitizationService } from '@/lib/validation/sanitization';
import { validationService } from '@/lib/validation/validationService';
import { errorTracker, ErrorCategory, ErrorSeverity } from '@/lib/validation/errorTracker';
import * as z from 'zod';
import { api } from '@/lib/api';

export type SubmissionOptions = {
  sanitize?: boolean;
  trackErrors?: boolean;
  showToast?: boolean;
  componentName?: string;
};

export function useValidatedFormSubmission<T extends Record<string, any>>(
  categoryId: string,
  options: SubmissionOptions = {}
) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const submitForm = async (formData: T): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get the validation schema for this category
      const validationPromise = api.categories.getValidationSchema(categoryId);
      
      // Sanitize data if enabled
      const sanitizedData = options.sanitize
        ? sanitizationService.sanitizeObject(formData)
        : formData;
      
      // Load and validate with schema
      const schema = await validationPromise;
      const validationResult = validationService.validate(schema, sanitizedData, {
        showToast: options.showToast,
      });
      
      if (!validationResult.success) {
        // Handle validation errors
        const firstError = validationResult.errors?.[0];
        const errorMessage = firstError?.message || 'Validation failed';
        
        setError(errorMessage);
        
        if (options.showToast) {
          toast.error(errorMessage);
        }
        
        if (options.trackErrors && validationResult.errors) {
          // Track each validation error
          validationResult.errors.forEach((err) => {
            const fieldName = err.path.join('.') || 'unknown';
            errorTracker.logValidationError({
              userId: user?.id,
              componentName: options.componentName || 'unknown',
              fieldName,
              errorMessage: err.message,
              inputValue: sanitizedData[fieldName],
            });
          });
        }
        
        return false;
      }
      
      // Submit the validated data
      const result = await api.formData.create({
        categoryId,
        schoolId: user?.profile?.schoolId || '',
        data: validationResult.data,
        status: 'draft',
      });
      
      if (options.showToast) {
        toast.success('Form data submitted successfully');
      }
      
      return true;
    } catch (error) {
      console.error('Form submission error:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An error occurred during form submission';
      
      setError(errorMessage);
      
      if (options.showToast) {
        toast.error(errorMessage);
      }
      
      if (options.trackErrors) {
        errorTracker.logError(
          errorMessage,
          ErrorCategory.FORM_SUBMISSION,
          ErrorSeverity.ERROR,
          {
            categoryId,
            component: options.componentName || 'unknown',
            userId: user?.id,
          }
        );
      }
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    submitForm,
    isLoading,
    error,
    clearError: () => setError(null),
  };
}
