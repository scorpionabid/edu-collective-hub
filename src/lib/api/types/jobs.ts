
import { Json } from '@/integrations/supabase/types';

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
