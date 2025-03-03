
import { supabase } from "@/integrations/supabase/client";
import { ImportJob, ExportJob } from "../types";
import { toast } from "sonner";

// Create a mock implementation of the import_jobs table
// This is a workaround until we can create the actual table in the database
const mockImportJobs: ImportJob[] = [];
const mockExportJobs: ExportJob[] = [];

// Store the original from method
const originalFrom = supabase.from;

// Type assertion to avoid TypeScript errors
type AnySupabaseClient = typeof supabase & {
  from: (table: string) => any;
};

// Define a custom type for our mock implementation
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

// Override the from method with our custom implementation
(supabase as AnySupabaseClient).from = (table: string) => {
  // If accessing import_jobs or export_jobs, use our mock implementation
  if (table === 'import_jobs') {
    return {
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
              total_rows: newJob.total_rows || 0,
              processed_rows: newJob.processed_rows || 0,
              failed_rows: newJob.failed_rows || 0,
              start_time: newJob.start_time || new Date().toISOString(),
              end_time: newJob.end_time,
              error_message: newJob.error_message,
              file_name: newJob.file_name || '',
              file_size: newJob.file_size || 0,
              created_at: new Date().toISOString()
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
    } as MockQueryBuilder;
  } else if (table === 'export_jobs') {
    return {
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
              filters: newJob.filters,
              start_time: newJob.start_time || new Date().toISOString(),
              end_time: newJob.end_time,
              error_message: newJob.error_message,
              file_name: newJob.file_name || '',
              file_size: newJob.file_size,
              download_url: newJob.download_url,
              created_at: new Date().toISOString()
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
    } as any;
  }

  // Use the original implementation for all other tables
  return originalFrom(table);
};

// Helper function to properly type our mocked API calls
export const getMockSupabase = () => supabase as AnySupabaseClient;

console.log('Mock import/export tables initialized');
