
/**
 * Convert database error messages to user-friendly text
 * @param error The error object from Supabase
 * @returns A user-friendly error message
 */
export function getReadableErrorMessage(error: any): string {
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
