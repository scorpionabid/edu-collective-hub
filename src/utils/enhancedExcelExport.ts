
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { mockImportExportTables } from '@/lib/api/mock/importExportTables';
import { supabase } from '@/integrations/supabase/client';
import { ExportJob, FilterParams } from '@/lib/api/types';
import { toast } from 'sonner';

// Create a unique file name for the export
const createFileName = (tableName: string): string => {
  const date = new Date().toISOString().split('T')[0];
  return `${tableName}_export_${date}.xlsx`;
};

// Export data to an Excel file
export const exportToExcel = (data: any[], fileName: string): void => {
  try {
    // Create a worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Create a workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    
    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    
    // Save the file
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, fileName);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    toast.error('Failed to export data to Excel');
  }
};

// Enhanced export function that creates a job in the background
export const enhancedExportToExcel = async (
  tableName: string,
  filters: FilterParams = {},
  userId: string
): Promise<ExportJob | null> => {
  try {
    // Create a job record
    const fileName = createFileName(tableName);
    
    // Use the mock implementation for now
    const job = await mockImportExportTables.createExportJob({
      userId,
      tableName,
      fileName,
      filters,
      status: 'pending',
      createdAt: new Date().toISOString(),
      completedAt: null
    });
    
    // In a real implementation, we would trigger a serverless function
    // to process the export in the background
    
    // For now, simulate the process with a timeout
    setTimeout(async () => {
      try {
        // Simulate processing
        await mockImportExportTables.updateExportJob(job.id, {
          status: 'processing'
        });
        
        // Fetch data based on table name and filters
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .eq('deleted', false);
        
        if (error) throw error;
        
        // Generate Excel file
        const worksheet = XLSX.utils.json_to_sheet(data || []);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
        
        // Convert to blob
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        
        // In a real implementation, we would upload the blob to storage
        // and generate a download URL
        
        // Update the job as completed
        await mockImportExportTables.updateExportJob(job.id, {
          status: 'completed',
          completedAt: new Date().toISOString(),
          downloadUrl: 'https://example.com/download/' + fileName  // Mock URL
        });
      } catch (error) {
        console.error('Error processing export job:', error);
        
        // Update the job as failed
        await mockImportExportTables.updateExportJob(job.id, {
          status: 'failed',
          completedAt: new Date().toISOString()
        });
      }
    }, 2000);
    
    return job;
  } catch (error) {
    console.error('Error creating export job:', error);
    toast.error('Failed to start export job');
    return null;
  }
};

// Export multiple data sets as sheets in a single Excel file
export const exportMultipleToExcel = (data: { 
  sheets: Array<{ name: string; data: any[] }> 
}, fileName: string): void => {
  try {
    // Create a workbook
    const workbook = XLSX.utils.book_new();
    
    // Add each sheet
    data.sheets.forEach(sheet => {
      const worksheet = XLSX.utils.json_to_sheet(sheet.data);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name);
    });
    
    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    
    // Save the file
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, fileName);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    toast.error('Failed to export data to Excel');
  }
};
