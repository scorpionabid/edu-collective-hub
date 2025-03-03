
import { useState, useEffect, useCallback } from 'react';
import { FormData } from '@/lib/api/types';
import { api } from '@/lib/api';

export const useFormData = (options = {}) => {
  const [formData, setFormData] = useState<FormData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch form data
  const fetchFormData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Use the new api method structure
      const response = await api.formData.getFormData();
      setFormData(response.data);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching form data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFormData();
  }, [fetchFormData]);

  // Submit form data
  const submitFormData = useCallback(async (data: Omit<FormData, 'id'>) => {
    setLoading(true);
    try {
      // Use the renamed method
      const result = await api.formData.createFormData(data);
      await fetchFormData(); // Refresh data
      return result;
    } catch (err) {
      console.error('Error submitting form data:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchFormData]);

  return {
    formData,
    loading,
    error,
    fetchFormData,
    submitFormData
  };
};
