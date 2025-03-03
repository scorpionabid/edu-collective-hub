
import { supabase } from "@/integrations/supabase/client";
import { ImportJob, ExportJob } from "../types";

// Create a mock implementation for import_jobs
export const mockImportJobsTable = () => {
  // Override the Supabase from method to handle "import_jobs" table
  const originalFrom = supabase.from;
  supabase.from = (table: string) => {
    if (table === 'import_jobs') {
      return {
        select: () => ({
          eq: () => ({
            order: () => ({
              limit: () => ({
                single: async () => {
                  return {
                    data: {
                      id: 'mock-job-id',
                      userId: 'user-123',
                      tableName: 'categories',
                      fileName: 'categories.xlsx',
                      fileSize: 1024,
                      totalRows: 100,
                      processedRows: 50,
                      status: 'processing',
                      progress: 50,
                      startedAt: new Date().toISOString(),
                      completedAt: null,
                      createdAt: new Date().toISOString(),
                      errors: []
                    } as ImportJob,
                    error: null
                  };
                },
                range: async () => {
                  return {
                    data: [{
                      id: 'mock-job-id',
                      userId: 'user-123',
                      tableName: 'categories',
                      fileName: 'categories.xlsx',
                      fileSize: 1024,
                      totalRows: 100,
                      processedRows: 50,
                      status: 'processing',
                      progress: 50,
                      startedAt: new Date().toISOString(),
                      completedAt: null,
                      createdAt: new Date().toISOString(),
                      errors: []
                    } as ImportJob],
                    error: null
                  };
                }
              })
            })
          }),
          range: async () => {
            return {
              data: [{
                id: 'mock-job-id',
                userId: 'user-123',
                tableName: 'categories',
                fileName: 'categories.xlsx',
                fileSize: 1024,
                totalRows: 100,
                processedRows: 50,
                status: 'processing',
                progress: 50,
                startedAt: new Date().toISOString(),
                completedAt: null,
                createdAt: new Date().toISOString(),
                errors: []
              } as ImportJob],
              error: null
            };
          }
        }),
        insert: () => ({
          select: () => ({
            single: async () => {
              return {
                data: {
                  id: 'mock-job-id',
                  userId: 'user-123',
                  tableName: 'categories',
                  fileName: 'categories.xlsx',
                  fileSize: 1024,
                  totalRows: 100,
                  processedRows: 0,
                  status: 'pending',
                  progress: 0,
                  startedAt: null,
                  completedAt: null,
                  createdAt: new Date().toISOString(),
                  errors: []
                } as ImportJob,
                error: null
              };
            }
          })
        }),
        update: () => ({
          eq: () => ({
            select: () => ({
              single: async () => {
                return {
                  data: {
                    id: 'mock-job-id',
                    userId: 'user-123',
                    tableName: 'categories',
                    fileName: 'categories.xlsx',
                    fileSize: 1024,
                    totalRows: 100,
                    processedRows: 100,
                    status: 'completed',
                    progress: 100,
                    startedAt: new Date().toISOString(),
                    completedAt: new Date().toISOString(),
                    createdAt: new Date().toISOString(),
                    errors: []
                  } as ImportJob,
                  error: null
                };
              }
            })
          })
        })
      };
    } else if (table === 'export_jobs') {
      return {
        select: () => ({
          eq: () => ({
            order: () => ({
              limit: () => ({
                single: async () => {
                  return {
                    data: {
                      id: 'mock-export-id',
                      userId: 'user-123',
                      tableName: 'categories',
                      fileName: 'categories_export.xlsx',
                      status: 'completed',
                      createdAt: new Date().toISOString(),
                      completedAt: new Date().toISOString(),
                      filters: {},
                      downloadUrl: 'https://example.com/download'
                    } as ExportJob,
                    error: null
                  };
                }
              })
            })
          }),
          range: async () => {
            return {
              data: [{
                id: 'mock-export-id',
                userId: 'user-123',
                tableName: 'categories',
                fileName: 'categories_export.xlsx',
                status: 'completed',
                createdAt: new Date().toISOString(),
                completedAt: new Date().toISOString(),
                filters: {},
                downloadUrl: 'https://example.com/download'
              } as ExportJob],
              error: null
            };
          }
        }),
        insert: () => ({
          select: () => ({
            single: async () => {
              return {
                data: {
                  id: 'mock-export-id',
                  userId: 'user-123',
                  tableName: 'categories',
                  fileName: 'categories_export.xlsx',
                  status: 'pending',
                  createdAt: new Date().toISOString(),
                  completedAt: null,
                  filters: {},
                  downloadUrl: null
                } as ExportJob,
                error: null
              };
            }
          })
        })
      };
    }
    return originalFrom(table);
  };
};

// Initialize the mock tables
mockImportJobsTable();
