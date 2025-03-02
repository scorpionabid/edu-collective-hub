
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Column } from "./types";

export const columns = {
  getAll: async (categoryId: string) => {
    try {
      const { data, error } = await supabase.rpc('get_columns_by_category', { 
        category_id: categoryId 
      });
      
      if (error) {
        console.error('Error fetching columns:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getAll columns:', error);
      // Return empty array if RPC doesn't exist
      return [];
    }
  },
  
  create: async (column: Omit<Column, 'id'>) => {
    try {
      const { data, error } = await supabase.rpc('create_column', {
        column_name: column.name,
        column_type: column.type,
        category_id: column.categoryId
      });
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Column created successfully');
      return data as Column || {
        id: "0",
        name: column.name,
        type: column.type,
        categoryId: column.categoryId
      };
    } catch (error) {
      console.error('Error in create column:', error);
      toast.error('Failed to create column');
      // Return a placeholder value
      return {
        id: "0",
        name: column.name,
        type: column.type,
        categoryId: column.categoryId
      };
    }
  },
  
  update: async (id: string, column: Partial<Column>) => {
    try {
      const { data, error } = await supabase.rpc('update_column', {
        column_id: id,
        column_name: column.name || '',
        column_type: column.type || ''
      });
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Column updated successfully');
      return data as Column || {
        id,
        name: column.name || "Column",
        type: column.type || "text",
        categoryId: column.categoryId || "0"
      };
    } catch (error) {
      console.error('Error in update column:', error);
      toast.error('Failed to update column');
      return {
        id,
        name: column.name || "Column",
        type: column.type || "text",
        categoryId: column.categoryId || "0"
      };
    }
  },
  
  delete: async (id: string) => {
    try {
      const { error } = await supabase.rpc('delete_column', { 
        column_id: id 
      });
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Column deleted successfully');
    } catch (error) {
      console.error('Error in delete column:', error);
      toast.error('Failed to delete column');
    }
  }
};
