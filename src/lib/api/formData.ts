
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FormData } from "./types";

export const formData = {
  getAll: async (schoolId?: string) => {
    try {
      // Use rpc function instead of direct table query
      let rpcFunction = 'get_all_form_data';
      let params: Record<string, any> = {};
      
      if (schoolId) {
        rpcFunction = 'get_form_data_by_school';
        params = { school_id: schoolId };
      }
      
      const { data, error } = await supabase
        .rpc(rpcFunction, params);
      
      if (error) {
        console.error('Error fetching form data:', error);
        throw error;
      }
      
      // Transform the data to match the expected FormData type
      return Array.isArray(data) ? data.map(entry => ({
        id: entry.id,
        categoryId: entry.category_id,
        schoolId: entry.school_id,
        data: entry.data,
        status: entry.status,
        submittedAt: entry.submitted_at,
        approvedAt: entry.approved_at,
        approvedBy: entry.approved_by
      })) : [];
    } catch (error) {
      console.error('Error in getAll formData:', error);
      return [];
    }
  },
  
  getById: async (id: string) => {
    try {
      // Use rpc function instead of direct table query
      const { data, error } = await supabase
        .rpc('get_form_data_by_id', { form_id: id });
      
      if (error) {
        console.error('Error fetching form data:', error);
        throw error;
      }
      
      if (!data || !Array.isArray(data) || data.length === 0) {
        return null;
      }
      
      // Transform the data to match the expected FormData type
      const entry = data[0];
      return {
        id: entry.id,
        categoryId: entry.category_id,
        schoolId: entry.school_id,
        data: entry.data,
        status: entry.status,
        submittedAt: entry.submitted_at,
        approvedAt: entry.approved_at,
        approvedBy: entry.approved_by
      };
    } catch (error) {
      console.error(`Error in getById formData ${id}:`, error);
      return null;
    }
  },
  
  submit: async (formData: Omit<FormData, 'id'>) => {
    try {
      // Use rpc function instead of direct table insert
      const { data, error } = await supabase
        .rpc('submit_form_data', {
          category_id: formData.categoryId,
          school_id: formData.schoolId,
          form_data: formData.data,
          form_status: formData.status
        });
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Form submitted successfully');
      
      // Transform the data to match the expected FormData type
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
        status: formData.status,
        submittedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error in submit formData:', error);
      toast.error('Failed to submit form');
      return {
        id: "0",
        categoryId: formData.categoryId,
        schoolId: formData.schoolId,
        data: formData.data,
        status: formData.status,
        submittedAt: new Date().toISOString()
      };
    }
  },
  
  update: async (id: string, formData: Partial<FormData>) => {
    try {
      // Use rpc function instead of direct table update
      const updateData: Record<string, any> = { form_id: id };
      if (formData.data !== undefined) updateData.form_data = formData.data;
      if (formData.status !== undefined) {
        updateData.form_status = formData.status;
      }
      
      const { data, error } = await supabase
        .rpc('update_form_data', updateData);
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Form updated successfully');
      
      // Transform the data to match the expected FormData type
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
        categoryId: formData.categoryId || "0",
        schoolId: formData.schoolId || "0",
        data: formData.data || {},
        status: formData.status || 'draft'
      };
    } catch (error) {
      console.error('Error in update formData:', error);
      toast.error('Failed to update form');
      return {
        id,
        categoryId: formData.categoryId || "0",
        schoolId: formData.schoolId || "0",
        data: formData.data || {},
        status: formData.status || 'draft'
      };
    }
  },
  
  approve: async (id: string, approvedBy: string) => {
    try {
      // Use rpc function instead of direct table update
      const { data, error } = await supabase
        .rpc('approve_form_data', {
          form_id: id,
          approved_by_user: approvedBy
        });
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Form approved successfully');
      
      // Transform the data to match the expected FormData type
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
      
      return null;
    } catch (error) {
      console.error('Error in approve formData:', error);
      toast.error('Failed to approve form');
      return null;
    }
  },
  
  reject: async (id: string) => {
    try {
      // Use rpc function instead of direct table update
      const { data, error } = await supabase
        .rpc('reject_form_data', { form_id: id });
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Form rejected');
      
      // Transform the data to match the expected FormData type
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
      
      return null;
    } catch (error) {
      console.error('Error in reject formData:', error);
      toast.error('Failed to reject form');
      return null;
    }
  }
};
