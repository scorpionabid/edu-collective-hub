
import { useCallback, useState } from 'react';
import { ImportJob, ImportError } from '@/lib/api/types';
import { toast } from "sonner";
import * as XLSX from 'xlsx';
import { mockImportExportInterface } from '@/lib/api/mock/importExportTables';

interface UseEnhancedExcelImportOptions<T> {
  tableName: string;
  maxRows?: number;
  batchSize?: number;
  transformFn?: (row: Record<string, any>, index: number) => T;
  validateFn?: (row: T) => boolean | string;
  onComplete?: (data: T[]) => void;
  withUpsert?: boolean;
  keyField?: string;
}

export function useEnhancedExcelImport<T>({
  tableName,
  maxRows = 10000,
  batchSize = 1000,
  transformFn,
  validateFn,
  onComplete,
  withUpsert = false,
  keyField
}: UseEnhancedExcelImportOptions<T>) {
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalRows, setTotalRows] = useState(0);
  const [processedRows, setProcessedRows] = useState(0);
  const [errors, setErrors] = useState<ImportError[]>([]);

  // Process Excel file
  const processExcelFile = useCallback(
    async (file: File) => {
      // Create a new import job
      try {
        setIsImporting(true);
        setErrors([]);
        setProgress(0);
        setProcessedRows(0);
        
        // Create import job record
        const importJob = await mockImportExportInterface.createImportJob({
          userId: 'current-user', // In a real app, this would be the actual user ID
          tableName,
          status: 'processing',
          progress: 0,
          total_rows: 0,
          processed_rows: 0,
          failed_rows: 0,
          file_name: file.name,
          file_size: file.size
        });

        // Read the file as array buffer
        const fileData = await readFileAsArrayBuffer(file);
        
        // Parse the workbook
        const workbook = XLSX.read(fileData, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON
        const rawData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);
        
        if (rawData.length === 0) {
          throw new Error('No data found in the file');
        }
        
        if (rawData.length > maxRows) {
          throw new Error(`File contains too many rows. Maximum allowed is ${maxRows}`);
        }
        
        // Update import job with total rows
        await mockImportExportInterface.updateImportJobStatus(
          importJob.id, 
          'processing',
          0
        );
        
        setTotalRows(rawData.length);
        
        // Process data in batches
        const processedData: T[] = [];
        const newErrors: ImportError[] = [];
        
        for (let i = 0; i < rawData.length; i += batchSize) {
          const batch = rawData.slice(i, i + batchSize);
          
          // Process each row in the batch
          const batchResults = batch.map((rawRow, batchIndex) => {
            const rowIndex = i + batchIndex;
            try {
              // Transform the row if a transform function is provided
              const transformedRow = transformFn ? transformFn(rawRow, rowIndex) : rawRow as unknown as T;
              
              // Validate the row if a validation function is provided
              if (validateFn) {
                const validationResult = validateFn(transformedRow);
                if (validationResult !== true) {
                  const errorMessage = typeof validationResult === 'string' 
                    ? validationResult 
                    : 'Validation failed';
                  
                  newErrors.push({ row: rowIndex + 1, message: errorMessage });
                  return null;
                }
              }
              
              return transformedRow;
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Processing error';
              newErrors.push({ row: rowIndex + 1, message: errorMessage });
              return null;
            }
          });
          
          // Filter out null results (validation failures)
          const validBatchResults = batchResults.filter(
            (result): result is T => result !== null
          );
          
          // Add to processed data
          processedData.push(...validBatchResults);
          
          // Update progress
          const currentProcessed = Math.min(i + batch.length, rawData.length);
          const currentProgress = Math.round((currentProcessed / rawData.length) * 100);
          
          setProcessedRows(currentProcessed);
          setProgress(currentProgress);
          
          // Update import job progress
          await mockImportExportInterface.updateImportJobStatus(
            importJob.id,
            'processing',
            currentProgress
          );
          
          // Allow UI to update
          await new Promise(resolve => setTimeout(resolve, 1));
        }
        
        // Set errors if any
        if (newErrors.length > 0) {
          setErrors(newErrors);
        }
        
        // Complete the import job
        const status = newErrors.length > 0 ? 'failed' : 'completed';
        await mockImportExportInterface.updateImportJobStatus(
          importJob.id,
          status,
          100
        );
        
        setIsImporting(false);
        
        // Call the completion callback if provided
        if (onComplete) {
          onComplete(processedData);
        }
        
        toast.success(`Import completed with ${processedData.length} records processed${newErrors.length > 0 ? ` and ${newErrors.length} errors` : ''}`);
        
        return processedData;
      } catch (error) {
        setIsImporting(false);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        setErrors([{ row: 0, message: errorMessage }]);
        toast.error(`Import failed: ${errorMessage}`);
        
        throw error;
      }
    },
    [tableName, maxRows, batchSize, transformFn, validateFn, onComplete]
  );

  // Read file as array buffer
  const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        if (e.target?.result instanceof ArrayBuffer) {
          resolve(e.target.result);
        } else {
          reject(new Error('Failed to read file as array buffer'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('File read error'));
      };
      
      reader.readAsArrayBuffer(file);
    });
  };

  // Cancel import function
  const cancelImport = useCallback(() => {
    setIsImporting(false);
    setProgress(0);
    toast.info('Import cancelled');
  }, []);

  return {
    isImporting,
    progress,
    totalRows,
    processedRows,
    errors,
    processExcelFile,
    cancelImport
  };
}
