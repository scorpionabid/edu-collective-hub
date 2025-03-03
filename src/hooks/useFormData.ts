
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { FormData } from '@/lib/api/types';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export const useFormData = () => {
  const [formEntries, setFormEntries] = useState<FormData[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchFormEntries = async () => {
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
  };

  const submitFormEntry = async (id: string) => {
    try {
      const result = await api.formData.submit(id);
      if (result) {
        toast.success('Form submitted successfully');
        await fetchFormEntries();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to submit form');
    }
  };

  const approveFormEntry = async (id: string) => {
    if (!user) return;
    
    try {
      const result = await api.formData.approve(id, user.id);
      if (result) {
        toast.success('Form approved successfully');
        await fetchFormEntries();
      }
    } catch (error) {
      console.error('Error approving form:', error);
      toast.error('Failed to approve form');
    }
  };

  const rejectFormEntry = async (id: string, reason: string) => {
    try {
      const result = await api.formData.reject(id, reason);
      if (result) {
        toast.success('Form rejected');
        await fetchFormEntries();
      }
    } catch (error) {
      console.error('Error rejecting form:', error);
      toast.error('Failed to reject form');
    }
  };

  useEffect(() => {
    fetchFormEntries();
  }, []);

  return {
    formEntries,
    loading,
    fetchFormEntries,
    submitFormEntry,
    approveFormEntry,
    rejectFormEntry
  };
};
