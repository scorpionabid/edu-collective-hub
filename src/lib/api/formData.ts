
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FormData } from "./types";

export const formData = {
  getAll: async (schoolId?: string) => {
    try {
      let query = supabase
        .from('form_data')
        .select('*');
      
      if (schoolId) {
        query = query.eq('school_id', schoolId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching form data:', error);
        throw error;
      }
      
      return data?.map(entry => ({
        id: entry.id,
        categoryId: entry.category_id,
        schoolId: entry.school_id,
        data: entry.data,
        status: entry.status,
        submittedAt: entry.submitted_at,
        approvedAt: entry.approved_at,
        approvedBy: entry.approved_by
      })) || [];
    } catch (error) {
      console.error('Error in getAll formData:', error);
      return [];
    }
  },
  
  getById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('form_data')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching form data:', error);
        throw error;
      }
      
      return data ? {
        id: data.id,
        categoryId: data.category_id,
        schoolId: data.school_id,
        data: data.data,
        status: data.status,
        submittedAt: data.submitted_at,
        approvedAt: data.approved_at,
        approvedBy: data.approved_by
      } : null;
    } catch (error) {
      console.error(`Error in getById formData ${id}:`, error);
      return null;
    }
  },
  
  submit: async (formData: Omit<FormData, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('form_data')
        .insert({
          category_id: formData.categoryId,
          school_id: formData.schoolId,
          data: formData.data,
          status: formData.status,
          submitted_at: formData.status === 'submitted' ? new Date().toISOString() : null
        })
        .select('*')
        .single();
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Form submitted successfully');
      return data ? {
        id: data.id,
        categoryId: data.category_id,
        schoolId: data.school_id,
        data: data.data,
        status: data.status,
        submittedAt: data.submitted_at,
        approvedAt: data.approved_at,
        approvedBy: data.approved_by
      } : {
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
      const { data, error } = await supabase
        .from('form_data')
        .update({
          data: formData.data,
          status: formData.status,
          submitted_at: formData.status === 'submitted' ? new Date().toISOString() : null
        })
        .eq('id', id)
        .select('*')
        .single();
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Form updated successfully');
      return data ? {
        id: data.id,
        categoryId: data.category_id,
        schoolId: data.school_id,
        data: data.data,
        status: data.status,
        submittedAt: data.submitted_at,
        approvedAt: data.approved_at,
        approvedBy: data.approved_by
      } : {
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
      const { data, error } = await supabase
        .from('form_data')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: approvedBy
        })
        .eq('id', id)
        .select('*')
        .single();
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Form approved successfully');
      return data ? {
        id: data.id,
        categoryId: data.category_id,
        schoolId: data.school_id,
        data: data.data,
        status: data.status,
        submittedAt: data.submitted_at,
        approvedAt: data.approved_at,
        approvedBy: data.approved_by
      } : null;
    } catch (error) {
      console.error('Error in approve formData:', error);
      toast.error('Failed to approve form');
      return null;
    }
  },
  
  reject: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('form_data')
        .update({
          status: 'rejected'
        })
        .eq('id', id)
        .select('*')
        .single();
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Form rejected');
      return data ? {
        id: data.id,
        categoryId: data.category_id,
        schoolId: data.school_id,
        data: data.data,
        status: data.status,
        submittedAt: data.submitted_at,
        approvedAt: data.approved_at,
        approvedBy: data.approved_by
      } : null;
    } catch (error) {
      console.error('Error in reject formData:', error);
      toast.error('Failed to reject form');
      return null;
    }
  }
};
