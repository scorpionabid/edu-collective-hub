
import { useState, useEffect, useCallback } from 'react';
import { formData } from '@/lib/api';
import { FormData } from '@/lib/api/types';

export const useFormData = () => {
  const [data, setData] = useState<FormData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch all form data for the user
  const fetchFormData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await formData.getAllFormData();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      console.error('Error fetching form data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Submit new form data
  const submitFormData = async (formDataToSubmit: Omit<FormData, 'id'>) => {
    setLoading(true);
    setError(null);
    try {
      const result = await formData.createFormData(formDataToSubmit);
      setData(prevData => [...prevData, result]);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      console.error('Error submitting form data:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fetch form data on component mount
  useEffect(() => {
    fetchFormData();
  }, [fetchFormData]);

  return {
    formData: data,
    loading,
    error,
    fetchFormData,
    submitFormData
  };
};
