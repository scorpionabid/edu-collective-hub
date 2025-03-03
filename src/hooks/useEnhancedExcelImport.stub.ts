
import { useState } from 'react';
import { ImportJob, ImportError } from '@/lib/api/types';
import { toast } from 'sonner';

// Stub implementation for testing without actual API calls
export const useEnhancedExcelImport = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalRows, setTotalRows] = useState(0);
  const [processedRows, setProcessedRows] = useState(0);
  const [errors, setErrors] = useState<ImportError[]>([]);
  const [importJobs, setImportJobs] = useState<ImportJob[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all import jobs for a user (stub)
  const fetchImportJobs = async (userId: string): Promise<ImportJob[]> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockJobs: ImportJob[] = [
      {
        id: '1',
        userId,
        tableName: 'students',
        fileName: 'students.xlsx',
        fileSize: 1024 * 50,
        totalRows: 100,
        processedRows: 100,
        status: 'completed',
        progress: 100,
        startedAt: new Date(Date.now() - 86400000).toISOString(),
        completedAt: new Date(Date.now() - 86000000).toISOString(),
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        errors: []
      },
      {
        id: '2',
        userId,
        tableName: 'teachers',
        fileName: 'teacher-data.xlsx',
        fileSize: 1024 * 30,
        totalRows: 50,
        processedRows: 45,
        status: 'failed',
        progress: 90,
        startedAt: new Date(Date.now() - 172800000).toISOString(),
        completedAt: new Date(Date.now() - 172700000).toISOString(),
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        errors: [
          {
            row: 46,
            column: 'email',
            message: 'Invalid email format'
          }
        ]
      }
    ];
    
    setImportJobs(mockJobs);
    setIsLoading(false);
    return mockJobs;
  };

  // Create a new import job (stub)
  const createImportJob = async (data: Partial<ImportJob>): Promise<ImportJob> => {
    const newJob: ImportJob = {
      id: Math.random().toString(36).substring(2, 11),
      userId: data.userId || '',
      tableName: data.tableName || '',
      fileName: data.fileName || '',
      fileSize: data.fileSize || 0,
      totalRows: data.totalRows || 0,
      processedRows: 0,
      status: 'pending',
      progress: 0,
      startedAt: new Date().toISOString(),
      completedAt: null,
      createdAt: new Date().toISOString(),
      errors: []
    };
    
    setImportJobs(prev => [newJob, ...prev]);
    return newJob;
  };

  // Update the status of an import job (stub)
  const updateImportJobStatus = async (
    id: string, 
    status: "pending" | "processing" | "completed" | "failed",
    progress: number
  ): Promise<ImportJob> => {
    const updatedJobs = importJobs.map(job => {
      if (job.id === id) {
        return {
          ...job,
          status,
          progress,
          completedAt: (status === 'completed' || status === 'failed') 
            ? new Date().toISOString() 
            : job.completedAt
        };
      }
      return job;
    });
    
    setImportJobs(updatedJobs);
    const updatedJob = updatedJobs.find(job => job.id === id);
    
    if (!updatedJob) {
      throw new Error('Job not found');
    }
    
    return updatedJob;
  };

  // Process Excel file (stub)
  const processExcelFile = async (file: File) => {
    if (!file) {
      toast.error('Please select a file to import');
      return;
    }

    setIsImporting(true);
    setProgress(0);
    setErrors([]);
    
    try {
      // Simulate file reading
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock file content
      const mockTotal = Math.floor(Math.random() * 100) + 20;
      setTotalRows(mockTotal);
      
      // Create import job
      const importJob = await createImportJob({
        userId: 'mock-user-id',
        tableName: 'data',
        fileName: file.name,
        fileSize: file.size,
        totalRows: mockTotal
      });
      
      // Simulate processing
      let processed = 0;
      const mockErrors: ImportError[] = [];
      
      const processChunk = async () => {
        const chunkSize = Math.floor(Math.random() * 5) + 1;
        const newProcessed = Math.min(processed + chunkSize, mockTotal);
        
        for (let i = processed; i < newProcessed; i++) {
          // Random errors
          if (Math.random() > 0.9) {
            mockErrors.push({
              row: i + 1,
              column: "Data formatting",
              message: "Invalid data in row"
            });
          }
        }
        
        processed = newProcessed;
        const currentProgress = Math.round((processed / mockTotal) * 100);
        
        setProcessedRows(processed);
        setProgress(currentProgress);
        
        // Update job status
        await updateImportJobStatus(
          importJob.id, 
          processed === mockTotal ? 'completed' : 'processing',
          currentProgress
        );
        
        if (processed < mockTotal) {
          setTimeout(processChunk, 300);
        } else {
          // Finished
          setErrors(mockErrors);
          
          if (mockErrors.length > 0) {
            toast.warning(`Import completed with ${mockErrors.length} errors`);
          } else {
            toast.success('Import completed successfully');
          }
          
          setIsImporting(false);
        }
      };
      
      // Start processing
      processChunk();
      
    } catch (error) {
      console.error('Error in mock processing:', error);
      toast.error('Failed to process the file');
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

export default useEnhancedExcelImport;
