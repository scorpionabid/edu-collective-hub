
import { useState, useCallback, useMemo } from 'react';
import * as z from 'zod';
import { toast } from 'sonner';
import { validationService } from '@/lib/validation/validationService';
import { sanitizationService } from '@/lib/validation/sanitization';
import { errorTracker } from '@/lib/validation/errorTracker';
import { useAuth } from '@/hooks/useAuth';

export type ValidationState<T> = {
  isValid: boolean;
  errors: Record<string, string>;
  dirtyFields: Set<string>;
  submitCount: number;
  isSubmitting: boolean;
  data: Partial<T>;
};

export type ValidationOptions = {
  showToast?: boolean;
  sanitize?: boolean;
  trackErrors?: boolean;
  componentName?: string;
};

export function useFormValidation<T extends Record<string, any>>(
  schema: z.ZodType<T>,
  initialData: Partial<T> = {},
  options: ValidationOptions = {}
) {
  const { user } = useAuth();
  const [state, setState] = useState<ValidationState<T>>({
    isValid: false,
    errors: {},
    dirtyFields: new Set<string>(),
    submitCount: 0,
    isSubmitting: false,
    data: initialData,
  });
  
  // Memoize the schema to prevent unnecessary rerenders
  const validationSchema = useMemo(() => schema, [schema]);
  
  // Validate a single field
  const validateField = useCallback(
    (name: string, value: any): string | null => {
      try {
        // Create a sub-schema for just this field
        const fieldSchema = z.object({ [name]: validationSchema.shape[name] });
        const result = validationService.validate(fieldSchema, { [name]: value });
        
        if (!result.success && result.formattedErrors && result.formattedErrors[name]) {
          if (options.trackErrors) {
            // Track the validation error
            errorTracker.logValidationError({
              userId: user?.id,
              componentName: options.componentName || 'unknown',
              fieldName: name,
              errorMessage: result.formattedErrors[name],
              inputValue: value,
            });
          }
          
          return result.formattedErrors[name];
        }
        
        return null;
      } catch (error) {
        console.error(`Validation error for field ${name}:`, error);
        return 'Validation failed';
      }
    },
    [validationSchema, options.trackErrors, options.componentName, user?.id]
  );
  
  // Set a field value and validate it
  const setFieldValue = useCallback(
    (name: string, value: any, validateImmediately: boolean = true) => {
      // Sanitize the value if enabled
      const sanitizedValue = options.sanitize
        ? sanitizationService.sanitizeValue(value)
        : value;
      
      setState((prev) => {
        const newData = { ...prev.data, [name]: sanitizedValue };
        const newDirtyFields = new Set(prev.dirtyFields).add(name);
        
        // Validate the field if needed
        let fieldError: string | null = null;
        if (validateImmediately) {
          fieldError = validateField(name, sanitizedValue);
        }
        
        // Update errors
        const newErrors = { ...prev.errors };
        if (fieldError) {
          newErrors[name] = fieldError;
        } else {
          delete newErrors[name];
        }
        
        return {
          ...prev,
          data: newData,
          dirtyFields: newDirtyFields,
          errors: newErrors,
          isValid: Object.keys(newErrors).length === 0,
        };
      });
    },
    [validateField, options.sanitize]
  );
  
  // Validate all fields in the form
  const validateForm = useCallback((): boolean => {
    const result = validationService.validate(validationSchema, state.data, {
      showToast: options.showToast,
    });
    
    if (!result.success && result.formattedErrors) {
      setState((prev) => ({
        ...prev,
        errors: result.formattedErrors || {},
        isValid: false,
      }));
      
      if (options.trackErrors && result.errors) {
        // Track each validation error
        result.errors.forEach((error) => {
          const fieldName = error.path.join('.') || 'unknown';
          errorTracker.logValidationError({
            userId: user?.id,
            componentName: options.componentName || 'unknown',
            fieldName,
            errorMessage: error.message,
            inputValue: state.data[fieldName],
          });
        });
      }
      
      return false;
    }
    
    setState((prev) => ({
      ...prev,
      errors: {},
      isValid: true,
    }));
    
    return true;
  }, [validationSchema, state.data, options.showToast, options.trackErrors, options.componentName, user?.id]);
  
  // Reset the form
  const resetForm = useCallback(
    (newData: Partial<T> = {}) => {
      setState({
        isValid: false,
        errors: {},
        dirtyFields: new Set<string>(),
        submitCount: 0,
        isSubmitting: false,
        data: newData,
      });
    },
    []
  );
  
  // Submit the form
  const submitForm = useCallback(
    async (onSubmit: (data: T) => Promise<void> | void) => {
      setState((prev) => ({
        ...prev,
        isSubmitting: true,
        submitCount: prev.submitCount + 1,
      }));
      
      const isValid = validateForm();
      
      if (!isValid) {
        setState((prev) => ({
          ...prev,
          isSubmitting: false,
        }));
        
        if (options.showToast) {
          toast.error('Zəhmət olmasa bütün sahələri düzgün doldurun.');
        }
        
        return;
      }
      
      try {
        // Sanitize all data before submission if enabled
        const submissionData = options.sanitize
          ? sanitizationService.sanitizeObject(state.data as T)
          : (state.data as T);
        
        await onSubmit(submissionData as T);
      } catch (error) {
        console.error('Form submission error:', error);
        
        if (options.showToast) {
          toast.error('Form göndərilməsi zamanı xəta baş verdi.');
        }
        
        if (options.trackErrors) {
          errorTracker.logValidationError({
            userId: user?.id,
            componentName: options.componentName || 'unknown',
            fieldName: '_form',
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      } finally {
        setState((prev) => ({
          ...prev,
          isSubmitting: false,
        }));
      }
    },
    [validateForm, state.data, options.showToast, options.sanitize, options.trackErrors, options.componentName, user?.id]
  );
  
  // Form context helpers
  const formContext = useMemo(
    () => ({
      register: (name: string) => ({
        name,
        id: name,
        value: state.data[name] || '',
        onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
          setFieldValue(name, e.target.value);
        },
        onBlur: () => {
          if (state.dirtyFields.has(name)) {
            validateField(name, state.data[name]);
          }
        },
      }),
      setValue: setFieldValue,
      getFieldProps: (name: string) => ({
        name,
        id: name,
        value: state.data[name] || '',
        onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
          setFieldValue(name, e.target.value);
        },
        onBlur: () => {
          if (state.dirtyFields.has(name)) {
            validateField(name, state.data[name]);
          }
        },
        error: state.errors[name],
        touched: state.dirtyFields.has(name),
      }),
    }),
    [state, setFieldValue, validateField]
  );
  
  return {
    ...state,
    setFieldValue,
    validateField,
    validateForm,
    resetForm,
    submitForm,
    formContext,
  };
}
