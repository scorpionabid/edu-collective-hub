
import * as XLSX from 'xlsx';
import { Column } from '@/lib/api/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { nanoid } from 'nanoid';

interface ExportJobStatus {
  id: string;
  status: 'waiting' | 'processing' | 'complete' | 'error';
  progress: number;
  totalRows: number;
  processedRows: number;
  errors: Array<{ message: string }>;
  fileName: string;
  startTime: string;
  endTime?: string;
  downloadUrl?: string;
  createdBy: string;
}

// Process data in batches to handle large datasets
const processBatches = <T>(
  items: T[], 
  batchSize: number, 
  processFn: (batch: T[]) => void
): void => {
  const totalItems = items.length;
  let processedItems = 0;
  
  console.log(`Processing ${totalItems} items in batches of ${batchSize}`);
  
  function processNextBatch() {
    const batch = items.slice(processedItems, processedItems + batchSize);
    if (batch.length === 0) return;
    
    processFn(batch);
    processedItems += batch.length;
    
    if (processedItems < totalItems) {
      // Use setTimeout to prevent blocking the main thread for too long
      setTimeout(processNextBatch, 0);
    } else {
      console.log('Finished processing all batches');
    }
  }
  
  processNextBatch();
};

// Helper to create column headers
const createHeaders = (columns: Column[] | string[]): string[] => {
  if (typeof columns[0] === 'string') {
    return columns as string[];
  }
  return (columns as Column[]).map(col => col.name);
};

// Helper to transform row data for excel
const transformRow = (row: any, columns: Column[] | string[]): any[] => {
  if (typeof columns[0] === 'string') {
    return (columns as string[]).map(colName => {
      const value = row[colName] || row.data?.[colName] || '';
      return value;
    });
  }
  
  return (columns as Column[]).map(col => {
    const value = row[col.name] || row.data?.[col.name] || '';
    return value;
  });
};

// Handle client-side export for smaller datasets (less than threshold)
export const exportToExcel = (
  data: any[], 
  columns: Column[] | string[], 
  fileName: string = 'export',
  threshold: number = 5000
) => {
  try {
    // If data is small enough, process it client-side
    if (data.length <= threshold) {
      console.log(`Starting client-side export of ${data.length} rows`);
      const startTime = performance.now();
      
      // Create worksheet
      const ws = XLSX.utils.aoa_to_sheet([]);
      
      // Add headers
      const headers = createHeaders(columns);
      XLSX.utils.sheet_add_aoa(ws, [headers], { origin: 'A1' });
      
      // Process rows in batches (1000 rows per batch)
      const BATCH_SIZE = 1000;
      let rowIndex = 1;
      
      processBatches(data, BATCH_SIZE, (batch) => {
        // Transform batch data
        const batchData = batch.map(row => transformRow(row, columns));
        
        // Add to worksheet
        XLSX.utils.sheet_add_aoa(ws, batchData, { origin: { r: rowIndex, c: 0 } });
        rowIndex += batch.length;
      });
      
      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Data');
      
      // Generate file name with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fullFileName = `${fileName}_${timestamp}.xlsx`;
      
      // Write to file and trigger download
      XLSX.writeFile(wb, fullFileName);
      
      const endTime = performance.now();
      console.log(`Export completed in ${(endTime - startTime).toFixed(2)}ms`);
      
      return { success: true, fileName: fullFileName };
    } else {
      // For larger datasets, use the serverless function
      return startServerSideExport(data, columns, fileName);
    }
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    toast.error(`Export failed: ${error.message}`);
    return { success: false, error: error.message };
  }
};

// Start a server-side export job for larger datasets
const startServerSideExport = async (
  data: any[], 
  columns: Column[] | string[], 
  fileName: string
) => {
  try {
    const jobId = nanoid();
    const user = (await supabase.auth.getUser()).data.user;
    
    if (!user) {
      toast.error('You must be logged in to export large datasets');
      return { success: false, error: 'Authentication required' };
    }
    
    // Create export job record
    await supabase.from('export_jobs').insert({
      id: jobId,
      status: 'waiting',
      progress: 0,
      total_rows: data.length,
      processed_rows: 0,
      file_name: `${fileName}_${new Date().toISOString().replace(/[:.]/g, '-')}.xlsx`,
      created_by: user.id
    });
    
    // Set up real-time notification for job updates
    const channel = supabase
      .channel(`job-status-${jobId}`)
      .on('postgres_changes', 
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'export_jobs',
          filter: `id=eq.${jobId}`
        }, 
        (payload) => {
          const status = payload.new as ExportJobStatus;
          
          if (status.status === 'processing') {
            toast.loading(`Exporting: ${status.progress}% complete`);
          } else if (status.status === 'complete' && status.downloadUrl) {
            toast.success('Export completed successfully');
            // Trigger download
            window.location.href = status.downloadUrl;
          } else if (status.status === 'error') {
            toast.error(`Export failed: ${status.errors?.[0]?.message || 'Unknown error'}`);
          }
        })
      .subscribe();
    
    // Convert columns to header strings
    const headers = createHeaders(columns);
    
    // Call the serverless function to start processing
    // We'll stream the first batch of data and let the function handle the rest
    const firstBatch = data.slice(0, 1000);
    const { error } = await supabase.functions.invoke('excel-processor', {
      body: { 
        action: 'export',
        jobId,
        headers,
        fileName: `${fileName}_${new Date().toISOString().replace(/[:.]/g, '-')}.xlsx`,
        dataBatch: firstBatch,
        totalRows: data.length,
        batchSize: 1000,
        hasMoreBatches: data.length > 1000
      }
    });
    
    if (error) {
      console.error('Error starting export job:', error);
      toast.error(`Failed to start export: ${error.message}`);
      return { success: false, error: error.message };
    }
    
    toast.success('Export started. You will be notified when it completes.');
    
    // Send the remaining batches
    if (data.length > 1000) {
      for (let i = 1; i < Math.ceil(data.length / 1000); i++) {
        const batch = data.slice(i * 1000, (i + 1) * 1000);
        const { error: batchError } = await supabase.functions.invoke('excel-processor', {
          body: { 
            action: 'exportBatch',
            jobId,
            dataBatch: batch,
            batchIndex: i,
            hasMoreBatches: (i + 1) * 1000 < data.length
          }
        });
        
        if (batchError) {
          console.error(`Error sending batch ${i}:`, batchError);
        }
      }
    }
    
    return { 
      success: true, 
      jobId, 
      message: 'Export job started. You will be notified when it completes.' 
    };
  } catch (error) {
    console.error('Error starting server-side export:', error);
    toast.error(`Export failed: ${error.message}`);
    return { success: false, error: error.message };
  }
};

// Helper function to convert general data to Excel format
export const convertToExcelData = <T extends Record<string, any>>(
  data: T[],
  columnMap: Record<string, string>
): any[] => {
  return data.map(item => {
    const row: Record<string, any> = {};
    
    Object.entries(columnMap).forEach(([key, label]) => {
      row[label] = item[key] || '';
    });
    
    return row;
  });
};

// Function to export list data (used in various parts of the application)
export const exportListToExcel = <T extends Record<string, any>>(
  data: T[],
  columnMap: Record<string, string>,
  fileName: string
): void => {
  // Convert data to excel format
  const excelData = convertToExcelData(data, columnMap);
  
  // Create column list for string columns
  const columns = Object.values(columnMap);
  
  // Export
  exportToExcel(excelData, columns, fileName);
};
