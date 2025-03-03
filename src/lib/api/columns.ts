import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Column } from "./types";

interface RPCResponse<T> {
  data: T;
  error: any;
}

export const columns = {
  getAll: async (categoryId: string) => {
    try {
      // Use rpc function instead of direct table query with proper type assertion
      const response = await supabase.rpc('get_columns_by_category', { category_id: categoryId }) as unknown as RPCResponse<any[]>;
      const { data, error } = response;
      
      if (error) {
        console.error('Error fetching columns:', error);
        throw error;
      }
      
      // Transform the data to match the expected Column type
      return Array.isArray(data) ? data.map((column: any) => ({
        id: column.id,
        name: column.name,
        type: column.type,
        categoryId: column.category_id,
        required: column.required,
        options: column.options,
        description: column.description
      })) : [];
    } catch (error) {
      console.error('Error in getAll columns:', error);
      return [];
    }
  },
  
  // Alias for getAll to keep compatibility
  getByCategoryId: async (categoryId: string) => {
    return columns.getAll(categoryId);
  },
  
  create: async (column: Omit<Column, 'id'>) => {
    try {
      // Use rpc function instead of direct table insert with proper type assertion
      const response = await supabase.rpc('create_column', {
          column_name: column.name,
          column_type: column.type,
          category_id: column.categoryId
        }) as unknown as RPCResponse<any>;
      const { data, error } = response;
      
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
          categoryId: data.category_id,
          required: data.required,
          options: data.options,
          description: data.description
        };
      }
      
      return {
        id: "0",
        name: column.name,
        type: column.type,
        categoryId: column.categoryId,
        required: column.required,
        options: column.options,
        description: column.description
      };
    } catch (error) {
      console.error('Error in create column:', error);
      toast.error('Failed to create column');
      return {
        id: "0",
        name: column.name,
        type: column.type,
        categoryId: column.categoryId,
        required: column.required,
        options: column.options,
        description: column.description
      };
    }
  },
  
  update: async (id: string, column: Partial<Column>) => {
    try {
      // Use rpc function instead of direct table update with proper type assertion
      const updateData: Record<string, any> = { column_id: id };
      if (column.name !== undefined) updateData.column_name = column.name;
      if (column.type !== undefined) updateData.column_type = column.type;
      if (column.required !== undefined) updateData.required = column.required;
      if (column.options !== undefined) updateData.options = column.options;
      if (column.description !== undefined) updateData.description = column.description;
      
      const response = await supabase.rpc('update_column', updateData) as unknown as RPCResponse<any>;
      const { data, error } = response;
      
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
          categoryId: data.category_id,
          required: data.required,
          options: data.options,
          description: data.description
        };
      }
      
      return {
        id,
        name: column.name || "Column",
        type: column.type || "text",
        categoryId: column.categoryId || "0",
        required: column.required,
        options: column.options,
        description: column.description
      };
    } catch (error) {
      console.error('Error in update column:', error);
      toast.error('Failed to update column');
      return {
        id,
        name: column.name || "Column",
        type: column.type || "text",
        categoryId: column.categoryId || "0",
        required: column.required,
        options: column.options,
        description: column.description
      };
    }
  },
  
  delete: async (id: string) => {
    try {
      // Use rpc function instead of direct table delete with proper type assertion
      const response = await supabase.rpc('delete_column', { column_id: id }) as unknown as RPCResponse<any>;
      const { error } = response;
      
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
