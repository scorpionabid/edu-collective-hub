
import * as XLSX from 'xlsx';
import { Entity, AdminUser, NewAdmin } from '@/components/users/types';

export interface ImportedSchool {
  name: string;
  region?: string;
  sector?: string;
}

export interface ImportedAdmin {
  firstName: string;
  lastName: string;
  email: string;
  utisCode: string;
  phone: string;
  password?: string;
  type: string;
  entityName: string;
}

export const importSchoolsFromExcel = (file: File): Promise<ImportedSchool[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Assumes the first sheet contains the data
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);
        
        // Map to expected format
        const schools: ImportedSchool[] = jsonData.map(row => ({
          name: row.name || row.Name || row.NAME || '',
          region: row.region || row.Region || row.REGION,
          sector: row.sector || row.Sector || row.SECTOR
        })).filter(school => school.name);
        
        resolve(schools);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

export const importAdminsFromExcel = (file: File): Promise<ImportedAdmin[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Assumes the first sheet contains the data
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);
        
        // Map to expected format
        const admins: ImportedAdmin[] = jsonData.map(row => ({
          firstName: row.firstName || row.FirstName || row['First Name'] || '',
          lastName: row.lastName || row.LastName || row['Last Name'] || '',
          email: row.email || row.Email || row.EMAIL || '',
          utisCode: row.utisCode || row.UtisCode || row.UTIS || row['UTIS Code'] || '',
          phone: row.phone || row.Phone || row.PHONE || '',
          password: row.password || row.Password || row.PASSWORD || 'password123', // Default password
          type: (row.type || row.Type || row.TYPE || 'schooladmin').toLowerCase(),
          entityName: row.entityName || row.EntityName || row.entity || row.Entity || row['Entity Name'] || ''
        })).filter(admin => admin.firstName && admin.lastName && admin.email);
        
        resolve(admins);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

export const downloadExcelTemplate = (type: 'schools' | 'admins') => {
  let headers: string[];
  let sampleData: any[];
  
  if (type === 'schools') {
    headers = ['name', 'region', 'sector'];
    sampleData = [
      { name: 'Məktəb 1', region: 'Bakı', sector: 'Sektor 1' },
      { name: 'Məktəb 2', region: 'Sumqayıt', sector: 'Sektor 2' }
    ];
  } else {
    headers = ['firstName', 'lastName', 'email', 'utisCode', 'phone', 'password', 'type', 'entityName'];
    sampleData = [
      { firstName: 'İmran', lastName: 'Əliyev', email: 'imran@example.com', utisCode: 'IM123', phone: '+994501234567', password: 'password123', type: 'schooladmin', entityName: 'Məktəb 1' },
      { firstName: 'Leyla', lastName: 'Məmmədova', email: 'leyla@example.com', utisCode: 'LE456', phone: '+994551234567', password: 'password123', type: 'regionadmin', entityName: 'Bakı' }
    ];
  }
  
  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
  
  // Create and download the file
  XLSX.writeFile(workbook, `${type}_template.xlsx`);
};
