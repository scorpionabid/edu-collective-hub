
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getReadableErrorMessage } from '../utils/errorFormatter';

/**
 * Submits validated data to a Supabase table
 * @param tableName The Supabase table to insert into
 * @param dataToSubmit The validated data to submit
 * @returns Object with the result and any response data
 */
export async function submitToSupabase(
  tableName: string,
  dataToSubmit: any
): Promise<{ success: boolean; data?: any; error?: any }> {
  try {
    // Submit to Supabase
    const { data, error } = await supabase
      .from(tableName as any)
      .insert(dataToSubmit)
      .select()
      .single();
    
    if (error) {
      console.error(`Form submission error (${tableName}):`, error);
      return { success: false, error };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error(`Unexpected error during submission to ${tableName}:`, error);
    return { success: false, error };
  }
}

/**
 * Updates an existing record in a Supabase table
 * @param tableName The Supabase table to update
 * @param id The ID of the record to update
 * @param updateData The data to update
 * @returns Object with the result and any response data
 */
export async function updateSupabaseRecord(
  tableName: string,
  id: string,
  updateData: any
): Promise<{ success: boolean; data?: any; error?: any }> {
  try {
    const { data, error } = await supabase
      .from(tableName as any)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error(`Form update error (${tableName}):`, error);
      return { success: false, error };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error(`Unexpected error during update to ${tableName}:`, error);
    return { success: false, error };
  }
}
