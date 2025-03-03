
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FormData } from "./types";

export const formData = {
  getAll: async () => {
    try {
      // Use stored procedure instead of direct table query
      const { data, error } = await supabase
        .rpc('get_all_form_data') as { data: any, error: any };
      
      if (error) {
        console.error('Error fetching all form data:', error);
        throw error;
      }
      
      // Transform the response to match the expected FormData type
      return Array.isArray(data) ? data.map((item: any) => ({
        id: item.id,
        categoryId: item.categoryId,
        schoolId: item.schoolId,
        data: item.data,
        status: item.status,
        submittedAt: item.submittedAt,
        approvedAt: item.approvedAt,
        approvedBy: item.approvedBy
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
        }) as { data: any, error: any };
      
      if (error) {
        console.error('Error fetching form data by category:', error);
        throw error;
      }
      
      if (!data || !Array.isArray(data) || data.length === 0) {
        return [];
      }
      
      // Transform the response to match the expected FormData type
      return data.map((item: any) => ({
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
          form_id: id 
        }) as { data: any, error: any };
      
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
        categoryId: data.categoryId,
        schoolId: data.schoolId,
        data: data.data,
        status: data.status,
        submittedAt: data.submittedAt,
        approvedAt: data.approvedAt,
        approvedBy: data.approvedBy
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
        .rpc('submit_form_data', {
          category_id: formData.categoryId,
          school_id: formData.schoolId,
          form_data: formData.data,
          form_status: formData.status
        }) as { data: any, error: any };
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Form data created successfully');
      
      if (data) {
        return {
          id: data.id,
          categoryId: data.categoryId,
          schoolId: data.schoolId,
          data: data.data,
          status: data.status,
          submittedAt: data.submittedAt,
          approvedAt: data.approvedAt,
          approvedBy: data.approvedBy
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
      const updateData: Record<string, any> = { form_id: id };
      if (formData.data !== undefined) updateData.form_data = formData.data;
      if (formData.status !== undefined) updateData.form_status = formData.status;
      
      const { data, error } = await supabase
        .rpc('update_form_data', updateData) as { data: any, error: any };
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Form data updated successfully');
      
      if (data) {
        return {
          id: data.id,
          categoryId: data.categoryId,
          schoolId: data.schoolId,
          data: data.data,
          status: data.status,
          submittedAt: data.submittedAt,
          approvedAt: data.approvedAt,
          approvedBy: data.approvedBy
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
        .rpc('delete_form_data', { form_data_id: id }) as { data: any, error: any };
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Form data deleted successfully');
    } catch (error) {
      console.error('Error in delete form data:', error);
      toast.error('Failed to delete form data');
    }
  },

  // Add missing methods for workflow operations
  submit: async (id: string) => {
    try {
      const { data, error } = await supabase
        .rpc('submit_form_data', { form_data_id: id }) as { data: any, error: any };
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Form data submitted successfully');
      
      if (data) {
        return {
          id: data.id,
          categoryId: data.categoryId,
          schoolId: data.schoolId,
          data: data.data,
          status: data.status,
          submittedAt: data.submittedAt,
          approvedAt: data.approvedAt,
          approvedBy: data.approvedBy
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error submitting form data:', error);
      toast.error('Failed to submit form data');
      return null;
    }
  },
  
  approve: async (id: string, approvedBy: string) => {
    try {
      const { data, error } = await supabase
        .rpc('approve_form_data', { 
          form_data_id: id,
          approved_by_id: approvedBy
        }) as { data: any, error: any };
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Form data approved successfully');
      
      if (data) {
        return {
          id: data.id,
          categoryId: data.categoryId,
          schoolId: data.schoolId,
          data: data.data,
          status: data.status,
          submittedAt: data.submittedAt,
          approvedAt: data.approvedAt,
          approvedBy: data.approvedBy
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error approving form data:', error);
      toast.error('Failed to approve form data');
      return null;
    }
  },
  
  reject: async (id: string, reason: string) => {
    try {
      const { data, error } = await supabase
        .rpc('reject_form_data', { 
          form_data_id: id,
          rejection_reason: reason
        }) as { data: any, error: any };
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Form data rejected');
      
      if (data) {
        return {
          id: data.id,
          categoryId: data.categoryId,
          schoolId: data.schoolId,
          data: data.data,
          status: data.status,
          submittedAt: data.submittedAt,
          approvedAt: data.approvedAt,
          approvedBy: data.approvedBy
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error rejecting form data:', error);
      toast.error('Failed to reject form data');
      return null;
    }
  }
};
