
import { useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { FormData, PaginatedResponse } from '@/lib/api/types';
import { toast } from 'sonner';

export const useFormData = (categoryId?: string, schoolId?: string) => {
  const [formData, setFormData] = useState<FormData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchFormData = useCallback(async () => {
    if (!categoryId || !schoolId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.formData.getForSchool(schoolId, categoryId);
      // Need to properly extract data array from PaginatedResponse
      if (response && Array.isArray(response.data)) {
        setFormData(response.data);
      } else {
        console.error('Unexpected response format:', response);
        setFormData([]);
      }
    } catch (err) {
      console.error('Error fetching form data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch form data'));
      toast.error('Failed to fetch form data');
    } finally {
      setLoading(false);
    }
  }, [categoryId, schoolId]);

  const submitFormData = useCallback(async (data: Omit<FormData, 'id'>) => {
    setLoading(true);
    setError(null);
    
    try {
      // Add createdAt and updatedAt fields for the form data
      const enhancedData: Omit<FormData, 'id'> = {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const response = await api.formData.submit(enhancedData);
      toast.success('Form data submitted successfully');
      
      // Update local state with the new form data
      if (response) {
        setFormData(prevData => [...prevData, response]);
      }
      
      return response;
    } catch (err) {
      console.error('Error submitting form data:', err);
      setError(err instanceof Error ? err : new Error('Failed to submit form data'));
      toast.error('Failed to submit form data');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    formData,
    loading,
    error,
    fetchFormData,
    submitFormData
  };
};

export default useFormData;
