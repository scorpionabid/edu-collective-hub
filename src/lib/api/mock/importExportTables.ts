
import { supabase } from "@/integrations/supabase/client";
import { ImportJob, ExportJob } from "../types";
import { v4 as uuidv4 } from 'uuid';

// This file mocks the import/export tables functionality
// It provides mock implementations for Supabase operations on import_jobs and export_jobs tables
// which don't actually exist in the database
 
// Mock database for storing jobs 
const mockDB = {
  importJobs: [] as ImportJob[],
  exportJobs: [] as ExportJob[]
};

// Original from method to be preserved
const originalFrom = supabase.from.bind(supabase);

// Overriding the from method to handle our mock tables
supabase.from = ((table: string) => {
  // Handle the special case for mock tables
  if (table === 'import_jobs') {
    return createMockImportJobsQueryBuilder();
  } else if (table === 'export_jobs') {
    return createMockExportJobsQueryBuilder();
  }
  
  // Use the original method for other tables
  return originalFrom(table as any);
}) as any;

// Create a mock QueryBuilder for import_jobs table
function createMockImportJobsQueryBuilder() {
  return {
    select: () => ({
      eq: (column: string, value: any) => ({
        order: (column: string, { ascending = true } = {}) => ({
          limit: (limit: number) => ({
            single: () => Promise.resolve({ 
              data: mockDB.importJobs.find(job => job.id === value) || null, 
              error: null 
            }),
            range: (start: number, end: number) => Promise.resolve({ 
              data: mockDB.importJobs
                .filter(job => job.id === value)
                .slice(start, end + 1), 
              error: null 
            })
          }),
        }),
      }),
      range: (start: number, end: number) => Promise.resolve({ 
        data: mockDB.importJobs.slice(start, end + 1), 
        error: null 
      }),
    }),
    insert: (data: Partial<ImportJob>) => ({
      select: () => {
        const newJob: ImportJob = {
          id: uuidv4(),
          userId: data.userId || 'unknown',
          tableName: data.tableName || '',
          fileName: data.fileName || '',
          fileSize: data.fileSize || 0,
          totalRows: data.totalRows || 0,
          processedRows: data.processedRows || 0,
          status: data.status || 'pending',
          progress: data.progress || 0,
          startedAt: data.startedAt || new Date().toISOString(),
          completedAt: data.completedAt || null,
          createdAt: new Date().toISOString(),
          errors: data.errors || []
        };
        mockDB.importJobs.push(newJob);
        return Promise.resolve({ data: newJob, error: null });
      }
    }),
    update: (data: Partial<ImportJob>) => ({
      eq: (column: string, value: any) => {
        const index = mockDB.importJobs.findIndex(job => job.id === value);
        if (index >= 0) {
          mockDB.importJobs[index] = { ...mockDB.importJobs[index], ...data };
          return Promise.resolve({ 
            data: mockDB.importJobs[index], 
            error: null 
          });
        }
        return Promise.resolve({ 
          data: null, 
          error: { message: 'Job not found' } 
        });
      }
    }),
    delete: () => ({
      eq: (column: string, value: any) => {
        const index = mockDB.importJobs.findIndex(job => job.id === value);
        if (index >= 0) {
          mockDB.importJobs.splice(index, 1);
          return Promise.resolve({ data: null, error: null });
        }
        return Promise.resolve({ 
          data: null, 
          error: { message: 'Job not found' } 
        });
      }
    })
  };
}

// Create a mock QueryBuilder for export_jobs table
function createMockExportJobsQueryBuilder() {
  return {
    select: () => ({
      eq: (column: string, value: any) => ({
        order: (column: string, { ascending = true } = {}) => ({
          limit: (limit: number) => ({
            single: () => Promise.resolve({ 
              data: mockDB.exportJobs.find(job => job.id === value) || null, 
              error: null 
            }),
            range: (start: number, end: number) => Promise.resolve({ 
              data: mockDB.exportJobs
                .filter(job => job.id === value)
                .slice(start, end + 1), 
              error: null 
            })
          }),
        }),
      }),
      range: (start: number, end: number) => Promise.resolve({ 
        data: mockDB.exportJobs.slice(start, end + 1), 
        error: null 
      }),
    }),
    insert: (data: Partial<ExportJob>) => ({
      select: () => {
        const newJob: ExportJob = {
          id: uuidv4(),
          userId: data.userId || 'unknown',
          tableName: data.tableName || '',
          fileName: data.fileName || '',
          status: data.status || 'pending',
          createdAt: new Date().toISOString(),
          completedAt: data.completedAt || null,
          filters: data.filters || {},
          downloadUrl: data.downloadUrl
        };
        mockDB.exportJobs.push(newJob);
        return Promise.resolve({ data: newJob, error: null });
      }
    }),
    update: (data: Partial<ExportJob>) => ({
      eq: (column: string, value: any) => {
        const index = mockDB.exportJobs.findIndex(job => job.id === value);
        if (index >= 0) {
          mockDB.exportJobs[index] = { ...mockDB.exportJobs[index], ...data };
          return Promise.resolve({ 
            data: mockDB.exportJobs[index], 
            error: null 
          });
        }
        return Promise.resolve({ 
          data: null, 
          error: { message: 'Job not found' } 
        });
      }
    }),
    delete: () => ({
      eq: (column: string, value: any) => {
        const index = mockDB.exportJobs.findIndex(job => job.id === value);
        if (index >= 0) {
          mockDB.exportJobs.splice(index, 1);
          return Promise.resolve({ data: null, error: null });
        }
        return Promise.resolve({ 
          data: null, 
          error: { message: 'Job not found' } 
        });
      }
    })
  };
}

// Export utility function to use in tests
export const getMockImportJobs = () => mockDB.importJobs;
export const getMockExportJobs = () => mockDB.exportJobs;
