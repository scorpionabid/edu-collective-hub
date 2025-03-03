
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { ExportOptions } from '@/lib/api/types';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Default options for Excel export
const DEFAULT_OPTIONS: ExportOptions = {
  fileName: `export-${format(new Date(), 'yyyy-MM-dd')}`,
  sheetName: 'Data',
  dateFormat: 'yyyy-MM-dd',
  includeHeaders: true,
  headerStyle: {
    font: { bold: true, color: { rgb: '000000' } },
    fill: { fgColor: { rgb: 'EEEEEE' } }
  },
  cellStyle: {}
};

/**
 * Export data to Excel file
 * @param data Array of objects to export
 * @param options Export options
 */
export const exportToExcel = (
  data: any[],
  options: Partial<ExportOptions> = {}
): void => {
  try {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
    
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Add headers style if needed
    if (mergedOptions.includeHeaders && mergedOptions.headerStyle) {
      const headerRange = XLSX.utils.decode_range(ws['!ref'] || 'A1:Z1');
      for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        if (!ws[cellAddress]) continue;
        
        ws[cellAddress].s = mergedOptions.headerStyle;
      }
    }
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, mergedOptions.sheetName || 'Data');
    
    // Generate Excel file
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // Save file
    saveAs(blob, `${mergedOptions.fileName}.xlsx`);
    
    toast.success('Export completed successfully');
  } catch (error) {
    console.error('Export to Excel failed:', error);
    toast.error('Failed to export data');
  }
};

/**
 * Export query data to Excel (with server-side processing)
 * @param tableName Table to query
 * @param queryParams Query parameters
 * @param options Export options
 */
export const exportQueryToExcel = async (
  tableName: string,
  queryParams: any = {},
  options: Partial<ExportOptions> = {}
): Promise<void> => {
  try {
    // Create an export job
    const { data: job, error } = await supabase
      .from('export_jobs')
      .insert({
        status: 'waiting',
        progress: 0,
        total_rows: 0,
        processed_rows: 0,
        file_name: options.fileName || `${tableName}-export-${format(new Date(), 'yyyy-MM-dd')}`,
        query_params: {
          table: tableName,
          ...queryParams
        }
      })
      .select()
      .single();
    
    if (error) throw error;
    
    toast.info('Export job created. Processing will begin shortly.', {
      duration: 5000
    });
    
    // Poll for job status
    const intervalId = setInterval(async () => {
      const { data: updatedJob, error: pollError } = await supabase
        .from('export_jobs')
        .select('*')
        .eq('id', job.id)
        .single();
      
      if (pollError) {
        clearInterval(intervalId);
        throw pollError;
      }
      
      switch (updatedJob.status) {
        case 'complete':
          clearInterval(intervalId);
          
          if (updatedJob.file_url) {
            // Download the file
            window.open(updatedJob.file_url, '_blank');
            toast.success('Export completed successfully');
          } else {
            toast.error('Export completed but file URL is missing');
          }
          break;
          
        case 'error':
          clearInterval(intervalId);
          toast.error(`Export failed: ${updatedJob.error_message || 'Unknown error'}`);
          break;
          
        case 'processing':
          // Update progress
          const progress = Math.round((updatedJob.processed_rows / Math.max(updatedJob.total_rows, 1)) * 100);
          toast.info(`Export in progress: ${progress}%`, {
            id: `export-${job.id}`,
            duration: 3000
          });
          break;
      }
    }, 2000);
    
    // Cleanup after 10 minutes (prevent infinite polling)
    setTimeout(() => {
      clearInterval(intervalId);
    }, 10 * 60 * 1000);
    
  } catch (error) {
    console.error('Starting export job failed:', error);
    toast.error('Failed to start export process');
  }
};

/**
 * Export paginated data with multiple queries
 * @param fetchFunction Function to fetch a page of data
 * @param totalPages Total number of pages
 * @param options Export options
 */
export const exportPaginatedData = async (
  fetchFunction: (page: number) => Promise<any[]>,
  totalPages: number,
  options: Partial<ExportOptions> = {}
): Promise<void> => {
  try {
    let allData: any[] = [];
    let progress = 0;
    
    // Show progress toast
    const toastId = 'export-progress';
    toast.info(`Export started: 0%`, { id: toastId, duration: 5000 });
    
    // Fetch all pages
    for (let page = 1; page <= totalPages; page++) {
      const pageData = await fetchFunction(page);
      allData = [...allData, ...pageData];
      
      progress = Math.round((page / totalPages) * 100);
      toast.info(`Export in progress: ${progress}%`, { id: toastId });
    }
    
    // Export the collected data
    exportToExcel(allData, options);
    
  } catch (error) {
    console.error('Export paginated data failed:', error);
    toast.error('Failed to export paginated data');
  }
};

/**
 * Export data with transformer function
 * @param data Raw data to export
 * @param transformFunction Function to transform data before export
 * @param options Export options
 */
export const exportTransformedData = (
  data: any[],
  transformFunction: (item: any) => any,
  options: Partial<ExportOptions> = {}
): void => {
  try {
    const transformedData = data.map(transformFunction);
    exportToExcel(transformedData, options);
  } catch (error) {
    console.error('Export transformed data failed:', error);
    toast.error('Failed to transform and export data');
  }
};

/**
 * Export a subset of columns from the data
 * @param data Raw data to export
 * @param columns Array of column keys to include
 * @param options Export options
 */
export const exportColumns = (
  data: any[],
  columns: string[],
  options: Partial<ExportOptions> = {}
): void => {
  try {
    const filteredData = data.map(item => {
      const newItem: any = {};
      columns.forEach(col => {
        if (item.hasOwnProperty(col)) {
          newItem[col] = item[col];
        }
      });
      return newItem;
    });
    
    exportToExcel(filteredData, options);
  } catch (error) {
    console.error('Export columns failed:', error);
    toast.error('Failed to export selected columns');
  }
};
