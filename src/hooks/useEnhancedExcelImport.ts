
import { useState } from 'react';
import { useProfile } from './useProfile';
import { ImportJob } from '@/lib/api/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getMockSupabase } from '@/lib/api/mock/importExportTables';

// Use the getMockSupabase helper to get a properly typed mock implementation
const mockSupabase = getMockSupabase();

export const useEnhancedExcelImport = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [importJobs, setImportJobs] = useState<ImportJob[]>([]);
  const { profile } = useProfile();

  const fetchImportJobs = async (userId: string) => {
    try {
      setIsLoading(true);
      
      // Fetch import jobs from the mock implementation
      const { data, error } = await mockSupabase
        .from('import_jobs')
        .select()
        .eq('userId', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const formattedJobs = data as ImportJob[];
      setImportJobs(formattedJobs);
      
      return formattedJobs;
    } catch (error) {
      console.error('Error fetching import jobs:', error);
      toast.error('Failed to load import jobs');
      return [];
    } finally {
      setIsLoading(false);
    }
  };
  
  const createImportJob = async (data: Partial<ImportJob>) => {
    try {
      setIsLoading(true);
      
      // Create a new import job using the mock implementation
      const { data: job, error } = await mockSupabase
        .from('import_jobs')
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      
      toast.success('Import job created');
      return job as ImportJob;
    } catch (error) {
      console.error('Error creating import job:', error);
      toast.error('Failed to create import job');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateImportJobStatus = async (
    id: string, 
    status: 'pending' | 'processing' | 'completed' | 'failed', 
    progress: number
  ) => {
    try {
      // Update the import job status using the mock implementation
      const { data, error } = await mockSupabase
        .from('import_jobs')
        .update({ 
          status, 
          progress 
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return data as ImportJob;
    } catch (error) {
      console.error('Error updating import job status:', error);
      return null;
    }
  };
  
  // Enhanced Excel file processing with error handling and progress tracking
  const processExcelFile = async (file: File, tableName: string) => {
    try {
      setIsLoading(true);
      
      // Create an import job to track progress
      const importJob = await createImportJob({
        userId: profile?.id || '',
        tableName,
        status: 'pending',
        progress: 0,
        total_rows: 0, // Will be updated once we read the file
        processed_rows: 0,
        failed_rows: 0,
        file_name: file.name,
        file_size: file.size,
        start_time: new Date().toISOString()
      });
      
      if (!importJob) {
        throw new Error('Failed to create import job');
      }
      
      // Update job to processing state
      await updateImportJobStatus(importJob.id, 'processing', 10);
      
      // Read the file (simulated)
      toast.info('Reading file...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update progress
      await updateImportJobStatus(importJob.id, 'processing', 30);
      
      // Process rows (simulated)
      toast.info('Processing data...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update progress
      await updateImportJobStatus(importJob.id, 'processing', 70);
      
      // Save to database (simulated)
      toast.info('Saving to database...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Complete the job
      await updateImportJobStatus(importJob.id, 'completed', 100);
      
      toast.success('File successfully imported!');
      return importJob;
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error('Failed to process file');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    isLoading,
    importJobs,
    fetchImportJobs,
    createImportJob,
    updateImportJobStatus,
    processExcelFile
  };
};
