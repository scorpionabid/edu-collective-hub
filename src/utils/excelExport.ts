
import { Column } from '@/lib/api/types';
import * as XLSX from 'xlsx';

// Helper to create column headers
const createHeaders = (columns: Column[] | string): string[] => {
  if (Array.isArray(columns)) {
    return columns.map(col => col.name);
  }
  return [columns];
};

// Helper to transform row data for excel
const transformRow = (row: any, columns: Column[] | string): any[] => {
  if (Array.isArray(columns)) {
    return columns.map(col => {
      const value = row[col.name] || row.data?.[col.name] || '';
      return value;
    });
  }
  return [row[columns] || ''];
};

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

export const exportToExcel = (data: any[], columns: Column[] | string, fileName: string = 'export') => {
  try {
    console.log(`Starting export of ${data.length} rows`);
    const startTime = performance.now();
    
    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet([]);
    
    // Add headers
    const headers = createHeaders(columns);
    XLSX.utils.sheet_add_aoa(ws, [headers], { origin: 'A1' });
    
    // Process rows in batches (5000 rows per batch)
    const BATCH_SIZE = 5000;
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
    
    return true;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    return false;
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
  
  // Create column list
  const columns = Object.values(columnMap).map(name => ({ name, type: 'text' }));
  
  // Export
  exportToExcel(excelData, columns, fileName);
};
