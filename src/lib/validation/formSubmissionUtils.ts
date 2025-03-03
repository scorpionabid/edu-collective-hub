
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useState } from 'react';

interface SubmissionOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  showToast?: boolean;
  redirectTo?: string;
}

/**
 * Validates and submits form data to Supabase with enhanced error handling
 * @param formData The data to be submitted
 * @param schema The zod schema for validation
 * @param tableName The Supabase table to insert into
 * @param options Additional options for handling success/error
 */
export async function validateAndSubmitForm<T>(
  formData: T,
  schema: z.ZodType<any>,
  tableName: string,
  options: SubmissionOptions = {}
): Promise<{ success: boolean; data?: any; error?: any }> {
  try {
    // Validate the form data against the schema
    const validatedData = schema.parse(formData);
    
    // Add timestamps and track submission status
    const dataToSubmit = {
      ...validatedData,
      updated_at: new Date().toISOString(),
      status: validatedData.status || 'draft',
      ...(validatedData.status === 'submitted' && { submitted_at: new Date().toISOString() })
    };
    
    // Submit to Supabase with proper error handling
    // Use a dynamic approach that will work with any table
    const { data, error } = await supabase
      .from(tableName as any)
      .insert(dataToSubmit)
      .select()
      .single();
    
    if (error) {
      // Log detailed error information
      console.error(`Form submission error (${tableName}):`, error);
      
      // Show user-friendly error message
      if (options.showToast !== false) {
        toast.error(`Failed to submit form: ${getReadableErrorMessage(error)}`);
      }
      
      if (options.onError) {
        options.onError(error);
      }
      
      return { success: false, error };
    }
    
    // Handle successful submission
    if (options.showToast !== false) {
      toast.success('Form submitted successfully');
    }
    
    if (options.onSuccess) {
      options.onSuccess(data);
    }
    
    return { success: true, data };
  } catch (validationError) {
    // Handle zod validation errors
    console.error('Form validation error:', validationError);
    
    if (validationError instanceof z.ZodError) {
      const formattedErrors = validationError.errors.map(err => 
        `${err.path.join('.')} - ${err.message}`
      ).join(', ');
      
      if (options.showToast !== false) {
        toast.error(`Validation error: ${formattedErrors}`);
      }
      
      if (options.onError) {
        options.onError(validationError);
      }
    } else {
      if (options.showToast !== false) {
        toast.error('An unexpected error occurred during validation');
      }
      
      if (options.onError) {
        options.onError(validationError);
      }
    }
    
    return { success: false, error: validationError };
  }
}

/**
 * Updates an existing form submission with proper status tracking
 */
export async function updateFormSubmission<T>(
  id: string,
  formData: Partial<T>,
  tableName: string,
  options: SubmissionOptions = {}
): Promise<{ success: boolean; data?: any; error?: any }> {
  try {
    // Check if status is being updated to 'submitted'
    const isSubmitting = (formData as any)?.status === 'submitted';
    
    // Prepare the update data
    const updateData = {
      ...formData,
      updated_at: new Date().toISOString(),
      ...(isSubmitting && { submitted_at: new Date().toISOString() })
    };
    
    // Submit to Supabase with proper error handling
    // Use a dynamic approach that will work with any table
    const { data, error } = await supabase
      .from(tableName as any)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error(`Form update error (${tableName}):`, error);
      
      if (options.showToast !== false) {
        toast.error(`Failed to update form: ${getReadableErrorMessage(error)}`);
      }
      
      if (options.onError) {
        options.onError(error);
      }
      
      return { success: false, error };
    }
    
    // Handle successful update
    if (options.showToast !== false) {
      toast.success('Form updated successfully');
    }
    
    if (options.onSuccess) {
      options.onSuccess(data);
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Form update error:', error);
    
    if (options.showToast !== false) {
      toast.error('An unexpected error occurred while updating the form');
    }
    
    if (options.onError) {
      options.onError(error);
    }
    
    return { success: false, error };
  }
}

/**
 * Convert database error messages to user-friendly text
 */
function getReadableErrorMessage(error: any): string {
  if (!error) return 'Unknown error';
  
  // Handle common Supabase/PostgreSQL errors
  if (error.code === '23505') {
    return 'This record already exists';
  }
  
  if (error.code === '23503') {
    return 'Referenced record does not exist';
  }
  
  if (error.code === '42P01') {
    return 'Database configuration error';
  }
  
  if (error.code === '42703') {
    return 'Invalid form field';
  }
  
  // Default to the provided message or a generic one
  return error.message || 'An unexpected error occurred';
}

// Create a hook for tracking form submission status
export function useFormSubmissionStatus() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<any>(null);
  
  const reset = () => {
    setIsSubmitting(false);
    setIsSuccess(false);
    setError(null);
  };
  
  return {
    isSubmitting,
    setIsSubmitting,
    isSuccess,
    setIsSuccess,
    error,
    setError,
    reset
  };
}
