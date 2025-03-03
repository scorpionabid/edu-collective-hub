
import { FilterParams } from './common';

export interface ImportJob {
  id: string;
  status: 'waiting' | 'processing' | 'complete' | 'error';
  progress: number;
  totalRows: number;
  processedRows: number;
  fileName: string;
  tableName: string;
  withUpsert: boolean;
  keyField?: string;
  errors: Array<{ row: number; message: string }>;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  // Mapping properties for frontend-backend compatibility
  created_at?: string;
  processed_rows?: number;
  total_rows?: number;
  file_name?: string;
  userId?: string;
}

export interface ExportJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  totalRows: number;
  processedRows: number;
  fileName: string;
  queryParams: any;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  fileUrl?: string;
  errorMessage?: string;
  tableName: string;
  downloadUrl: string;
  completedAt: string;
  filters: FilterParams;
  userId: string;
}
