
// Mock implementation for import/export tables
import { supabase } from '@/integrations/supabase/client';
import { ImportJob, ExportJob } from '@/lib/monitoring/types';

// This is a mock implementation since the import_jobs and export_jobs tables
// don't exist in the supabase schema
const importJobs: Record<string, ImportJob> = {};
const exportJobs: Record<string, ExportJob> = {};

// Mock the fetch function for import jobs
const originalFrom = supabase.from.bind(supabase);
supabase.from = (table: string) => {
  if (table === 'import_jobs') {
    return {
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: null }),
          order: () => ({
            limit: async () => ({ data: Object.values(importJobs), error: null })
          })
        }),
        order: () => ({
          limit: async () => ({ data: Object.values(importJobs), error: null })
        })
      }),
      insert: async (data: any) => {
        const id = crypto.randomUUID();
        const job = { ...data, id };
        importJobs[id] = job as ImportJob;
        return { data: job, error: null };
      },
      update: async (data: any) => {
        if (data.id && importJobs[data.id]) {
          importJobs[data.id] = { ...importJobs[data.id], ...data };
          return { data: importJobs[data.id], error: null };
        }
        return { data: null, error: 'Job not found' };
      }
    } as any;
  } else if (table === 'export_jobs') {
    return {
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: null }),
          order: () => ({
            limit: async () => ({ data: Object.values(exportJobs), error: null })
          })
        }),
        order: () => ({
          limit: async () => ({ data: Object.values(exportJobs), error: null })
        })
      }),
      insert: async (data: any) => {
        const id = crypto.randomUUID();
        const job = { ...data, id };
        exportJobs[id] = job as ExportJob;
        return { data: job, error: null };
      },
      update: async (data: any) => {
        if (data.id && exportJobs[data.id]) {
          exportJobs[data.id] = { ...exportJobs[data.id], ...data };
          return { data: exportJobs[data.id], error: null };
        }
        return { data: null, error: 'Job not found' };
      }
    } as any;
  }

  return originalFrom(table);
};

console.log('Import/Export tables mock initialized');
