import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { ExportOptions } from '@/lib/api/types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Function to convert data to Excel format
export const convertToExcelData = (data: any[], headers: string[]): any[][] => {
  const excelData: any[][] = [headers];
  data.forEach(item => {
    const row: any[] = headers.map(header => item[header] || '');
    excelData.push(row);
  });
  return excelData;
};

// Function to export data to Excel
export const exportToExcel = async (
  data: any[],
  headers: string[],
  options: ExportOptions = {}
): Promise<void> => {
  const { fileName = 'data.xlsx', sheetName = 'Sheet1' } = options;

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName);

  // Add headers
  sheet.addRow(headers);

  // Add data rows
  data.forEach(item => {
    const row = headers.map(header => item[header] || '');
    sheet.addRow(row);
  });

  // Generate Excel file
  const buffer = await workbook.xlsx.writeBuffer();

  // Save the file
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, fileName);
};

// Function to start the Excel export job
export const startExcelExport = async (
  tableName: string,
  queryParams: any,
  options: ExportOptions = {}
): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('export_jobs')
      .insert({
        table_name: tableName,
        query_params: queryParams,
        file_name: options.fileName || `${tableName}_${new Date().toISOString()}.xlsx`,
        status: 'waiting',
        progress: 0,
        total_rows: 0,
        processed_rows: 0,
        created_by: supabase.auth.user()?.id,
      })
      .select('id')
      .single();

    if (error) {
      toast.error(`Failed to start export: ${error.message}`);
      return null;
    }

    toast.success('Export started successfully!');
    return data.id;
  } catch (error: any) {
    toast.error(`Unexpected error starting export: ${error.message}`);
    return null;
  }
};

// Function to check the export status
export const checkExportStatus = async (jobId: string): Promise<any> => {
  try {
    const { data, error } = await supabase
      .from('export_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error) {
      console.error('Error checking export status:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error checking export status:', error);
    return null;
  }
};

// Function to download the exported file
export const downloadExportedFile = (job: any): void => {
  if (job?.status === 'complete' && job?.file_url) {
    const link = document.createElement('a');
    link.href = job.file_url;
    link.download = job.file_name || 'exported_data.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('File downloaded successfully!');
  } else if (job?.status === 'error') {
    toast.error(`Export failed: ${job?.error_message || 'Unknown error'}`);
  } else {
    toast.info(`Export is in progress: ${job?.processed_rows || 0} / ${job?.total_rows || 0} rows processed.`);
  }
};
