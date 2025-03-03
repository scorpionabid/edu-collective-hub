
export interface ImportError {
  row: number;
  column: string;
  message: string;
}

export interface ImportJob {
  id: string;
  userId: string;
  tableName: string;
  fileName: string;
  fileSize: number;
  totalRows: number;
  processedRows: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  startedAt: string;
  completedAt: string | null;
  createdAt: string;
  errors: ImportError[];
}

export interface ExportJob {
  id: string;
  userId: string;
  tableName: string;
  fileName: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  completedAt: string | null;
  filters: FilterParams;
  downloadUrl?: string;
}

// Import the FilterParams type
import { FilterParams } from './common';
