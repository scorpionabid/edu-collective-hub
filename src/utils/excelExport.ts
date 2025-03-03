
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ExportOptions } from '@/lib/api/types';

/**
 * Exports data to Excel format and triggers browser download
 * @param data Array of objects to export
 * @param columns Array of column names to include
 * @param fileName Name of the output file (without extension)
 * @param options Additional export options
 */
export const exportToExcel = async (
  data: any[], 
  columns: string[], 
  fileName: string, 
  options?: Partial<ExportOptions>
) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(options?.sheetName || 'Sheet 1');
  
  // Format columns with headers if requested
  if (options?.includeHeaders !== false) {
    const headerRow = worksheet.addRow(
      columns.map(col => {
        // Handle complex column names or use the column name directly
        const label = typeof col === 'object' ? col.label || col.name : col;
        return label.charAt(0).toUpperCase() + label.slice(1).replace(/([A-Z])/g, ' $1');
      })
    );
    
    // Apply header styling if provided
    if (options?.headerStyle) {
      headerRow.eachCell(cell => {
        Object.assign(cell, options.headerStyle);
      });
    }
  }
  
  // Add data rows
  data.forEach(item => {
    const rowData = columns.map(col => {
      // Handle nested properties
      if (typeof col === 'string' && col.includes('.')) {
        return col.split('.').reduce((obj, key) => obj && obj[key] !== undefined ? obj[key] : '', item);
      }
      
      const colName = typeof col === 'object' ? col.name : col;
      return item[colName] !== undefined ? item[colName] : '';
    });
    
    const row = worksheet.addRow(rowData);
    
    // Apply cell styling if provided
    if (options?.cellStyle) {
      row.eachCell(cell => {
        Object.assign(cell, options.cellStyle);
      });
    }
  });
  
  // Auto-fit columns
  worksheet.columns.forEach(column => {
    const lengths = column.values?.filter(v => v !== undefined).map(v => v.toString().length) || [];
    const maxLength = Math.max(...lengths, 10);
    column.width = maxLength + 2;
  });
  
  // Generate the Excel file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `${fileName}.xlsx`);
  
  return { success: true };
};

// The following functions are used by ExcelExportButton
export const startExcelExport = async (tableId: string, filters = {}) => {
  try {
    const { data: authUser } = await supabase.auth.getUser();
    const userId = authUser?.user?.id;

    if (!userId) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('export_jobs')
      .insert({
        status: 'waiting',
        table_name: tableId,
        query_params: filters,
        created_by: userId,
        progress: 0,
        processed_rows: 0,
        total_rows: 0,
        file_name: `${tableId}_export_${new Date().toISOString().split('T')[0]}.xlsx`
      })
      .select()
      .single();

    if (error) throw error;
    
    return { 
      success: true, 
      jobId: data.id 
    };
  } catch (error: any) {
    console.error('Failed to start export:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

export const checkExportStatus = async (jobId: string) => {
  try {
    const { data, error } = await supabase
      .from('export_jobs')
      .select('*')
      .eq('id', jobId)
      .single();
      
    if (error) throw error;
    
    if (data.status === 'complete' && data.file_url) {
      return {
        success: true,
        status: data.status,
        progress: data.progress,
        fileUrl: data.file_url
      };
    } else if (data.status === 'error') {
      return {
        success: false,
        error: data.error_message || 'Export failed'
      };
    } else {
      return {
        success: true,
        status: data.status,
        progress: data.progress,
        processed: data.processed_rows,
        total: data.total_rows
      };
    }
  } catch (error: any) {
    console.error('Failed to check export status:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

export const downloadExportedFile = async (fileUrl: string) => {
  try {
    window.open(fileUrl, '_blank');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to download file:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

// Better naming for export list function (replacing exportListToExcel)
export { exportToExcel as exportListToExcel };
