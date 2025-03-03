
import { supabase } from '@/integrations/supabase/client';

/**
 * This is a temporary mock solution for handling import/export jobs without creating actual tables.
 * In production, you would need to create actual import_jobs and export_jobs tables in Supabase.
 */

// Mock storage for jobs
const mockImportJobs = new Map();
const mockExportJobs = new Map();

export const mockImportJobsTable = {
  async insert(data) {
    const id = data.id || crypto.randomUUID();
    const job = { ...data, id };
    mockImportJobs.set(id, job);
    return { data: job, error: null };
  },
  
  async select() {
    return {
      eq(field, value) {
        return {
          single() {
            const job = Array.from(mockImportJobs.values())
              .find(job => job[field] === value);
            return { data: job, error: job ? null : { message: 'Not found' } };
          },
          order() {
            return {
              limit(limit) {
                const jobs = Array.from(mockImportJobs.values())
                  .filter(job => job[field] === value)
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .slice(0, limit);
                return { data: jobs, error: null };
              }
            };
          }
        };
      },
      order() {
        return {
          limit(limit) {
            const jobs = Array.from(mockImportJobs.values())
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .slice(0, limit);
            return { data: jobs, error: null };
          }
        };
      }
    };
  },
  
  async update(data) {
    return {
      eq(field, value) {
        const job = Array.from(mockImportJobs.values())
          .find(job => job[field] === value);
        
        if (!job) {
          return { data: null, error: { message: 'Not found' } };
        }
        
        const updatedJob = { ...job, ...data };
        mockImportJobs.set(job.id, updatedJob);
        return { data: updatedJob, error: null };
      }
    };
  }
};

export const mockExportJobsTable = {
  async insert(data) {
    const id = data.id || crypto.randomUUID();
    const job = { ...data, id };
    mockExportJobs.set(id, job);
    return { data: job, error: null };
  },
  
  async select() {
    return {
      eq(field, value) {
        return {
          single() {
            const job = Array.from(mockExportJobs.values())
              .find(job => job[field] === value);
            return { data: job, error: job ? null : { message: 'Not found' } };
          }
        };
      }
    };
  },
  
  async update(data) {
    return {
      eq(field, value) {
        const job = Array.from(mockExportJobs.values())
          .find(job => job[field] === value);
        
        if (!job) {
          return { data: null, error: { message: 'Not found' } };
        }
        
        const updatedJob = { ...job, ...data };
        mockExportJobs.set(job.id, updatedJob);
        return { data: updatedJob, error: null };
      }
    };
  }
};

// Monkey patch the supabase instance to handle these tables
const originalFrom = supabase.from.bind(supabase);
supabase.from = function(table) {
  if (table === 'import_jobs') {
    return mockImportJobsTable;
  } else if (table === 'export_jobs') {
    return mockExportJobsTable;
  }
  return originalFrom(table);
};
