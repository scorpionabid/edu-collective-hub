
import { useState } from 'react';

/**
 * Hook for tracking form submission status
 * @returns Object with status state and methods to update it
 */
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
