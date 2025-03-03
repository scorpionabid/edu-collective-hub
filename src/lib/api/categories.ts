
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Category } from "./types";

export const categories = {
  getAll: async () => {
    try {
      // Use RPC function call with explicit typing if available
      // If not, explicitly cast the return type
      const { data, error } = await supabase
        .from('categories')
        .select('*, columns(*)');
      
      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }
      
      return data?.map(category => ({
        id: category.id,
        name: category.name,
        regionId: category.region_id,
        sectorId: category.sector_id,
        schoolId: category.school_id,
        columns: category.columns?.map(column => ({
          id: column.id,
          name: column.name,
          type: column.type,
          categoryId: column.category_id
        })) || []
      })) || [];
    } catch (error) {
      console.error('Error in getAll categories:', error);
      return [];
    }
  },
  
  getById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*, columns(*)')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching category:', error);
        throw error;
      }
      
      return data ? {
        id: data.id,
        name: data.name,
        regionId: data.region_id,
        sectorId: data.sector_id,
        schoolId: data.school_id,
        columns: data.columns?.map(column => ({
          id: column.id,
          name: column.name,
          type: column.type,
          categoryId: column.category_id
        })) || []
      } : null;
    } catch (error) {
      console.error('Error in getById category:', error);
      return { 
        id, 
        name: "Category", 
        columns: [],
        regionId: "",
        sectorId: "",
        schoolId: "" 
      };
    }
  },
  
  create: async (category: Omit<Category, 'id' | 'columns'>) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: category.name,
          region_id: category.regionId,
          sector_id: category.sectorId,
          school_id: category.schoolId
        })
        .select('*')
        .single();
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Category created successfully');
      return data ? { 
        id: data.id, 
        name: data.name, 
        regionId: data.region_id,
        sectorId: data.sector_id,
        schoolId: data.school_id,
        columns: [] 
      } : { 
        id: "0", 
        name: category.name, 
        columns: [],
        regionId: category.regionId || "",
        sectorId: category.sectorId || "",
        schoolId: category.schoolId || "" 
      };
    } catch (error) {
      console.error('Error in create category:', error);
      toast.error('Failed to create category');
      return { 
        id: "0", 
        name: category.name, 
        columns: [],
        regionId: category.regionId || "",
        sectorId: category.sectorId || "",
        schoolId: category.schoolId || "" 
      };
    }
  },
  
  update: async (id: string, category: Partial<Category>) => {
    try {
      const updateData: any = {};
      if (category.name) updateData.name = category.name;
      if (category.regionId) updateData.region_id = category.regionId;
      if (category.sectorId) updateData.sector_id = category.sectorId;
      if (category.schoolId) updateData.school_id = category.schoolId;

      const { data, error } = await supabase
        .from('categories')
        .update(updateData)
        .eq('id', id)
        .select('*')
        .single();
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Category updated successfully');
      return data ? { 
        id: data.id, 
        name: data.name, 
        regionId: data.region_id,
        sectorId: data.sector_id,
        schoolId: data.school_id,
        columns: [] 
      } : { 
        id, 
        name: category.name || "Category", 
        columns: [],
        regionId: category.regionId || "",
        sectorId: category.sectorId || "",
        schoolId: category.schoolId || "" 
      };
    } catch (error) {
      console.error('Error in update category:', error);
      toast.error('Failed to update category');
      return { 
        id, 
        name: category.name || "Category", 
        columns: [],
        regionId: category.regionId || "",
        sectorId: category.sectorId || "",
        schoolId: category.schoolId || "" 
      };
    }
  },
  
  delete: async (id: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      
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
