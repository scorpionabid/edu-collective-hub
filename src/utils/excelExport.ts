
import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';
import { Column } from '@/lib/api/types';

export interface ExportOptions {
  fileName?: string;
  sheetName?: string;
  headers?: boolean;
  format?: 'xlsx' | 'csv';
}

const defaultOptions: ExportOptions = {
  fileName: `export-${new Date().toISOString().substring(0, 10)}`,
  sheetName: 'Sheet1',
  headers: true,
  format: 'xlsx'
};

export function exportToExcel(
  data: any[],
  options?: ExportOptions
): { success: boolean; fileName?: string; error?: any } {
  try {
    const mergedOptions = { ...defaultOptions, ...options };
    const fileName = `${mergedOptions.fileName}.${mergedOptions.format}`;
    
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data, {
      skipHeader: !mergedOptions.headers
    });
    
    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, mergedOptions.sheetName);
    
    // Write the workbook and save the file
    XLSX.writeFile(wb, fileName);
    
    return {
      success: true,
      fileName
    };
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    return {
      success: false,
      error
    };
  }
}

export async function exportLargeDataset(
  data: any[] | (() => Promise<any[]>),
  options?: ExportOptions & { batchSize?: number }
): Promise<{ success: boolean; fileName?: string; error?: any }> {
  try {
    const mergedOptions = { ...defaultOptions, ...options, batchSize: options?.batchSize || 5000 };
    const fileName = `${mergedOptions.fileName}.${mergedOptions.format}`;
    
    // Get data if it's a function
    const dataArray = typeof data === 'function' ? await data() : data;
    
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    
    // Process in batches
    for (let i = 0; i < dataArray.length; i += mergedOptions.batchSize) {
      const batch = dataArray.slice(i, i + mergedOptions.batchSize);
      
      if (i === 0) {
        // First batch, create the sheet
        const ws = XLSX.utils.json_to_sheet(batch, {
          skipHeader: !mergedOptions.headers
        });
        XLSX.utils.book_append_sheet(wb, ws, mergedOptions.sheetName);
      } else {
        // Append to existing sheet
        const ws = wb.Sheets[mergedOptions.sheetName!];
        XLSX.utils.sheet_add_json(ws, batch, {
          skipHeader: true,
          origin: -1 // -1 means append to the end
        });
      }
    }
    
    // Write the workbook and save the file
    XLSX.writeFile(wb, fileName);
    
    return {
      success: true,
      fileName
    };
  } catch (error) {
    console.error('Error exporting large dataset:', error);
    return {
      success: false,
      error
    };
  }
}

export function exportFromTemplate(
  data: any[],
  template: any,
  options?: ExportOptions
): { success: boolean; fileName?: string; error?: any } {
  try {
    const mergedOptions = { ...defaultOptions, ...options };
    const fileName = `${mergedOptions.fileName}.${mergedOptions.format}`;
    
    // Create a copy of the template
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(template.header || []);
    
    // Add the data rows
    XLSX.utils.sheet_add_json(ws, data, {
      skipHeader: true,
      origin: template.dataStartRow || 'A2'
    });
    
    // Apply styling if provided
    if (template.styling) {
      // Apply column widths
      if (template.styling.columnWidths) {
        ws['!cols'] = template.styling.columnWidths.map((width: number) => ({ wch: width }));
      }
      
      // Apply row heights
      if (template.styling.rowHeights) {
        ws['!rows'] = template.styling.rowHeights.map((height: number) => ({ hpt: height }));
      }
    }
    
    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, mergedOptions.sheetName);
    
    // Write the workbook and save the file
    XLSX.writeFile(wb, fileName);
    
    return {
      success: true,
      fileName
    };
  } catch (error) {
    console.error('Error exporting with template:', error);
    return {
      success: false,
      error
    };
  }
}

export function generateExcelFromColumns(data: any[], columns: string | Column[]): { success: boolean; fileName?: string; error?: any } {
  try {
    // If columns is a string, treat it as a JSON string and parse it
    let columnArray: any[] = [];
    
    if (typeof columns === 'string') {
      try {
        columnArray = JSON.parse(columns);
      } catch (e) {
        console.error('Failed to parse columns string:', e);
        columnArray = [];
      }
    } else {
      // Assume columns is already an array of Column objects
      columnArray = columns;
    }
    
    // Transform data based on columns
    const transformedData = data.map(item => {
      const transformed: any = {};
      
      columnArray.forEach(col => {
        const colName = typeof col === 'string' ? col : col.name;
        transformed[colName] = item[colName] || '';
      });
      
      return transformed;
    });
    
    // Export the transformed data
    return exportToExcel(transformedData, {
      fileName: `data-export-${new Date().toISOString().substring(0, 10)}`
    });
  } catch (error) {
    console.error('Error generating Excel from columns:', error);
    return {
      success: false,
      error
    };
  }
}

export async function initiateServerSideExport(
  query: any,
  options?: { 
    fileName?: string;
    columns?: string[];
    filters?: any;
    jobName?: string;
  }
): Promise<{ success: boolean; jobId?: string; message?: string; error?: any }> {
  try {
    // Create an export job in the database
    const jobId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    const { error } = await supabase
      .from('export_jobs')
      .insert({
        id: jobId,
        status: 'waiting',
        progress: 0,
        file_name: options?.fileName || `export-${new Date().toISOString().substring(0, 10)}`,
        query_params: {
          query: query,
          columns: options?.columns,
          filters: options?.filters,
          jobName: options?.jobName
        },
        created_by: (await supabase.auth.getUser()).data.user?.id
      });
      
    if (error) throw error;
    
    // Trigger the edge function to handle the export
    const { error: functionError } = await supabase.functions.invoke('process-export', {
      body: { jobId }
    });
    
    if (functionError) throw functionError;
    
    return {
      success: true,
      jobId,
      message: 'Export job initiated successfully. You will be notified when it completes.'
    };
  } catch (error) {
    console.error('Error initiating server-side export:', error);
    return {
      success: false,
      error
    };
  }
}

export async function getExportJobStatus(jobId: string): Promise<any> {
  try {
    const { data, error } = await supabase
      .from('export_jobs')
      .select('*')
      .eq('id', jobId)
      .single();
      
    if (error) throw error;
    
    return {
      success: true,
      job: data
    };
  } catch (error) {
    console.error('Error getting export job status:', error);
    return {
      success: false,
      error
    };
  }
}

export async function downloadExportFile(jobId: string): Promise<{ success: boolean; url?: string; error?: any }> {
  try {
    const { data, error } = await supabase
      .from('export_jobs')
      .select('file_url, file_name')
      .eq('id', jobId)
      .single();
      
    if (error) throw error;
    
    if (!data.file_url) {
      return {
        success: false,
        error: 'File not ready yet'
      };
    }
    
    // For storage files, generate a signed URL
    if (data.file_url.startsWith('exports/')) {
      const { data: signedUrlData, error: signedUrlError } = await supabase
        .storage
        .from('exports')
        .createSignedUrl(data.file_url.replace('exports/', ''), 60);
        
      if (signedUrlError) throw signedUrlError;
      
      return {
        success: true,
        url: signedUrlData.signedUrl
      };
    }
    
    // For public URLs, just return the URL
    return {
      success: true,
      url: data.file_url
    };
  } catch (error) {
    console.error('Error downloading export file:', error);
    return {
      success: false,
      error
    };
  }
}
