
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Column } from "./types";

export const columns = {
  getAll: async (categoryId: string) => {
    try {
      const { data, error } = await supabase
        .from('columns')
        .select('*')
        .eq('category_id', categoryId);
      
      if (error) {
        console.error('Error fetching columns:', error);
        throw error;
      }
      
      return data?.map(column => ({
        id: column.id,
        name: column.name,
        type: column.type,
        categoryId: column.category_id
      })) || [];
    } catch (error) {
      console.error('Error in getAll columns:', error);
      return [];
    }
  },
  
  create: async (column: Omit<Column, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('columns')
        .insert({
          name: column.name,
          type: column.type,
          category_id: column.categoryId
        })
        .select('*')
        .single();
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Column created successfully');
      return data ? {
        id: data.id,
        name: data.name,
        type: data.type,
        categoryId: data.category_id
      } : {
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
      const updateData: any = {};
      if (column.name) updateData.name = column.name;
      if (column.type) updateData.type = column.type;
      
      const { data, error } = await supabase
        .from('columns')
        .update(updateData)
        .eq('id', id)
        .select('*')
        .single();
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Column updated successfully');
      return data ? {
        id: data.id,
        name: data.name,
        type: data.type,
        categoryId: data.category_id
      } : {
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
      const { error } = await supabase
        .from('columns')
        .delete()
        .eq('id', id);
      
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
