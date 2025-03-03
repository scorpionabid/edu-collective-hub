
import { saveAs } from 'file-saver';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Export data to an Excel file (CSV format)
 * @param data Array of objects to export
 * @param headers Array of column headers (if not provided, will use object keys)
 * @param filename Name of the file (without extension)
 */
export function exportToExcel(data: any[], headers?: string[], filename: string = 'export') {
  try {
    // Convert data to CSV format
    const headerRow = headers?.join(',') || 
      (data.length > 0 ? Object.keys(data[0]).join(',') : '');
    
    const rows = data.map(item => {
      const rowData = headers 
        ? headers.map(header => item[header] || '')
        : Object.values(item);
      
      // Handle special characters and commas in CSV
      return rowData.map(value => {
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        // Escape quotes and wrap in quotes if the value contains commas or quotes
        if (stringValue.includes(',') || stringValue.includes('"')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',');
    }).join('\n');
    
    // Create CSV content
    const csvContent = [headerRow, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    
    // Save file
    saveAs(blob, `${filename}.csv`);
    
    toast.success('Export completed successfully');
    return true;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    toast.error('Failed to export data');
    return false;
  }
}

/**
 * Start an Excel export job in the background
 * @param tableName The name of the table or query to export
 * @param filters Filters to apply to the data
 * @param options Additional export options
 */
export async function startExcelExport(tableName: string, filters: any = {}, options: any = {}) {
  try {
    // This is a stub implementation as we don't have a proper export_jobs table
    // In a real implementation, you would create a job record in the export_jobs table
    
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      throw new Error('User not authenticated');
    }
    
    // Mock export job creation - in real app, this would be a server-side function
    const mockJob = {
      id: `export-${Date.now()}`,
      status: 'waiting',
      progress: 0,
      file_name: options.filename || `${tableName}-export.xlsx`,
      query_params: { tableName, filters, options },
      total_rows: 0,
      processed_rows: 0,
      created_by: user.data.user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Return job ID for polling
    return {
      success: true,
      jobId: mockJob.id,
      message: 'Export job started'
    };
  } catch (error) {
    console.error('Error starting export:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Check the status of an Excel export job
 * @param jobId The ID of the export job
 */
export async function checkExportStatus(jobId: string) {
  try {
    // This is a stub implementation as we don't have a proper export_jobs table
    // Simulate a progressive status update
    
    // In a real implementation, you would fetch the job record from the export_jobs table
    const progress = Math.min(100, Math.floor(Math.random() * 20) + (Date.now() % 100));
    
    const mockJobStatus = {
      id: jobId,
      status: progress >= 100 ? 'complete' : 'processing',
      progress,
      file_url: progress >= 100 ? `https://example.com/exports/${jobId}.xlsx` : undefined,
      processed_rows: progress,
      total_rows: 100,
      error_message: null
    };
    
    return {
      success: true,
      status: mockJobStatus.status,
      progress: mockJobStatus.progress,
      fileUrl: mockJobStatus.file_url,
      message: `Export ${mockJobStatus.status === 'complete' ? 'completed' : 'in progress'}`
    };
  } catch (error) {
    console.error('Error checking export status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Download a previously exported Excel file
 * @param fileUrl The URL of the exported file
 * @param filename Optional custom filename
 */
export async function downloadExportedFile(fileUrl: string, filename?: string) {
  try {
    // In a real implementation, you would download the file from the URL
    // For demo purposes, we'll create a simple CSV
    const response = await fetch(fileUrl);
    const blob = await response.blob();
    
    saveAs(blob, filename || 'export.xlsx');
    
    return {
      success: true,
      message: 'File downloaded successfully'
    };
  } catch (error) {
    console.error('Error downloading file:', error);
    
    // Fallback: Create a demo file
    const demoData = [
      { id: 1, name: 'Example 1' },
      { id: 2, name: 'Example 2' },
      { id: 3, name: 'Example 3' }
    ];
    
    exportToExcel(demoData, ['id', 'name'], filename || 'export');
    
    return {
      success: true,
      message: 'Demo file downloaded (actual download failed)'
    };
  }
}

/**
 * Utility function to convert array data to Excel format
 * @param data The data to convert
 * @param sheetName Name of the Excel sheet
 */
export function convertToExcelData(data: any[], sheetName: string = 'Sheet1') {
  // This is a stub - in real implementation, you would use ExcelJS
  return {
    sheets: [
      {
        name: sheetName,
        data: data
      }
    ]
  };
}
