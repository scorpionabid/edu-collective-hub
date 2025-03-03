
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ImportJob, ExportJob } from '@/lib/api/types';
import { toast } from 'sonner';
import { mockImportExportTables } from '@/lib/api/mock/importExportTables';

/**
 * Hook for enhanced Excel import operations
 */
export const useEnhancedExcelImport = () => {
  const [importJobs, setImportJobs] = useState<ImportJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Get all import jobs for the current user
  const getImportJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Use our mock implementation since the table doesn't exist yet
      const response = await mockImportExportTables.getImportJobs();
      setImportJobs(response);
      
      return response;
    } catch (err) {
      console.error('Error fetching import jobs:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      toast.error('Failed to fetch import jobs');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Get a specific import job by ID
  const getImportJobById = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      // Use our mock implementation
      const response = await mockImportExportTables.getImportJobById(id);
      return response;
    } catch (err) {
      console.error(`Error fetching import job ${id}:`, err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      toast.error('Failed to fetch import job details');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new import job
  const createImportJob = useCallback(async (data: Omit<ImportJob, 'id' | 'createdAt' | 'status' | 'progress'>) => {
    try {
      setLoading(true);
      setError(null);

      // Use our mock implementation
      const response = await mockImportExportTables.createImportJob(data);
      
      // Update the local state with the new job
      setImportJobs(prev => [...prev, response]);
      
      return response;
    } catch (err) {
      console.error('Error creating import job:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      toast.error('Failed to create import job');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update an existing import job
  const updateImportJob = useCallback(async (id: string, data: Partial<ImportJob>) => {
    try {
      setLoading(true);
      setError(null);

      // Use our mock implementation
      const response = await mockImportExportTables.updateImportJob(id, data);
      
      if (response) {
        // Update the job in local state
        setImportJobs(prev => 
          prev.map(job => job.id === id ? response : job)
        );
      }
      
      return response;
    } catch (err) {
      console.error(`Error updating import job ${id}:`, err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      toast.error('Failed to update import job');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    importJobs,
    loading,
    error,
    getImportJobs,
    getImportJobById,
    createImportJob,
    updateImportJob
  };
};
