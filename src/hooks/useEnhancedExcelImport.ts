
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ImportJob, ImportError } from '@/lib/api/types';
import * as XLSX from 'xlsx';

/**
 * Enhanced hook for Excel import functionality with job tracking
 */
export const useEnhancedExcelImport = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalRows, setTotalRows] = useState(0);
  const [processedRows, setProcessedRows] = useState(0);
  const [errors, setErrors] = useState<ImportError[]>([]);
  const [importJobs, setImportJobs] = useState<ImportJob[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all import jobs for a user
  const fetchImportJobs = async (userId: string): Promise<ImportJob[]> => {
    setIsLoading(true);
    try {
      // Attempting to use mock implementation
      const { data, error } = await supabase
        .from('import_jobs')
        .select('*')
        .eq('userId', userId)
        .order('createdAt', { ascending: false });

      if (error) throw error;
      
      setImportJobs(data as ImportJob[]);
      return data as ImportJob[];
    } catch (error) {
      console.error('Error fetching import jobs:', error);
      toast.error('Failed to load import history');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new import job
  const createImportJob = async (data: Partial<ImportJob>): Promise<ImportJob> => {
    try {
      const { data: job, error } = await supabase
        .from('import_jobs')
        .insert({
          userId: data.userId,
          tableName: data.tableName,
          fileName: data.fileName,
          fileSize: data.fileSize,
          totalRows: data.totalRows,
          processedRows: 0,
          status: 'pending',
          progress: 0,
          startedAt: new Date().toISOString(),
          errors: []
        })
        .select()
        .single();

      if (error) throw error;
      
      return job as ImportJob;
    } catch (error) {
      console.error('Error creating import job:', error);
      throw error;
    }
  };

  // Update the status of an import job
  const updateImportJobStatus = async (
    id: string, 
    status: "pending" | "processing" | "completed" | "failed",
    progress: number
  ): Promise<ImportJob> => {
    try {
      const updates: any = {
        status,
        progress,
      };
      
      if (status === 'completed' || status === 'failed') {
        updates.completedAt = new Date().toISOString();
      }
      
      const { data: job, error } = await supabase
        .from('import_jobs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      return job as ImportJob;
    } catch (error) {
      console.error('Error updating import job status:', error);
      throw error;
    }
  };

  // Process Excel file
  const processExcelFile = async (file: File) => {
    if (!file) {
      toast.error('Please select a file to import');
      return;
    }

    setIsImporting(true);
    setProgress(0);
    setErrors([]);
    
    try {
      // Read the file
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Get the first sheet
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          setTotalRows(jsonData.length);
          
          // Create import job
          const importJob = await createImportJob({
            userId: (await supabase.auth.getUser()).data.user?.id,
            tableName: 'data',
            fileName: file.name,
            fileSize: file.size,
            totalRows: jsonData.length,
          });
          
          // Process rows
          let processed = 0;
          const newErrors: ImportError[] = [];
          
          // Simulate processing
          for (let i = 0; i < jsonData.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 50));
            
            processed++;
            const currentProgress = Math.round((processed / jsonData.length) * 100);
            
            setProcessedRows(processed);
            setProgress(currentProgress);
            
            // Randomly add some errors for demonstration
            if (Math.random() > 0.9) {
              newErrors.push({
                row: i + 1,
                column: "Unknown column",
                message: "Invalid data format"
              });
            }
            
            // Update job status
            await updateImportJobStatus(
              importJob.id, 
              processed === jsonData.length ? 'completed' : 'processing',
              currentProgress
            );
          }
          
          setErrors(newErrors);
          
          // Update the final job status with errors
          await supabase
            .from('import_jobs')
            .update({
              errors: newErrors,
              processedRows: processed,
              status: newErrors.length > 0 ? 'completed' : 'completed'
            })
            .eq('id', importJob.id);
          
          if (newErrors.length > 0) {
            toast.warning(`Import completed with ${newErrors.length} errors`);
          } else {
            toast.success('Import completed successfully');
          }
          
          // Refresh the jobs list
          if (importJob.userId) {
            await fetchImportJobs(importJob.userId);
          }
        } catch (error) {
          console.error('Error processing file:', error);
          toast.error('Failed to process the file');
          setErrors([{
            row: 0,
            column: "Processing",
            message: "Failed to process file: " + (error as Error).message
          }]);
        } finally {
          setIsImporting(false);
        }
      };
      
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Error reading file:', error);
      toast.error('Failed to read the file');
      setIsImporting(false);
    }
  };

  // Cancel import
  const cancelImport = () => {
    setIsImporting(false);
    toast.info('Import cancelled');
  };

  return {
    isImporting,
    progress,
    totalRows,
    processedRows,
    errors,
    importJobs,
    isLoading,
    fetchImportJobs,
    createImportJob,
    updateImportJobStatus,
    processExcelFile,
    cancelImport
  };
};
