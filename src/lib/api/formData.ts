
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FormData } from "./types";

export const formData = {
  getAll: async (schoolId?: string) => {
    try {
      let data, error;
      
      if (schoolId) {
        const response = await supabase.rpc('get_form_data_by_school', { 
          school_id: schoolId 
        });
        data = response.data;
        error = response.error;
      } else {
        const response = await supabase.rpc('get_all_form_data');
        data = response.data;
        error = response.error;
      }
      
      if (error) {
        console.error('Error fetching form data:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getAll formData:', error);
      return [];
    }
  },
  
  getById: async (id: string) => {
    try {
      const { data, error } = await supabase.rpc('get_form_data_by_id', { 
        form_id: id 
      });
      
      if (error) {
        console.error('Error fetching form data:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error(`Error in getById formData ${id}:`, error);
      return null;
    }
  },
  
  submit: async (formData: Omit<FormData, 'id'>) => {
    try {
      const { data, error } = await supabase.rpc('submit_form_data', {
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
      return data || {
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
      // Return placeholder
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
      const { data, error } = await supabase.rpc('update_form_data', {
        form_id: id,
        form_data: formData.data || {},
        form_status: formData.status || 'draft'
      });
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Form updated successfully');
      return data || {
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
      const { data, error } = await supabase.rpc('approve_form_data', {
        form_id: id,
        approved_by_user: approvedBy
      });
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Form approved successfully');
      return data;
    } catch (error) {
      console.error('Error in approve formData:', error);
      toast.error('Failed to approve form');
      return null;
    }
  },
  
  reject: async (id: string) => {
    try {
      const { data, error } = await supabase.rpc('reject_form_data', { 
        form_id: id 
      });
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Form rejected');
      return data;
    } catch (error) {
      console.error('Error in reject formData:', error);
      toast.error('Failed to reject form');
      return null;
    }
  }
};
