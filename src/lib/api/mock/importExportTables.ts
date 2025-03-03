
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

// Provide mock functions for Supabase RPC compatibility
export const getMockSupabase = () => {
  return {
    from: (tableName: string) => {
      if (tableName === 'import_jobs') {
        return {
          select: () => ({
            eq: () => ({
              single: async () => ({ data: mockImportJobs[0], error: null })
            }),
            order: () => ({
              data: mockImportJobs,
              error: null
            })
          }),
          insert: (data: any) => {
            const newJob = {
              id: uuidv4(),
              ...data,
              created_at: new Date().toISOString()
            };
            mockImportJobs.push(newJob as unknown as ImportJob);
            return { data: newJob, error: null };
          },
          update: (data: any) => {
            const index = mockImportJobs.findIndex(job => job.id === data.id);
            if (index !== -1) {
              mockImportJobs[index] = { ...mockImportJobs[index], ...data } as ImportJob;
              return { data: mockImportJobs[index], error: null };
            }
            return { data: null, error: { message: 'Job not found' } };
          }
        };
      } else if (tableName === 'export_jobs') {
        return {
          select: () => ({
            eq: () => ({
              single: async () => ({ data: mockExportJobs[0], error: null })
            }),
            order: () => ({
              data: mockExportJobs,
              error: null
            })
          }),
          insert: (data: any) => {
            const newJob = {
              id: uuidv4(),
              ...data,
              created_at: new Date().toISOString()
            };
            mockExportJobs.push(newJob as unknown as ExportJob);
            return { data: newJob, error: null };
          },
          update: (data: any) => {
            const index = mockExportJobs.findIndex(job => job.id === data.id);
            if (index !== -1) {
              mockExportJobs[index] = { ...mockExportJobs[index], ...data } as ExportJob;
              return { data: mockExportJobs[index], error: null };
            }
            return { data: null, error: { message: 'Job not found' } };
          }
        };
      }
      return {
        select: () => ({ data: [], error: null })
      };
    },
    rpc: (functionName: string, params: any) => {
      // Mock RPC functions related to import/export operations
      if (functionName === 'get_import_jobs') {
        return { data: mockImportJobs, error: null };
      } else if (functionName === 'get_export_jobs') {
        return { data: mockExportJobs, error: null };
      }
      return { data: null, error: { message: 'RPC function not found' } };
    }
  };
};
