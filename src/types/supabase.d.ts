
import { SupabaseClient } from '@supabase/supabase-js';

declare module '@supabase/supabase-js' {
  interface SupabaseClient {
    rpc<T = any>(
      fn: string,
      params?: object,
      options?: {
        head?: boolean;
        count?: null | 'exact' | 'planned' | 'estimated';
      }
    ): Promise<{
      data: T;
      error: Error | null;
      count: number | null;
      status: number;
      statusText: string;
    }>;
  }
}
