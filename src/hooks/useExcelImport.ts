
import { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

interface UseExcelImportProps<T> {
  batchSize?: number;
  maxRows?: number;
  transformFn?: (row: Record<string, any>, index: number) => T;
  validateFn?: (row: T) => boolean | string;
  onBatchProcessed?: (batch: T[], progress: number) => void;
  onComplete?: (data: T[]) => void;
}

export function useExcelImport<T>({
  batchSize = 1000,
  maxRows = 100000,
  transformFn = (row: any) => row as T,
  validateFn = () => true,
  onBatchProcessed,
  onComplete
}: UseExcelImportProps<T>) {
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalRows, setTotalRows] = useState(0);
  const [processedRows, setProcessedRows] = useState(0);
  const [data, setData] = useState<T[]>([]);
  const [errors, setErrors] = useState<{ row: number; message: string }[]>([]);
  
  const processExcelFile = useCallback(
    async (file: File): Promise<void> => {
      setIsImporting(true);
      setProgress(0);
      setProcessedRows(0);
      setErrors([]);
      setData([]);
      
      try {
        console.time('Excel Import');
        
        // Read file as array buffer
        const buffer = await file.arrayBuffer();
        
        // Parse workbook
        const workbook = XLSX.read(buffer, { type: 'array' });
        
        // Get first worksheet
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];
        
        // Convert to JSON
        const rawData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { 
          header: 'A',
          defval: '' 
        });
        
        // Check if exceeds max rows
        if (rawData.length > maxRows) {
          toast.error(`File contains too many rows (${rawData.length}). Maximum allowed is ${maxRows}.`);
          setIsImporting(false);
          return;
        }
        
        // Extract headers (first row)
        const headers = rawData[0] as Record<string, any>;
        
        // Remove header row
        const dataRows = rawData.slice(1);
        
        // Update total rows
        setTotalRows(dataRows.length);
        
        // Process in batches
        const validatedData: T[] = [];
        const importErrors: { row: number; message: string }[] = [];
        
        // Process in batches to not block the main thread
        let currentIndex = 0;
        
        const processBatch = async () => {
          const startIndex = currentIndex;
          const endIndex = Math.min(currentIndex + batchSize, dataRows.length);
          const currentBatch = dataRows.slice(startIndex, endIndex);
          
          // Process each row in the batch
          const batchResults = currentBatch.map((rawRow, batchRowIndex) => {
            const rowIndex = startIndex + batchRowIndex + 2; // +2 for 1-based index and header row
            
            try {
              // Convert raw row with column headers to object
              const rowWithHeaders: Record<string, any> = {};
              
              Object.entries(rawRow).forEach(([cell, value]) => {
                if (headers[cell]) {
                  rowWithHeaders[headers[cell]] = value;
                }
              });
              
              // Transform row
              const transformedRow = transformFn(rowWithHeaders, rowIndex);
              
              // Validate row
              const validationResult = validateFn(transformedRow);
              
              if (validationResult === true) {
                return { valid: true, data: transformedRow };
              } else {
                const errorMessage = typeof validationResult === 'string' 
                  ? validationResult 
                  : `Validation failed on row ${rowIndex}`;
                
                importErrors.push({
                  row: rowIndex,
                  message: errorMessage
                });
                
                return { valid: false, data: null };
              }
            } catch (error) {
              importErrors.push({
                row: rowIndex,
                message: error.message || `Error processing row ${rowIndex}`
              });
              
              return { valid: false, data: null };
            }
          });
          
          // Add valid rows to results
          batchResults
            .filter(result => result.valid)
            .forEach(result => validatedData.push(result.data));
          
          // Update progress
          const newProcessedRows = endIndex;
          setProcessedRows(newProcessedRows);
          setProgress(Math.floor((newProcessedRows / dataRows.length) * 100));
          
          // Call callback with batch
          onBatchProcessed?.(
            batchResults
              .filter(result => result.valid)
              .map(result => result.data),
            Math.floor((endIndex / dataRows.length) * 100)
          );
          
          // Process next batch or complete
          currentIndex = endIndex;
          if (currentIndex < dataRows.length) {
            // Use setTimeout to avoid blocking the main thread
            setTimeout(processBatch, 0);
          } else {
            // Completed
            setData(validatedData);
            setErrors(importErrors);
            onComplete?.(validatedData);
            setIsImporting(false);
            console.timeEnd('Excel Import');
            
            // Show summary
            const errorCount = importErrors.length;
            if (errorCount > 0) {
              toast.warning(`Import completed with ${errorCount} errors. See error log for details.`);
            } else {
              toast.success(`Successfully imported ${validatedData.length} rows`);
            }
          }
        };
        
        // Start processing
        processBatch();
      } catch (error) {
        console.error('Error importing Excel file:', error);
        toast.error(`Failed to import file: ${error.message}`);
        setIsImporting(false);
      }
    },
    [batchSize, maxRows, onBatchProcessed, onComplete, transformFn, validateFn]
  );
  
  return {
    isImporting,
    progress,
    totalRows,
    processedRows,
    data,
    errors,
    processExcelFile
  };
}
