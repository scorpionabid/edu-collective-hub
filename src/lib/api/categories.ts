
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Category } from "./types";

export const categories = {
  getAll: async () => {
    try {
      const { data, error } = await supabase.rpc('get_categories');
      
      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getAll categories:', error);
      // Fallback to an empty array if the RPC doesn't exist
      return [];
    }
  },
  
  getById: async (id: string) => {
    try {
      const { data, error } = await supabase.rpc('get_category_by_id', { 
        category_id: id 
      });
      
      if (error) {
        console.error('Error fetching category:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error in getById category:', error);
      // Return dummy data if the RPC doesn't exist yet
      return { id, name: "Category", columns: [] };
    }
  },
  
  create: async (category: Omit<Category, 'id' | 'columns'>) => {
    try {
      const { data, error } = await supabase.rpc('create_category', { 
        category_name: category.name,
        region_id: category.regionId || null,
        sector_id: category.sectorId || null,
        school_id: category.schoolId || null
      });
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Category created successfully');
      return data ? { ...data, columns: [] } : { id: "0", name: category.name, columns: [] };
    } catch (error) {
      console.error('Error in create category:', error);
      toast.error('Failed to create category');
      // Return a placeholder value
      return { id: "0", name: category.name, columns: [] };
    }
  },
  
  update: async (id: string, category: Partial<Category>) => {
    try {
      const { data, error } = await supabase.rpc('update_category', {
        category_id: id,
        category_name: category.name || ''
      });
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Category updated successfully');
      return data || { id, name: category.name || "Category", columns: [] };
    } catch (error) {
      console.error('Error in update category:', error);
      toast.error('Failed to update category');
      return { id, name: category.name || "Category", columns: [] };
    }
  },
  
  delete: async (id: string) => {
    try {
      const { error } = await supabase.rpc('delete_category', { 
        category_id: id 
      });
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Category deleted successfully');
    } catch (error) {
      console.error('Error in delete category:', error);
      toast.error('Failed to delete category');
    }
  }
};
