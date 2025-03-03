
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Category } from "./types";

interface RPCResponse<T> {
  data: T;
  error: any;
}

export const categories = {
  getAll: async () => {
    try {
      // Use the rpc function with proper type assertion
      const response = await supabase.rpc('get_categories_with_columns') as unknown as RPCResponse<any[]>;
      const { data, error } = response;
      
      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }
      
      // Transform data to match the expected Category type
      return Array.isArray(data) ? data.map((category: any) => ({
        id: category.id,
        name: category.name,
        regionId: category.region_id,
        sectorId: category.sector_id,
        schoolId: category.school_id,
        columns: Array.isArray(category.columns) 
          ? category.columns.map((column: any) => ({
              id: column.id,
              name: column.name,
              type: column.type,
              categoryId: column.category_id
            })) 
          : []
      })) : [];
    } catch (error) {
      console.error('Error in getAll categories:', error);
      return [];
    }
  },
  
  getById: async (id: string) => {
    try {
      // Use rpc function with proper type assertion
      const response = await supabase.rpc('get_category_by_id', { category_id: id }) as unknown as RPCResponse<any[]>;
      const { data, error } = response;
      
      if (error) {
        console.error('Error fetching category:', error);
        throw error;
      }
      
      if (!data || !Array.isArray(data) || data.length === 0) {
        return null;
      }
      
      // Transform data to match the expected Category type
      const category = data[0];
      return {
        id: category.id,
        name: category.name,
        regionId: category.region_id,
        sectorId: category.sector_id,
        schoolId: category.school_id,
        columns: Array.isArray(category.columns)
          ? category.columns.map((column: any) => ({
              id: column.id,
              name: column.name,
              type: column.type,
              categoryId: column.category_id
            }))
          : []
      };
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
      // Use rpc function with proper type assertion
      const response = await supabase.rpc('create_category', {
        category_name: category.name,
        region_id: category.regionId,
        sector_id: category.sectorId,
        school_id: category.schoolId
      }) as unknown as RPCResponse<any>;
      const { data, error } = response;
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Category created successfully');
      
      if (data) {
        return {
          id: data.id, 
          name: data.name, 
          columns: [],
          regionId: data.region_id || "",
          sectorId: data.sector_id || "",
          schoolId: data.school_id || "" 
        };
      }
      
      return { 
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
      // Use rpc function with proper type assertion
      const updateData: Record<string, any> = { category_id: id };
      if (category.name !== undefined) updateData.category_name = category.name;
      if (category.regionId !== undefined) updateData.region_id = category.regionId;
      if (category.sectorId !== undefined) updateData.sector_id = category.sectorId;
      if (category.schoolId !== undefined) updateData.school_id = category.schoolId;

      const response = await supabase.rpc('update_category', updateData) as unknown as RPCResponse<any>;
      const { data, error } = response;
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Category updated successfully');
      
      if (data) {
        return { 
          id: data.id, 
          name: data.name, 
          columns: [],
          regionId: data.region_id || "",
          sectorId: data.sector_id || "",
          schoolId: data.school_id || "" 
        };
      }
      
      return { 
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
      // Use rpc function with proper type assertion
      const response = await supabase.rpc('delete_category', { category_id: id }) as unknown as RPCResponse<any>;
      const { error } = response;
      
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
