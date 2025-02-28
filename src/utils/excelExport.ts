
import * as XLSX from 'xlsx';

// Xüsusi tip tərifləri
interface TableData {
  schoolId: string;
  schoolName?: string;
  categoryId: string;
  categoryName?: string;
  columnId: number;
  columnName?: string;
  value: string;
}

// Məlumatları Excel formatına çevirmək
export const convertToExcelData = (
  tableData: TableData[],
  categories: { id: string; name: string }[],
  columns: { id: number; name: string; categoryId: string }[],
  schools: { id: string; name: string }[]
) => {
  // Məlumatları strukturlaşdıraq - məktəblər sətirlərdə, kategoriya və sütunlar başlıqlarda
  const excelData: any[] = [];
  
  schools.forEach(school => {
    const row: any = { 'Məktəb': school.name };
    
    categories.forEach(category => {
      const categoryColumns = columns.filter(col => col.categoryId === category.id);
      
      categoryColumns.forEach(column => {
        const headerName = `${category.name} - ${column.name}`;
        const dataCell = tableData.find(
          data => data.schoolId === school.id && 
                 data.categoryId === category.id && 
                 data.columnId === column.id
        );
        
        row[headerName] = dataCell ? dataCell.value : '';
      });
    });
    
    excelData.push(row);
  });
  
  return excelData;
};

// Məlumatları Excel faylına çevirmək və yükləmək
export const exportToExcel = (
  data: any[],
  fileName: string = 'məlumatlar',
  sheetName: string = 'Cədvəl1'
) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  
  // Faylı yükləmək
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

// Struktursuz məlumatları Excel faylına çevirmək (məsələn, admin siyahısı)
export const exportListToExcel = (
  data: any[],
  fileName: string = 'siyahı',
  sheetName: string = 'Cədvəl1'
) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  
  // Faylı yükləmək
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};
