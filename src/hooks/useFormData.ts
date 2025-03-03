
import { useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { FormData, PaginatedResponse } from '@/lib/api/types';

export function useFormData() {
  const [formData, setFormData] = useState<FormData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchFormData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.formData.getAll();
      if (response && response.data) {
        setFormData(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch form data'));
    } finally {
      setLoading(false);
    }
  }, []);

  const submitFormData = useCallback(async (data: Omit<FormData, 'id'>) => {
    try {
      setLoading(true);
      setError(null);

      // Add createdAt and updatedAt fields if they're missing
      const formDataWithTimestamps: Omit<FormData, 'id'> = {
        ...data,
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString()
      };

      const result = await api.formData.create(formDataWithTimestamps);
      await fetchFormData();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to submit form data'));
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
}
