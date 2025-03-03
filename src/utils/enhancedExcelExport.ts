
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { ExportJob, FilterParams } from '@/lib/api/types';
import { toast } from 'sonner';
import { mockImportExportTables } from '@/lib/api/mock/importExportTables';

// Enhanced Excel export with job tracking
export const createExportJob = async (
  tableName: string,
  fileName: string,
  filters: FilterParams = {}
): Promise<ExportJob> => {
  try {
    // Get current user
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    // Using mock implementation since the table doesn't exist yet
    const job = await mockImportExportTables.createExportJob({
      userId,
      tableName,
      fileName,
      filters,
      downloadUrl: ''
    });
    
    toast.success('Export job created successfully');
    return job;
  } catch (error) {
    console.error('Error creating export job:', error);
    toast.error('Failed to create export job');
    throw error;
  }
};

// Get all export jobs for the current user
export const getExportJobs = async (): Promise<ExportJob[]> => {
  try {
    // Use our mock implementation
    return await mockImportExportTables.getExportJobs();
  } catch (error) {
    console.error('Error fetching export jobs:', error);
    toast.error('Failed to fetch export jobs');
    return [];
  }
};

// Get a specific export job by ID
export const getExportJobById = async (id: string): Promise<ExportJob | null> => {
  try {
    // Use our mock implementation
    return await mockImportExportTables.getExportJobById(id);
  } catch (error) {
    console.error(`Error fetching export job ${id}:`, error);
    toast.error('Failed to fetch export job details');
    return null;
  }
};

// Update an export job status
export const updateExportJobStatus = async (
  id: string, 
  status: 'pending' | 'processing' | 'completed' | 'failed',
  downloadUrl?: string
): Promise<ExportJob | null> => {
  try {
    // Use our mock implementation
    return await mockImportExportTables.updateExportJob(id, { 
      status, 
      ...(downloadUrl && { downloadUrl }) 
    });
  } catch (error) {
    console.error(`Error updating export job ${id}:`, error);
    toast.error('Failed to update export job');
    return null;
  }
};
