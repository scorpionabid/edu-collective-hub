
import * as XLSX from 'xlsx';

export interface ImportedSchool {
  name: string;
  code?: string;
  address?: string;
  phone?: string;
  email?: string;
  directorName?: string;
}

export interface ImportedAdmin {
  firstName: string;
  lastName: string;
  email: string;
  utisCode: string;
  phone: string;
  type: string;
  entityName: string;
}

// Excel faylından məktəbləri import etmək
export const importSchoolsFromExcel = async (file: File): Promise<ImportedSchool[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Birinci vərəqi götürürük
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // JSON formatına çevirmək
        const jsonData = XLSX.utils.sheet_to_json<ImportedSchool>(worksheet);
        
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => reject(error);
    
    reader.readAsArrayBuffer(file);
  });
};

// Excel faylından adminləri import etmək
export const importAdminsFromExcel = async (file: File): Promise<ImportedAdmin[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Birinci vərəqi götürürük
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // JSON formatına çevirmək
        const jsonData = XLSX.utils.sheet_to_json<ImportedAdmin>(worksheet);
        
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => reject(error);
    
    reader.readAsArrayBuffer(file);
  });
};

// Excel nümunəsini yükləmək
export const downloadExcelTemplate = (type: 'schools' | 'admins') => {
  let data: any[];
  let fileName: string;
  
  if (type === 'schools') {
    data = [
      {
        name: 'Məktəb adı',
        code: 'Kod',
        address: 'Ünvan',
        phone: 'Telefon',
        email: 'Email',
      }
    ];
    fileName = 'mektebler-numune';
  } else {
    data = [
      {
        firstName: 'Ad',
        lastName: 'Soyad',
        email: 'Email',
        utisCode: 'UTIS kodu',
        phone: 'Telefon',
        type: 'Tip (regionadmin, sectoradmin, schooladmin)',
        entityName: 'Qurumun adı',
      }
    ];
    fileName = 'adminler-numune';
  }
  
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Nümunə');
  
  // Faylı yükləmək
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};
