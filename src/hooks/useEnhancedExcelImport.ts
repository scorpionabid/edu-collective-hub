
import { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { nanoid } from 'nanoid';
import { useQueryClient } from '@tanstack/react-query';

interface ImportJobStatus {
  id: string;
  status: 'waiting' | 'processing' | 'complete' | 'error';
  progress: number;
  totalRows: number;
  processedRows: number;
  errors: Array<{ row: number; message: string }>;
  fileName: string;
  startTime: string;
  endTime?: string;
  createdBy: string;
}

interface UseEnhancedExcelImportProps<T> {
  batchSize?: number;
  maxRows?: number;
  transformFn?: (row: Record<string, any>, index: number) => T;
  validateFn?: (row: T) => boolean | string;
  tableName: string;
  onBatchProcessed?: (batch: T[], progress: number) => void;
  onComplete?: (data: T[]) => void;
  withUpsert?: boolean;
  keyField?: string;
}

export function useEnhancedExcelImport<T>({
  batchSize = 1000,
  maxRows = 100000,
  transformFn = (row: any) => row as T,
  validateFn = () => true,
  tableName,
  onBatchProcessed,
  onComplete,
  withUpsert = false,
  keyField
}: UseEnhancedExcelImportProps<T>) {
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalRows, setTotalRows] = useState(0);
  const [processedRows, setProcessedRows] = useState(0);
  const [data, setData] = useState<T[]>([]);
  const [errors, setErrors] = useState<{ row: number; message: string }[]>([]);
  const [jobId, setJobId] = useState<string | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  
  const queryClient = useQueryClient();

  // Set up real-time subscription for job status updates
  const subscribeToJobUpdates = useCallback((id: string) => {
    const channel = supabase
      .channel(`job-status-${id}`)
      .on('postgres_changes', 
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'import_jobs',
          filter: `id=eq.${id}`
        }, 
        (payload) => {
          const status = payload.new as ImportJobStatus;
          setProgress(status.progress);
          setProcessedRows(status.processedRows);
          setTotalRows(status.totalRows);
          
          if (status.status === 'complete') {
            setIsImporting(false);
            toast.success(`Successfully imported ${status.processedRows} rows`);
            queryClient.invalidateQueries({ queryKey: [tableName] });
            if (onComplete) {
              // We might not have the full data here, so we fetch it if needed
              onComplete(data);
            }
          } else if (status.status === 'error') {
            setIsImporting(false);
            toast.error('Error importing data. Please check the error log.');
            setErrors(status.errors || []);
          }
        })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [data, onComplete, queryClient, tableName]);

  const cancelImport = useCallback(() => {
    if (jobId) {
      supabase.functions.invoke('excel-processor', {
        body: { 
          action: 'cancel',
          jobId 
        }
      });
      
      setIsImporting(false);
      toast.info('Import cancelled');
      
      if (abortController) {
        abortController.abort();
      }
    }
  }, [jobId, abortController]);

  const processExcelFile = useCallback(
    async (file: File): Promise<void> => {
      setIsImporting(true);
      setProgress(0);
      setProcessedRows(0);
      setErrors([]);
      setData([]);
      
      const newController = new AbortController();
      setAbortController(newController);
      
      try {
        console.time('Excel Import');
        const newJobId = nanoid();
        setJobId(newJobId);
        
        // Create import job in database
        await supabase.from('import_jobs').insert({
          id: newJobId,
          status: 'waiting',
          progress: 0,
          total_rows: 0,
          processed_rows: 0,
          file_name: file.name,
          table_name: tableName,
          with_upsert: withUpsert,
          key_field: keyField,
          created_by: (await supabase.auth.getUser()).data.user?.id
        });
        
        // Set up real-time subscription for this job
        const unsubscribe = subscribeToJobUpdates(newJobId);
        
        // First analyze the file to get headers and row count without parsing everything
        const fileBuffer = await file.arrayBuffer();
        
        // Process initial chunk to get headers and schema
        const workbook = XLSX.read(fileBuffer, { type: 'array' });
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];
        
        // Get range dimensions to determine total rows
        const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
        const estimatedTotalRows = range.e.r;
        
        if (estimatedTotalRows > maxRows) {
          toast.error(`File contains too many rows (${estimatedTotalRows}). Maximum allowed is ${maxRows}.`);
          setIsImporting(false);
          unsubscribe();
          return;
        }
        
        setTotalRows(estimatedTotalRows);
        
        // Extract headers from the first row
        const headers = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { 
          header: 'A',
          range: { s: { r: 0, c: 0 }, e: { r: 0, c: range.e.c } }
        })[0];
        
        // Send the file to our edge function for processing
        const { data: jobResponse, error: jobError } = await supabase.functions.invoke('excel-processor', {
          body: { 
            action: 'process',
            jobId: newJobId,
            headers,
            tableName,
            fileName: file.name,
            withUpsert,
            keyField,
            maxRows,
            batchSize
          },
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (jobError) {
          console.error('Error submitting import job:', jobError);
          toast.error(`Failed to start import: ${jobError.message}`);
          setIsImporting(false);
          unsubscribe();
          return;
        }
        
        // Upload the file to temporary storage for the edge function to process
        const { error: uploadError } = await supabase.storage
          .from('temp-imports')
          .upload(`${newJobId}/${file.name}`, file, {
            cacheControl: '3600',
            contentType: file.type,
            upsert: false
          });
        
        if (uploadError) {
          console.error('Error uploading file:', uploadError);
          toast.error(`Failed to upload file: ${uploadError.message}`);
          setIsImporting(false);
          unsubscribe();
          return;
        }
        
        console.log('Import job submitted successfully:', jobResponse);
        toast.success('Import job submitted successfully. Processing has started.');
        
        // Our real-time subscription will handle progress updates
      } catch (error) {
        console.error('Error importing Excel file:', error);
        toast.error(`Failed to import file: ${error.message}`);
        setIsImporting(false);
        if (jobId) {
          // Update job status to error
          await supabase.from('import_jobs').update({
            status: 'error',
            errors: [{ message: error.message }]
          }).eq('id', jobId);
        }
      }
    },
    [
      batchSize, 
      jobId, 
      keyField, 
      maxRows, 
      subscribeToJobUpdates, 
      tableName, 
      withUpsert
    ]
  );
  
  // Load previous in-progress imports
  const resumeImport = useCallback(async (id: string) => {
    setJobId(id);
    setIsImporting(true);
    
    const { data: job, error } = await supabase
      .from('import_jobs')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !job) {
      toast.error('Failed to resume import: Job not found');
      setIsImporting(false);
      return;
    }
    
    if (job.status === 'complete') {
      toast.info('This import has already been completed');
      setIsImporting(false);
      return;
    }
    
    if (job.status === 'error') {
      toast.warning('This import failed. Starting a new attempt...');
    }
    
    // Resume the job
    const { error: resumeError } = await supabase.functions.invoke('excel-processor', {
      body: { 
        action: 'resume',
        jobId: id
      }
    });
    
    if (resumeError) {
      toast.error(`Failed to resume import: ${resumeError.message}`);
      setIsImporting(false);
      return;
    }
    
    // Set up real-time subscription for this job
    subscribeToJobUpdates(id);
    
    toast.success('Import resumed successfully');
  }, [subscribeToJobUpdates]);

  return {
    isImporting,
    progress,
    totalRows,
    processedRows,
    data,
    errors,
    jobId,
    processExcelFile,
    cancelImport,
    resumeImport
  };
}
