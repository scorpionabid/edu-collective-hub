
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Column } from "./types";

export const columns = {
  getAll: async (categoryId: string) => {
    try {
      // Use rpc function instead of direct table query
      const { data, error } = await supabase
        .rpc('get_columns_by_category', { category_id: categoryId });
      
      if (error) {
        console.error('Error fetching columns:', error);
        throw error;
      }
      
      // Transform the data to match the expected Column type
      return Array.isArray(data) ? data.map((column: any) => ({
        id: column.id,
        name: column.name,
        type: column.type,
        categoryId: column.category_id
      })) : [];
    } catch (error) {
      console.error('Error in getAll columns:', error);
      return [];
    }
  },
  
  create: async (column: Omit<Column, 'id'>) => {
    try {
      // Use rpc function instead of direct table insert
      const { data, error } = await supabase
        .rpc('create_column', {
          column_name: column.name,
          column_type: column.type,
          category_id: column.categoryId
        });
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Column created successfully');
      
      if (data) {
        return {
          id: data.id,
          name: data.name,
          type: data.type,
          categoryId: data.category_id
        };
      }
      
      return {
        id: "0",
        name: column.name,
        type: column.type,
        categoryId: column.categoryId
      };
    } catch (error) {
      console.error('Error in create column:', error);
      toast.error('Failed to create column');
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
      // Use rpc function instead of direct table update
      const updateData: Record<string, any> = { column_id: id };
      if (column.name !== undefined) updateData.column_name = column.name;
      if (column.type !== undefined) updateData.column_type = column.type;
      
      const { data, error } = await supabase
        .rpc('update_column', updateData);
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Column updated successfully');
      
      if (data) {
        return {
          id: data.id,
          name: data.name,
          type: data.type,
          categoryId: data.category_id
        };
      }
      
      return {
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
      // Use rpc function instead of direct table delete
      const { error } = await supabase
        .rpc('delete_column', { column_id: id });
      
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
