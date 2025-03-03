
import { v4 as uuidv4 } from 'uuid';
import { ImportJob, ExportJob, FilterParams } from '../types';

// Mock data for import/export operations
const mockImportJobs: ImportJob[] = [];
const mockExportJobs: ExportJob[] = [];

// Mock implementations
export const mockImportExportTables = {
  // Import jobs
  getImportJobs: async (): Promise<ImportJob[]> => {
    return [...mockImportJobs];
  },
  
  getImportJobById: async (id: string): Promise<ImportJob | null> => {
    const job = mockImportJobs.find(job => job.id === id);
    return job ? { ...job } : null;
  },
  
  createImportJob: async (data: Omit<ImportJob, 'id' | 'createdAt' | 'status' | 'progress'>): Promise<ImportJob> => {
    const newJob: ImportJob = {
      id: uuidv4(),
      userId: data.userId,
      tableName: data.tableName,
      fileName: data.fileName,
      fileSize: data.fileSize,
      totalRows: data.totalRows,
      processedRows: 0,
      status: 'pending',
      progress: 0,
      startedAt: new Date().toISOString(),
      completedAt: null,
      createdAt: new Date().toISOString(),
      errors: []
    };
    
    mockImportJobs.push(newJob);
    return { ...newJob };
  },
  
  updateImportJob: async (id: string, data: Partial<ImportJob>): Promise<ImportJob | null> => {
    const index = mockImportJobs.findIndex(job => job.id === id);
    if (index === -1) return null;
    
    const updatedJob = {
      ...mockImportJobs[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    mockImportJobs[index] = updatedJob;
    return { ...updatedJob };
  },
  
  // Export jobs
  getExportJobs: async (): Promise<ExportJob[]> => {
    return [...mockExportJobs];
  },
  
  getExportJobById: async (id: string): Promise<ExportJob | null> => {
    const job = mockExportJobs.find(job => job.id === id);
    return job ? { ...job } : null;
  },
  
  createExportJob: async (data: Omit<ExportJob, 'id' | 'createdAt' | 'status'>): Promise<ExportJob> => {
    const newJob: ExportJob = {
      id: uuidv4(),
      userId: data.userId,
      tableName: data.tableName,
      fileName: data.fileName,
      status: 'pending',
      createdAt: new Date().toISOString(),
      completedAt: null,
      filters: data.filters || {},
      downloadUrl: data.downloadUrl
    };
    
    mockExportJobs.push(newJob);
    return { ...newJob };
  },
  
  updateExportJob: async (id: string, data: Partial<ExportJob>): Promise<ExportJob | null> => {
    const index = mockExportJobs.findIndex(job => job.id === id);
    if (index === -1) return null;
    
    const updatedJob = {
      ...mockExportJobs[index],
      ...data
    };
    
    mockExportJobs[index] = updatedJob;
    return { ...updatedJob };
  }
};

// Use this when you need to mock Supabase responses
export const getMockSupabaseResponse = () => {
  return {
    data: mockImportJobs,
    error: null
  };
};
