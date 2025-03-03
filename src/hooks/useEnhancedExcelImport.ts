
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ImportJob } from '@/lib/api/types';
import { useAuth } from '@/hooks/useAuth';
import { getMockSupabase } from '@/lib/api/mock/importExportTables';

// Create a mock instance to handle import_jobs table
const mockSupabase = getMockSupabase();

export const useEnhancedExcelImport = (tableName: string) => {
  const [importJobs, setImportJobs] = useState<ImportJob[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const { user } = useAuth();

  // Fetch all import jobs for the current user and table
  const fetchImportJobs = useCallback(async () => {
    try {
      setIsLoading(true);
      // Use the mock implementation instead of direct Supabase call
      const result = await mockSupabase.rpc('get_import_jobs', { 
        p_table_name: tableName,
        p_user_id: user?.id 
      });
      
      if (result.error) throw result.error;
      
      // Convert to ImportJob[] type
      const jobs = result.data as unknown as ImportJob[];
      setImportJobs(jobs);
      return jobs;
    } catch (error: any) {
      console.error('Error fetching import jobs:', error);
      toast.error(error.message || 'Failed to fetch import jobs');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [tableName, user?.id]);

  // Get a specific import job by ID
  const getImportJob = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      const result = await mockSupabase.from('import_jobs').select().eq('id', id).single();
      
      if (result.error) throw result.error;
      
      // Convert to ImportJob type
      return result.data as unknown as ImportJob;
    } catch (error: any) {
      console.error('Error fetching import job:', error);
      toast.error(error.message || 'Failed to fetch import job');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Start polling for job status updates
  const startPolling = useCallback((id: string, onUpdate: (job: ImportJob) => void) => {
    if (isPolling) return;
    
    setIsPolling(true);
    const interval = setInterval(async () => {
      const job = await getImportJob(id);
      
      if (job) {
        onUpdate(job);
        
        if (job.status === 'completed' || job.status === 'failed') {
          clearInterval(interval);
          setIsPolling(false);
        }
      }
    }, 2000);
    
    return () => {
      clearInterval(interval);
      setIsPolling(false);
    };
  }, [getImportJob, isPolling]);

  // Upload an excel file and start the import process
  const uploadExcelFile = useCallback(async (file: File, options?: { onProgress?: (progress: number) => void }) => {
    if (!user) {
      toast.error('You must be logged in to upload files');
      return null;
    }
    
    try {
      setIsLoading(true);
      
      // 1. Create an import job record
      const importJob = await mockSupabase.from('import_jobs').insert({
        user_id: user.id,
        table_name: tableName,
        file_name: file.name,
        file_size: file.size,
        total_rows: 0,
        processed_rows: 0,
        status: 'pending',
        progress: 0,
        started_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      });
      
      if (importJob.error) throw importJob.error;
      
      // Convert to ImportJob type
      const job = importJob.data as unknown as ImportJob;
      
      // In a real implementation, we would upload the file to storage
      // and trigger a serverless function to process it
      // For this mock, we'll simulate progress
      
      setTimeout(() => {
        // Simulate processing
        mockSupabase.from('import_jobs').update({
          id: job.id,
          status: 'processing',
          total_rows: 100,
          progress: 10
        });
        
        // Simulate completion after a delay
        setTimeout(() => {
          mockSupabase.from('import_jobs').update({
            id: job.id,
            status: 'completed',
            processed_rows: 100,
            progress: 100,
            completed_at: new Date().toISOString()
          });
        }, 5000);
      }, 2000);
      
      return job;
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast.error(error.message || 'Failed to upload file');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [tableName, user]);

  return {
    importJobs,
    isLoading,
    isPolling,
    fetchImportJobs,
    getImportJob,
    uploadExcelFile,
    startPolling
  };
};
