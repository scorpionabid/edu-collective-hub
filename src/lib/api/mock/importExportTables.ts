
import { ImportJob, ExportJob } from '../types';
import { supabase } from '@/integrations/supabase/client';

// Create a mock function that mimics the Supabase API for import/export jobs
export const getMockSupabase = () => {
  return {
    from: (table: string) => {
      if (table === 'import_jobs' || table === 'export_jobs') {
        return {
          select: () => ({
            eq: (column: string, value: any) => ({
              order: (column: string, { ascending = true } = {}) => ({
                limit: (num: number) => ({
                  single: () => Promise.resolve({ 
                    data: createMockJob(table, value), 
                    error: null 
                  }),
                  range: (start: number, end: number) => Promise.resolve({ 
                    data: createMockJobs(table, 10), 
                    error: null 
                  })
                }),
              }),
            }),
            range: (start: number, end: number) => Promise.resolve({ 
              data: createMockJobs(table, end - start + 1), 
              error: null 
            })
          }),
          insert: (data: any) => ({
            select: () => ({
              single: () => Promise.resolve({ 
                data: { 
                  id: crypto.randomUUID(), 
                  ...data, 
                  created_at: new Date().toISOString() 
                }, 
                error: null 
              })
            })
          }),
          update: (data: any) => ({
            eq: (column: string, value: any) => ({
              select: () => ({
                single: () => Promise.resolve({ 
                  data: { 
                    id: value, 
                    ...data, 
                    updated_at: new Date().toISOString() 
                  }, 
                  error: null 
                })
              })
            })
          }),
          delete: () => ({
            eq: (column: string, value: any) => Promise.resolve({ error: null })
          })
        };
      }
      
      // Otherwise, use the real Supabase client
      return supabase.from(table);
    }
  };
};

// Helper function to create a mock job
function createMockJob(table: string, id: string): ImportJob | ExportJob {
  if (table === 'import_jobs') {
    return {
      id,
      userId: crypto.randomUUID(),
      tableName: 'schools',
      fileName: 'schools_import.xlsx',
      fileSize: 1024 * 1024 * 2, // 2 MB
      totalRows: 100,
      processedRows: 75,
      status: Math.random() > 0.7 ? 'completed' : Math.random() > 0.5 ? 'processing' : 'pending',
      progress: 75,
      startedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
      completedAt: Math.random() > 0.7 ? new Date().toISOString() : null,
      createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
      errors: []
    } as ImportJob;
  } else {
    return {
      id,
      userId: crypto.randomUUID(),
      tableName: 'schools',
      fileName: 'schools_export.xlsx',
      status: Math.random() > 0.7 ? 'completed' : Math.random() > 0.5 ? 'processing' : 'pending',
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      completedAt: Math.random() > 0.7 ? new Date().toISOString() : null,
      filters: {},
      downloadUrl: Math.random() > 0.7 ? 'https://example.com/download/schools_export.xlsx' : undefined
    } as ExportJob;
  }
}

// Helper function to create multiple mock jobs
function createMockJobs(table: string, count: number): ImportJob[] | ExportJob[] {
  if (table === 'import_jobs') {
    return Array(count).fill(0).map(() => 
      createMockJob(table, crypto.randomUUID()) as ImportJob
    );
  } else {
    return Array(count).fill(0).map(() => 
      createMockJob(table, crypto.randomUUID()) as ExportJob
    );
  }
}

// Create a mock implementation of the import/export API
export const importExportTables = {
  // Import jobs
  getImportJobs: async (): Promise<ImportJob[]> => {
    const mockJobs = createMockJobs('import_jobs', 10) as ImportJob[];
    return mockJobs;
  },
  
  getImportJob: async (id: string): Promise<ImportJob> => {
    return createMockJob('import_jobs', id) as ImportJob;
  },
  
  createImportJob: async (data: { tableName: string, fileName: string, fileSize: number, totalRows: number }): Promise<ImportJob> => {
    const mockJob: ImportJob = {
      id: crypto.randomUUID(),
      userId: (await supabase.auth.getUser()).data.user?.id || 'anonymous',
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
    
    // Simulate processing
    setTimeout(() => {
      // This would update the job status in a real implementation
      console.log(`Started processing import job ${mockJob.id}`);
    }, 1000);
    
    return mockJob;
  },
  
  // Export jobs
  getExportJobs: async (): Promise<ExportJob[]> => {
    return createMockJobs('export_jobs', 10) as ExportJob[];
  },
  
  getExportJob: async (id: string): Promise<ExportJob> => {
    return createMockJob('export_jobs', id) as ExportJob;
  },
  
  createExportJob: async (data: { tableName: string, filters?: any }): Promise<ExportJob> => {
    const mockJob: ExportJob = {
      id: crypto.randomUUID(),
      userId: (await supabase.auth.getUser()).data.user?.id || 'anonymous',
      tableName: data.tableName,
      fileName: `${data.tableName}_export_${Date.now()}.xlsx`,
      status: 'pending',
      createdAt: new Date().toISOString(),
      completedAt: null,
      filters: data.filters || {}
    };
    
    // Simulate processing
    setTimeout(() => {
      // This would update the job status in a real implementation
      console.log(`Started processing export job ${mockJob.id}`);
    }, 1000);
    
    return mockJob;
  }
};
