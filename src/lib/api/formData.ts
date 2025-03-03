
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FormData } from "./types";

export const formData = {
  getAll: async () => {
    try {
      // Use stored procedure instead of direct table query
      const { data, error } = await supabase
        .rpc('get_all_form_data');
      
      if (error) {
        console.error('Error fetching all form data:', error);
        throw error;
      }
      
      // Transform the response to match the expected FormData type
      return Array.isArray(data) ? data.map(item => ({
        id: item.id,
        categoryId: item.category_id,
        schoolId: item.school_id,
        data: item.data,
        status: item.status,
        submittedAt: item.submitted_at,
        approvedAt: item.approved_at,
        approvedBy: item.approved_by
      })) : [];
    } catch (error) {
      console.error('Error in getAll form data:', error);
      return [];
    }
  },
  
  getByCategory: async (categoryId: string) => {
    try {
      // Use stored procedure instead of direct table query
      const { data, error } = await supabase
        .rpc('get_form_data_by_category', { 
          category_id: categoryId 
        });
      
      if (error) {
        console.error('Error fetching form data by category:', error);
        throw error;
      }
      
      if (!data || !Array.isArray(data) || data.length === 0) {
        return [];
      }
      
      // Transform the response to match the expected FormData type
      return data.map(item => ({
        id: item.id,
        categoryId: item.category_id,
        schoolId: item.school_id,
        data: item.data,
        status: item.status,
        submittedAt: item.submitted_at,
        approvedAt: item.approved_at,
        approvedBy: item.approved_by
      }));
    } catch (error) {
      console.error('Error in getByCategory form data:', error);
      return [];
    }
  },
  
  getById: async (id: string) => {
    try {
      // Use stored procedure instead of direct table query
      const { data, error } = await supabase
        .rpc('get_form_data_by_id', { 
          form_data_id: id 
        });
      
      if (error) {
        console.error('Error fetching form data by ID:', error);
        throw error;
      }
      
      if (!data) {
        return null;
      }
      
      // Transform the response to match the expected FormData type
      return {
        id: data.id,
        categoryId: data.category_id,
        schoolId: data.school_id,
        data: data.data,
        status: data.status,
        submittedAt: data.submitted_at,
        approvedAt: data.approved_at,
        approvedBy: data.approved_by
      };
    } catch (error) {
      console.error('Error in getById form data:', error);
      return {
        id,
        categoryId: "",
        schoolId: "",
        data: {},
        status: "draft"
      };
    }
  },
  
  create: async (formData: Omit<FormData, 'id'>) => {
    try {
      // Use stored procedure instead of direct table insert
      const { data, error } = await supabase
        .rpc('create_form_data', {
          category_id: formData.categoryId,
          school_id: formData.schoolId,
          form_data: formData.data,
          status: formData.status
        });
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Form data created successfully');
      
      if (data) {
        return {
          id: data.id,
          categoryId: data.category_id,
          schoolId: data.school_id,
          data: data.data,
          status: data.status,
          submittedAt: data.submitted_at,
          approvedAt: data.approved_at,
          approvedBy: data.approved_by
        };
      }
      
      return {
        id: "0",
        categoryId: formData.categoryId,
        schoolId: formData.schoolId,
        data: formData.data,
        status: formData.status
      };
    } catch (error) {
      console.error('Error in create form data:', error);
      toast.error('Failed to create form data');
      return {
        id: "0",
        categoryId: formData.categoryId,
        schoolId: formData.schoolId,
        data: formData.data,
        status: formData.status
      };
    }
  },
  
  update: async (id: string, formData: Partial<FormData>) => {
    try {
      // Use stored procedure instead of direct table update
      const updateData: Record<string, any> = { form_data_id: id };
      if (formData.data !== undefined) updateData.form_data = formData.data;
      if (formData.status !== undefined) updateData.status = formData.status;
      
      const { data, error } = await supabase
        .rpc('update_form_data', updateData);
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Form data updated successfully');
      
      if (data) {
        return {
          id: data.id,
          categoryId: data.category_id,
          schoolId: data.school_id,
          data: data.data,
          status: data.status,
          submittedAt: data.submitted_at,
          approvedAt: data.approved_at,
          approvedBy: data.approved_by
        };
      }
      
      return {
        id,
        categoryId: formData.categoryId || "",
        schoolId: formData.schoolId || "",
        data: formData.data || {},
        status: formData.status || "draft"
      };
    } catch (error) {
      console.error('Error in update form data:', error);
      toast.error('Failed to update form data');
      return {
        id,
        categoryId: formData.categoryId || "",
        schoolId: formData.schoolId || "",
        data: formData.data || {},
        status: formData.status || "draft"
      };
    }
  },
  
  delete: async (id: string) => {
    try {
      // Use stored procedure instead of direct table delete
      const { error } = await supabase
        .rpc('delete_form_data', { form_data_id: id });
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Form data deleted successfully');
    } catch (error) {
      console.error('Error in delete form data:', error);
      toast.error('Failed to delete form data');
    }
  }
};
