
import { useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { FormData } from '@/lib/api/types';
import { toast } from 'sonner';

export function useFormData() {
  const [formEntries, setFormEntries] = useState<FormData[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFormEntries = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.formData.getAll();
      setFormEntries(data);
    } catch (error) {
      console.error('Error fetching form entries:', error);
      toast.error('Failed to load form entries');
    } finally {
      setLoading(false);
    }
  }, []);

  const submitFormEntry = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await api.formData.submit(id);
      toast.success('Form submitted successfully');
      fetchFormEntries();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to submit form');
    } finally {
      setLoading(false);
    }
  }, [fetchFormEntries]);

  const approveFormEntry = useCallback(async (id: string) => {
    try {
      setLoading(true);
      // Use the current user's ID for approval
      const userId = "current-user-id"; // This should be fetched from auth context
      await api.formData.approve(id, userId);
      toast.success('Form approved successfully');
      fetchFormEntries();
    } catch (error) {
      console.error('Error approving form:', error);
      toast.error('Failed to approve form');
    } finally {
      setLoading(false);
    }
  }, [fetchFormEntries]);

  const rejectFormEntry = useCallback(async (id: string, reason: string) => {
    try {
      setLoading(true);
      await api.formData.reject(id, reason);
      toast.success('Form rejected');
      fetchFormEntries();
    } catch (error) {
      console.error('Error rejecting form:', error);
      toast.error('Failed to reject form');
    } finally {
      setLoading(false);
    }
  }, [fetchFormEntries]);

  return {
    formEntries,
    loading,
    fetchFormEntries,
    submitFormEntry,
    approveFormEntry,
    rejectFormEntry
  };
}
