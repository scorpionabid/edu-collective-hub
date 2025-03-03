
import { supabase } from '@/integrations/supabase/client';

// Define types for import/export jobs
export interface ImportJob {
  id: string;
  status: 'waiting' | 'processing' | 'complete' | 'error';
  progress: number;
  total_rows: number;
  processed_rows: number;
  file_name: string;
  table_name: string;
  with_upsert: boolean;
  key_field?: string;
  errors: Array<{ row: number; message: string }>;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ExportJob {
  id: string;
  status: 'waiting' | 'processing' | 'complete' | 'error';
  progress: number;
  total_rows: number;
  processed_rows: number;
  file_name: string;
  query_params: any;
  created_by: string;
  created_at: string;
  updated_at: string;
  file_url?: string;
  error_message?: string;
}

// Mock implementation for import/export tables functionality
// This is a temporary solution until proper tables are created in Supabase
let mockImportJobs: ImportJob[] = [];
let mockExportJobs: ExportJob[] = [];

// Simulate accessing and querying the import_jobs table
export const mockImportJobsTable = {
  select: () => {
    return {
      order: (_column: string, _options?: any) => {
        return {
          eq: (_column: string, _value: any) => {
            return {
              single: () => {
                return Promise.resolve({ 
                  data: mockImportJobs[0] || null,
                  error: null
                });
              },
              // Return all mock jobs
              then: (callback: (result: { data: ImportJob[] | null, error: any }) => void) => {
                callback({ data: mockImportJobs, error: null });
                return {
                  catch: () => {}
                };
              }
            };
          },
          // Return all mock jobs
          then: (callback: (result: { data: ImportJob[] | null, error: any }) => void) => {
            callback({ data: mockImportJobs, error: null });
            return {
              catch: () => {}
            };
          }
        };
      },
      eq: (_column: string, _value: any) => {
        return {
          single: () => {
            return Promise.resolve({ 
              data: mockImportJobs[0] || null,
              error: null
            });
          },
          // Return filtered mock jobs (simplified)
          then: (callback: (result: { data: ImportJob[] | null, error: any }) => void) => {
            callback({ data: mockImportJobs, error: null });
            return {
              catch: () => {}
            };
          }
        };
      },
      // Default selection behavior
      then: (callback: (result: { data: ImportJob[] | null, error: any }) => void) => {
        callback({ data: mockImportJobs, error: null });
        return {
          catch: () => {}
        };
      }
    };
  },
  insert: (newJob: Partial<ImportJob>) => {
    const job: ImportJob = {
      id: crypto.randomUUID(),
      status: 'waiting',
      progress: 0,
      total_rows: 0,
      processed_rows: 0,
      file_name: newJob.file_name || '',
      table_name: newJob.table_name || '',
      with_upsert: newJob.with_upsert || false,
      key_field: newJob.key_field,
      errors: [],
      created_by: newJob.created_by || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...newJob
    };
    
    mockImportJobs.push(job);
    
    return {
      select: () => {
        return {
          single: () => {
            return Promise.resolve({ data: job, error: null });
          }
        };
      }
    };
  },
  update: (updates: Partial<ImportJob>) => {
    return {
      eq: (column: string, value: any) => {
        if (column === 'id') {
          const index = mockImportJobs.findIndex(job => job.id === value);
          if (index >= 0) {
            mockImportJobs[index] = {
              ...mockImportJobs[index],
              ...updates,
              updated_at: new Date().toISOString()
            };
          }
        }
        
        return {
          select: () => {
            return {
              single: () => {
                const job = mockImportJobs.find(job => job.id === value);
                return Promise.resolve({ 
                  data: job || null,
                  error: null
                });
              }
            };
          }
        };
      }
    };
  }
};

// Simulate accessing and querying the export_jobs table
export const mockExportJobsTable = {
  select: () => {
    return {
      order: (_column: string, _options?: any) => {
        return {
          eq: (_column: string, _value: any) => {
            return {
              single: () => {
                return Promise.resolve({ 
                  data: mockExportJobs[0] || null,
                  error: null
                });
              },
              then: (callback: (result: { data: ExportJob[] | null, error: any }) => void) => {
                callback({ data: mockExportJobs, error: null });
                return {
                  catch: () => {}
                };
              }
            };
          },
          then: (callback: (result: { data: ExportJob[] | null, error: any }) => void) => {
            callback({ data: mockExportJobs, error: null });
            return {
              catch: () => {}
            };
          }
        };
      },
      eq: (_column: string, _value: any) => {
        return {
          single: () => {
            return Promise.resolve({ 
              data: mockExportJobs[0] || null,
              error: null
            });
          },
          then: (callback: (result: { data: ExportJob[] | null, error: any }) => void) => {
            callback({ data: mockExportJobs, error: null });
            return {
              catch: () => {}
            };
          }
        };
      },
      then: (callback: (result: { data: ExportJob[] | null, error: any }) => void) => {
        callback({ data: mockExportJobs, error: null });
        return {
          catch: () => {}
        };
      }
    };
  },
  insert: (newJob: Partial<ExportJob>) => {
    const job: ExportJob = {
      id: crypto.randomUUID(),
      status: 'waiting',
      progress: 0,
      total_rows: 0,
      processed_rows: 0,
      file_name: newJob.file_name || '',
      query_params: newJob.query_params || {},
      created_by: newJob.created_by || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...newJob
    };
    
    mockExportJobs.push(job);
    
    return {
      select: () => {
        return {
          single: () => {
            return Promise.resolve({ data: job, error: null });
          }
        };
      }
    };
  },
  update: (updates: Partial<ExportJob>) => {
    return {
      eq: (column: string, value: any) => {
        if (column === 'id') {
          const index = mockExportJobs.findIndex(job => job.id === value);
          if (index >= 0) {
            mockExportJobs[index] = {
              ...mockExportJobs[index],
              ...updates,
              updated_at: new Date().toISOString()
            };
          }
        }
        
        return {
          select: () => {
            return {
              single: () => {
                const job = mockExportJobs.find(job => job.id === value);
                return Promise.resolve({ 
                  data: job || null,
                  error: null
                });
              }
            };
          }
        };
      }
    };
  }
};

// Override supabase.from to handle mock tables
const originalFrom = supabase.from;
supabase.from = function(table: string) {
  if (table === 'import_jobs') {
    return mockImportJobsTable as any;
  } else if (table === 'export_jobs') {
    return mockExportJobsTable as any;
  }
  return originalFrom.call(this, table);
};
