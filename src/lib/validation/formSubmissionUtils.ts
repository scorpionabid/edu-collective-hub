
import { z } from 'zod';
import { toast } from 'sonner';
import { 
  validateFormData, 
  displayValidationErrors 
} from './core/validateSubmission';
import { 
  submitToSupabase, 
  updateSupabaseRecord 
} from './core/formSubmission';
import { getReadableErrorMessage } from './utils/errorFormatter';
export { useFormSubmissionStatus } from './hooks/useFormStatus';

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
  // Validate the form data
  const validationResult = validateFormData(formData, schema);
  
  if (!validationResult.success) {
    if (validationResult.error instanceof z.ZodError) {
      if (options.showToast !== false) {
        displayValidationErrors(validationResult.error);
      }
      
      if (options.onError) {
        options.onError(validationResult.error);
      }
    } else {
      if (options.showToast !== false) {
        toast.error('An unexpected error occurred during validation');
      }
      
      if (options.onError) {
        options.onError(validationResult.error);
      }
    }
    
    return { success: false, error: validationResult.error };
  }
  
  // Add timestamps and track submission status
  const dataToSubmit = {
    ...validationResult.validatedData,
    updated_at: new Date().toISOString(),
    status: validationResult.validatedData.status || 'draft',
    ...(validationResult.validatedData.status === 'submitted' && { submitted_at: new Date().toISOString() })
  };
  
  // Submit to Supabase
  const submissionResult = await submitToSupabase(tableName, dataToSubmit);
  
  if (!submissionResult.success) {
    if (options.showToast !== false) {
      toast.error(`Failed to submit form: ${getReadableErrorMessage(submissionResult.error)}`);
    }
    
    if (options.onError) {
      options.onError(submissionResult.error);
    }
    
    return { success: false, error: submissionResult.error };
  }
  
  // Handle successful submission
  if (options.showToast !== false) {
    toast.success('Form submitted successfully');
  }
  
  if (options.onSuccess) {
    options.onSuccess(submissionResult.data);
  }
  
  return { success: true, data: submissionResult.data };
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
    
    // Update in Supabase
    const updateResult = await updateSupabaseRecord(tableName, id, updateData);
    
    if (!updateResult.success) {
      if (options.showToast !== false) {
        toast.error(`Failed to update form: ${getReadableErrorMessage(updateResult.error)}`);
      }
      
      if (options.onError) {
        options.onError(updateResult.error);
      }
      
      return { success: false, error: updateResult.error };
    }
    
    // Handle successful update
    if (options.showToast !== false) {
      toast.success('Form updated successfully');
    }
    
    if (options.onSuccess) {
      options.onSuccess(updateResult.data);
    }
    
    return { success: true, data: updateResult.data };
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
