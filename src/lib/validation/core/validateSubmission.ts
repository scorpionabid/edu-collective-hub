
import { z } from 'zod';
import { toast } from 'sonner';

/**
 * Validates form data against a Zod schema
 * @param formData The data to be validated
 * @param schema The zod schema for validation
 * @returns Object with validation result and any errors
 */
export function validateFormData<T>(
  formData: T,
  schema: z.ZodType<any>
): { success: boolean; validatedData?: any; error?: z.ZodError } {
  try {
    // Validate the form data against the schema
    const validatedData = schema.parse(formData);
    return { success: true, validatedData };
  } catch (validationError) {
    if (validationError instanceof z.ZodError) {
      return { success: false, error: validationError };
    }
    
    // For any unexpected errors
    return { 
      success: false, 
      error: new z.ZodError([{ 
        code: z.ZodIssueCode.custom, 
        path: [], 
        message: 'An unexpected validation error occurred' 
      }]) 
    };
  }
}

/**
 * Formats Zod validation errors into user-friendly messages
 * @param error The ZodError object
 * @returns Formatted error messages
 */
export function formatValidationErrors(error: z.ZodError): string {
  return error.errors.map(err => 
    `${err.path.join('.')} - ${err.message}`
  ).join(', ');
}

/**
 * Displays validation errors as toast notifications
 * @param error The ZodError object to display
 */
export function displayValidationErrors(error: z.ZodError): void {
  const formattedErrors = formatValidationErrors(error);
  toast.error(`Validation error: ${formattedErrors}`);
}
