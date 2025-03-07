
import { FilterParams } from './common';

export interface ImportError {
  row: number;
  message: string;
}

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
  errors: Array<ImportError>;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  fileSize?: number;
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
  completedAt: string | null;
  filters: FilterParams;
  userId: string;
}
