
import { supabase } from "@/integrations/supabase/client";
import { ImportJob, ExportJob, ImportError } from "../types";
import { toast } from "sonner";

// Create a mock implementation of the import_jobs table
// This is a workaround until we can create the actual table in the database
const mockImportJobs: ImportJob[] = [];
const mockExportJobs: ExportJob[] = [];

// Create enhanced mock interfaces for import/export operations
interface EnhancedImportJobInterface {
  isImporting: boolean;
  progress: number;
  totalRows: number;
  processedRows: number;
  errors: ImportError[];
  importJobs: ImportJob[];
  isLoading: boolean;
  fetchImportJobs: (userId: string) => Promise<ImportJob[]>;
  createImportJob: (data: Partial<ImportJob>) => Promise<ImportJob>;
  updateImportJobStatus: (id: string, status: "pending" | "processing" | "completed" | "failed", progress: number) => Promise<ImportJob>;
  processExcelFile: (file: File) => Promise<void>;
  cancelImport: () => void;
}

// Store the original from method
const originalFrom = supabase.from;

// Type for our mock implementation
interface MockQueryBuilder {
  select: () => {
    eq: (column: string, value: any) => {
      order: () => {
        single: () => Promise<{ data: ImportJob | null; error: any }>;
        range: () => Promise<{ data: ImportJob[]; error: any }>;
      };
      single: () => Promise<{ data: ImportJob | null; error: any }>;
    };
    order: () => {
      range: () => Promise<{ data: ImportJob[]; error: any }>;
    };
  };
  insert: (newJob: Partial<ImportJob>) => {
    select: () => {
      single: () => Promise<{ data: ImportJob; error: any }>;
    };
  };
  update: (updates: Partial<ImportJob>) => {
    eq: (column: string, value: any) => {
      select: () => {
        single: () => Promise<{ data: ImportJob | null; error: any }>;
      };
    };
  };
  delete: () => {
    eq: (column: string, value: any) => {
      then: (callback: () => void) => Promise<void>;
    };
  };
}

// Create a mock instance for import_jobs
const createImportJobsMock = (): MockQueryBuilder => ({
  select: () => ({
    eq: (column: string, value: any) => ({
      order: () => ({
        single: async () => {
          const job = mockImportJobs.find(job => job[column as keyof ImportJob] === value);
          return { data: job || null, error: null };
        },
        range: async () => {
          const jobs = mockImportJobs.filter(job => job[column as keyof ImportJob] === value);
          return { data: jobs, error: null };
        }
      }),
      single: async () => {
        const job = mockImportJobs.find(job => job[column as keyof ImportJob] === value);
        return { data: job || null, error: null };
      }
    }),
    order: () => ({
      range: async () => {
        return { data: mockImportJobs, error: null };
      }
    })
  }),
  insert: (newJob: Partial<ImportJob>) => ({
    select: () => ({
      single: async () => {
        const job: ImportJob = {
          id: crypto.randomUUID(),
          userId: newJob.userId || '',
          tableName: newJob.tableName || '',
          status: newJob.status || 'pending',
          progress: newJob.progress || 0,
          totalRows: newJob.totalRows || 0,
          processedRows: newJob.processedRows || 0,
          startedAt: newJob.startedAt || new Date().toISOString(),
          completedAt: newJob.completedAt,
          fileName: newJob.fileName || '',
          fileSize: newJob.fileSize || 0,
          createdAt: new Date().toISOString(),
          errors: newJob.errors || []
        };
        mockImportJobs.push(job);
        return { data: job, error: null };
      }
    })
  }),
  update: (updates: Partial<ImportJob>) => ({
    eq: (column: string, value: any) => ({
      select: () => ({
        single: async () => {
          const index = mockImportJobs.findIndex(job => job[column as keyof ImportJob] === value);
          if (index !== -1) {
            mockImportJobs[index] = { ...mockImportJobs[index], ...updates };
            return { data: mockImportJobs[index], error: null };
          }
          return { data: null, error: { message: 'Record not found' } };
        }
      })
    })
  }),
  delete: () => ({
    eq: (column: string, value: any) => ({
      then: (callback: () => void) => {
        const index = mockImportJobs.findIndex(job => job[column as keyof ImportJob] === value);
        if (index !== -1) {
          mockImportJobs.splice(index, 1);
        }
        callback();
        return Promise.resolve();
      }
    })
  })
});

// Create a mock instance for export_jobs
const createExportJobsMock = (): any => ({
  select: () => ({
    eq: (column: string, value: any) => ({
      order: () => ({
        single: async () => {
          const job = mockExportJobs.find(job => job[column as keyof ExportJob] === value);
          return { data: job || null, error: null };
        },
        range: async () => {
          const jobs = mockExportJobs.filter(job => job[column as keyof ExportJob] === value);
          return { data: jobs, error: null };
        }
      }),
      single: async () => {
        const job = mockExportJobs.find(job => job[column as keyof ExportJob] === value);
        return { data: job || null, error: null };
      }
    }),
    order: () => ({
      range: async () => {
        return { data: mockExportJobs, error: null };
      }
    })
  }),
  insert: (newJob: Partial<ExportJob>) => ({
    select: () => ({
      single: async () => {
        const job: ExportJob = {
          id: crypto.randomUUID(),
          userId: newJob.userId || '',
          tableName: newJob.tableName || '',
          status: newJob.status || 'pending',
          filters: newJob.filters || {},
          createdAt: new Date().toISOString(),
          completedAt: newJob.completedAt,
          fileName: newJob.fileName || '',
          downloadUrl: newJob.downloadUrl
        };
        mockExportJobs.push(job);
        return { data: job, error: null };
      }
    })
  }),
  update: (updates: Partial<ExportJob>) => ({
    eq: (column: string, value: any) => ({
      select: () => ({
        single: async () => {
          const index = mockExportJobs.findIndex(job => job[column as keyof ExportJob] === value);
          if (index !== -1) {
            mockExportJobs[index] = { ...mockExportJobs[index], ...updates };
            return { data: mockExportJobs[index], error: null };
          }
          return { data: null, error: { message: 'Record not found' } };
        }
      })
    })
  }),
  delete: () => ({
    eq: (column: string, value: any) => ({
      then: (callback: () => void) => {
        const index = mockExportJobs.findIndex(job => job[column as keyof ExportJob] === value);
        if (index !== -1) {
          mockExportJobs.splice(index, 1);
        }
        callback();
        return Promise.resolve();
      }
    })
  })
});

// Mock useEnhancedExcelImport hook functionality
export const createMockImportExportInterface = (): EnhancedImportJobInterface => {
  return {
    isImporting: false,
    progress: 0,
    totalRows: 0,
    processedRows: 0,
    errors: [],
    importJobs: [],
    isLoading: false,
    fetchImportJobs: async (userId: string) => {
      return mockImportJobs.filter(job => job.userId === userId);
    },
    createImportJob: async (data: Partial<ImportJob>) => {
      const job: ImportJob = {
        id: crypto.randomUUID(),
        userId: data.userId || '',
        tableName: data.tableName || '',
        status: data.status || 'pending',
        progress: data.progress || 0,
        totalRows: data.totalRows || 0,
        processedRows: data.processedRows || 0,
        startedAt: data.startedAt || new Date().toISOString(),
        completedAt: data.completedAt,
        fileName: data.fileName || '',
        fileSize: data.fileSize || 0,
        createdAt: new Date().toISOString(),
        errors: []
      };
      mockImportJobs.push(job);
      return job;
    },
    updateImportJobStatus: async (id: string, status: "pending" | "processing" | "completed" | "failed", progress: number) => {
      const index = mockImportJobs.findIndex(job => job.id === id);
      if (index !== -1) {
        mockImportJobs[index] = { 
          ...mockImportJobs[index], 
          status, 
          progress,
          completedAt: (status === 'completed' || status === 'failed') ? new Date().toISOString() : mockImportJobs[index].completedAt
        };
        return mockImportJobs[index];
      }
      throw new Error('Job not found');
    },
    processExcelFile: async (file: File) => {
      // Mock implementation
      toast.success(`Processing file: ${file.name}`);
      return Promise.resolve();
    },
    cancelImport: () => {
      // Mock implementation
      toast.info('Import cancelled');
    }
  };
};

// Override the from method for specific tables
const originalFromFn = supabase.from;
(supabase as any).from = function(table: string) {
  if (table === 'import_jobs') {
    return createImportJobsMock();
  } else if (table === 'export_jobs') {
    return createExportJobsMock();
  }
  
  // Use the original implementation for all other tables
  return originalFromFn.call(this, table);
};

// Export a helper function to get the correctly typed mock Supabase instance
export const getMockSupabase = () => supabase;

// Export the mock interface for direct use in components
export const mockImportExportInterface = createMockImportExportInterface();

console.log('Mock import/export tables initialized');
