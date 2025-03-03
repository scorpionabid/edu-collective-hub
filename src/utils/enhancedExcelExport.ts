
import { ExportJob, FilterParams } from "@/lib/api/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { saveAs } from "file-saver";
import Excel from "exceljs";
import { getMockSupabase } from "@/lib/api/mock/importExportTables";

// Use the getMockSupabase helper to get a properly typed mock implementation
const mockSupabase = getMockSupabase();

export interface ExportData {
  sheets: {
    name: string;
    data: any[];
  }[];
}

export const createExportJob = async (userId: string, tableName: string, filters?: FilterParams): Promise<ExportJob | null> => {
  try {
    const { data, error } = await mockSupabase
      .from('export_jobs')
      .insert({
        userId,
        tableName,
        filters,
        status: 'pending',
        start_time: new Date().toISOString(),
        file_name: `${tableName}_export_${new Date().toISOString().split('T')[0]}.xlsx`
      })
      .select()
      .single();

    if (error) throw error;
    
    return data as ExportJob;
  } catch (error) {
    console.error('Error creating export job:', error);
    toast.error('Failed to create export job');
    return null;
  }
};

export const updateExportJobStatus = async (
  id: string, 
  status: 'pending' | 'processing' | 'completed' | 'failed',
  options?: {
    download_url?: string;
    file_size?: number;
    error_message?: string;
  }
): Promise<ExportJob | null> => {
  try {
    const updates: any = { status };
    
    if (status === 'completed') {
      updates.end_time = new Date().toISOString();
      if (options?.download_url) updates.download_url = options.download_url;
      if (options?.file_size) updates.file_size = options.file_size;
    } else if (status === 'failed') {
      updates.end_time = new Date().toISOString();
      if (options?.error_message) updates.error_message = options.error_message;
    }
    
    const { data, error } = await mockSupabase
      .from('export_jobs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    return data as ExportJob;
  } catch (error) {
    console.error('Error updating export job status:', error);
    return null;
  }
};

export const exportToExcel = async (data: any[], fileName: string): Promise<Blob> => {
  const workbook = new Excel.Workbook();
  const worksheet = workbook.addWorksheet('Sheet 1');
  
  // Add headers if data exists
  if (data.length > 0) {
    const headers = Object.keys(data[0]);
    worksheet.addRow(headers);
  }
  
  // Add data rows
  data.forEach(item => {
    const values = Object.values(item);
    worksheet.addRow(values);
  });
  
  // Style the header row
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };
  
  // Return as blob
  return await workbook.xlsx.writeBuffer().then(buffer => {
    return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  });
};

export const enhancedExcelExport = async (data: ExportData, fileName: string, userId: string, tableName: string, filters?: FilterParams): Promise<string | null> => {
  try {
    // Create an export job
    const exportJob = await createExportJob(userId, tableName, filters);
    
    if (!exportJob) {
      throw new Error('Failed to create export job');
    }
    
    // Update status to processing
    await updateExportJobStatus(exportJob.id, 'processing');
    
    // Generate Excel file
    const workbook = new Excel.Workbook();
    
    // Create worksheets for each sheet in the data
    data.sheets.forEach(sheet => {
      const worksheet = workbook.addWorksheet(sheet.name);
      
      // Add headers if data exists
      if (sheet.data.length > 0) {
        const headers = Object.keys(sheet.data[0]);
        worksheet.addRow(headers);
        
        // Style the header row
        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true };
        headerRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE0E0E0' }
        };
      }
      
      // Add data rows
      sheet.data.forEach(item => {
        const values = Object.values(item);
        worksheet.addRow(values);
      });
      
      // Auto-size columns
      worksheet.columns.forEach(column => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, cell => {
          const cellValue = cell.value?.toString() || '';
          if (cellValue.length > maxLength) {
            maxLength = cellValue.length;
          }
        });
        column.width = maxLength < 10 ? 10 : maxLength + 2;
      });
    });
    
    // Generate excel file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // Save file
    saveAs(blob, fileName);
    
    // Update job status to completed
    const fileSize = blob.size;
    await updateExportJobStatus(exportJob.id, 'completed', {
      file_size: fileSize,
      download_url: fileName // In a real app, this would be a URL to download the file
    });
    
    toast.success('Export completed successfully');
    return fileName;
  } catch (error) {
    console.error('Export error:', error);
    toast.error('Failed to export data');
    return null;
  }
};

export default enhancedExcelExport;
