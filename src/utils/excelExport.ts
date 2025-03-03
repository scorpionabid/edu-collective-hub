
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { nanoid } from 'nanoid';
import { Column, ExportOptions } from '@/lib/api/types';
import '../lib/api/mock/importExportTables';  // Make sure our mock tables are loaded

// Generic function to export data to Excel
export const exportToExcel = (
  data: any[],
  columns: Column[] | string[],
  fileName: string = 'export',
  options?: ExportOptions
) => {
  if (!data || !data.length) {
    console.error('No data to export');
    return;
  }

  try {
    // If array of objects, prepare for Excel format
    let excelData = data;
    let headers: string[] = [];
    
    if (typeof columns[0] === 'object') {
      // Column is Column[] type
      const columnObjects = columns as Column[];
      headers = columnObjects.map(col => col.name);
      
      // Map data to include only the specified columns
      excelData = data.map(row => {
        const newRow: Record<string, any> = {};
        columnObjects.forEach(col => {
          newRow[col.name] = row[col.id] || '';
        });
        return newRow;
      });
    } else {
      // Column is string[] type
      headers = columns as string[];
      
      // Map data to include only the specified columns
      excelData = data.map(row => {
        const newRow: Record<string, any> = {};
        headers.forEach(header => {
          newRow[header] = row[header] || '';
        });
        return newRow;
      });
    }

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, options?.sheetName || 'Sheet1');
    
    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    
    // Save file
    saveAs(blob, `${fileName}.xlsx`);
    
    return { success: true, fileName: `${fileName}.xlsx` };
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    return { success: false, error };
  }
};

// Enhanced version for large datasets that exports in the background
export const startExcelExport = async (
  getDataFn: (page: number, pageSize: number) => Promise<any>,
  columns: Column[] | string[],
  totalRows: number,
  fileName: string = 'export',
  batchSize: number = 1000,
  options?: ExportOptions
) => {
  try {
    const id = nanoid();
    const userId = (await supabase.auth.getUser()).data.user?.id;
    
    // Create export job record
    await supabase.from('export_jobs').insert({
      id,
      status: 'waiting',
      progress: 0,
      total_rows: totalRows,
      processed_rows: 0,
      file_name: `${fileName}.xlsx`,
      query_params: { columns, options },
      created_by: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    
    // Start background processing
    setTimeout(async () => {
      try {
        // Update status to processing
        await supabase.from('export_jobs').update({
          status: 'processing',
          updated_at: new Date().toISOString()
        }).eq('id', id);
        
        // Create workbook and worksheet
        const workbook = XLSX.utils.book_new();
        const sheetName = options?.sheetName || 'Sheet1';
        
        // Process in batches
        let processedRows = 0;
        let page = 1;
        let hasCreatedSheet = false;
        
        while (processedRows < totalRows) {
          // Fetch batch of data
          const batchData = await getDataFn(page, batchSize);
          
          if (!batchData || !batchData.length) {
            break;
          }
          
          // Process the data
          let excelData = batchData;
          let headers: string[] = [];
          
          if (typeof columns[0] === 'object') {
            // Column is Column[] type
            const columnObjects = columns as Column[];
            headers = columnObjects.map(col => col.name);
            
            // Map data to include only the specified columns
            excelData = batchData.map(row => {
              const newRow: Record<string, any> = {};
              columnObjects.forEach(col => {
                newRow[col.name] = row[col.id] || '';
              });
              return newRow;
            });
          } else {
            // Column is string[] type
            headers = columns as string[];
            
            // Map data to include only the specified columns
            excelData = batchData.map(row => {
              const newRow: Record<string, any> = {};
              headers.forEach(header => {
                newRow[header] = row[header] || '';
              });
              return newRow;
            });
          }
          
          // Create or append to worksheet
          if (!hasCreatedSheet) {
            const worksheet = XLSX.utils.json_to_sheet(excelData);
            XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
            hasCreatedSheet = true;
          } else {
            const worksheet = workbook.Sheets[sheetName];
            XLSX.utils.sheet_add_json(worksheet, excelData, { skipHeader: true, origin: -1 });
          }
          
          // Update progress
          processedRows += batchData.length;
          const progress = Math.min(100, Math.round((processedRows / totalRows) * 100));
          
          await supabase.from('export_jobs').update({
            progress,
            processed_rows: processedRows,
            updated_at: new Date().toISOString()
          }).eq('id', id);
          
          page++;
        }
        
        // Generate Excel file
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
        
        // In a real app, you would upload this blob to Supabase storage
        // For our mock implementation, we'll just update the job
        const fileUrl = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${Buffer.from(excelBuffer).toString('base64')}`;
        
        // Mark as complete
        await supabase.from('export_jobs').update({
          status: 'complete',
          progress: 100,
          file_url: fileUrl,
          updated_at: new Date().toISOString()
        }).eq('id', id);
        
        // In a real app, you would trigger a notification here
        
      } catch (error) {
        console.error('Error processing export job:', error);
        
        // Update job with error
        await supabase.from('export_jobs').update({
          status: 'error',
          error_message: error.message,
          updated_at: new Date().toISOString()
        }).eq('id', id);
      }
    }, 100);
    
    return { success: true, jobId: id, message: 'Export started' };
  } catch (error) {
    console.error('Error starting export:', error);
    return { success: false, error };
  }
};

// Function to check export status
export const checkExportStatus = async (jobId: string) => {
  try {
    const { data: job, error } = await supabase
      .from('export_jobs')
      .select('*')
      .eq('id', jobId)
      .single();
    
    if (error) {
      throw error;
    }
    
    return {
      success: true,
      status: job.status,
      progress: job.progress,
      fileUrl: job.file_url
    };
  } catch (error) {
    console.error('Error checking export status:', error);
    return { success: false, error };
  }
};

// Function to download an exported file
export const downloadExportedFile = async (jobId: string) => {
  try {
    const { data: job, error } = await supabase
      .from('export_jobs')
      .select('*')
      .eq('id', jobId)
      .single();
    
    if (error) {
      throw error;
    }
    
    if (job.status !== 'complete') {
      throw new Error('Export is not complete yet');
    }
    
    if (!job.file_url) {
      throw new Error('File URL not found');
    }
    
    // In a real app, this would be a storage URL
    // For our mock implementation, we'll handle the data URL directly
    if (job.file_url.startsWith('data:')) {
      const link = document.createElement('a');
      link.href = job.file_url;
      link.download = job.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return { success: true };
    }
    
    const { data, error: downloadError } = await supabase.storage
      .from('exports')
      .download(job.file_url);
    
    if (downloadError) {
      throw downloadError;
    }
    
    saveAs(data, job.file_name);
    return { success: true };
  } catch (error) {
    console.error('Error downloading exported file:', error);
    return { success: false, error };
  }
};

// Function to convert data for Excel export
export const convertToExcelData = (data: any[], columns: Column[]) => {
  return data.map(item => {
    const row: Record<string, any> = {};
    columns.forEach(column => {
      row[column.name] = item[column.id] || '';
    });
    return row;
  });
};
