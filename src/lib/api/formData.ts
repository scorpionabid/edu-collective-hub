import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FormData } from "./types";

// Get all form data by category
export const getAllFormDataByCategory = async (categoryId: string): Promise<FormData[]> => {
  try {
    const { data, error } = await supabase
      .from('form_data')
      .select('*')
      .eq('category_id', categoryId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map((item: any) => ({
      id: item.id,
      categoryId: item.category_id,
      schoolId: item.school_id,
      data: item.data,
      status: item.status,
      submittedAt: item.submitted_at,
      approvedAt: item.approved_at,
      approvedBy: item.approved_by,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      categoryName: item.category_name,
      schoolName: item.school_name,
      createdBy: item.created_by
    }));
  } catch (error) {
    console.error('Error fetching form data by category:', error);
    toast.error('Failed to load form data');
    return [];
  }
};

// Create new form data
export const createFormData = async (data: Omit<FormData, 'id'>): Promise<FormData> => {
  try {
    const { data: newData, error } = await supabase
      .from('form_data')
      .insert({
        category_id: data.categoryId,
        school_id: data.schoolId,
        data: data.data,
        status: data.status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();
    
    if (error) throw error;
    
    toast.success('Form data created successfully');
    
    return {
      id: newData.id,
      categoryId: newData.category_id,
      schoolId: newData.school_id,
      data: newData.data,
      status: newData.status,
      submittedAt: newData.submitted_at,
      approvedAt: newData.approved_at,
      approvedBy: newData.approved_by,
      createdAt: newData.created_at,
      updatedAt: newData.updated_at,
      categoryName: newData.category_name,
      schoolName: newData.school_name,
      createdBy: newData.created_by
    };
  } catch (error) {
    console.error('Error creating form data:', error);
    toast.error('Failed to create form data');
    throw error;
  }
};

// Update existing form data
export const updateFormData = async (id: string, data: Partial<FormData>): Promise<FormData> => {
  try {
    const updateData: any = {};
    
    if (data.categoryId !== undefined) updateData.category_id = data.categoryId;
    if (data.schoolId !== undefined) updateData.school_id = data.schoolId;
    if (data.data !== undefined) updateData.data = data.data;
    if (data.status !== undefined) updateData.status = data.status;
    
    updateData.updated_at = new Date().toISOString();
    
    const { data: updatedData, error } = await supabase
      .from('form_data')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    toast.success('Form data updated successfully');
    
    return {
      id: updatedData.id,
      categoryId: updatedData.category_id,
      schoolId: updatedData.school_id,
      data: updatedData.data,
      status: updatedData.status,
      submittedAt: updatedData.submitted_at,
      approvedAt: updatedData.approved_at,
      approvedBy: updatedData.approved_by,
      createdAt: updatedData.created_at,
      updatedAt: updatedData.updated_at,
      categoryName: updatedData.category_name,
      schoolName: updatedData.school_name,
      createdBy: updatedData.created_by
    };
  } catch (error) {
    console.error('Error updating form data:', error);
    toast.error('Failed to update form data');
    throw error;
  }
};

// Get form data by ID
export const getFormDataById = async (id: string): Promise<FormData | null> => {
  try {
    const { data, error } = await supabase
      .from('form_data')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      categoryId: data.category_id,
      schoolId: data.school_id,
      data: data.data,
      status: data.status,
      submittedAt: data.submitted_at,
      approvedAt: data.approved_at,
      approvedBy: data.approved_by,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      categoryName: data.category_name,
      schoolName: data.school_name,
      createdBy: data.created_by
    };
  } catch (error) {
    console.error('Error fetching form data by ID:', error);
    toast.error('Failed to load form data');
    return null;
  }
};

// Get all form data
export const getAllFormData = async (): Promise<FormData[]> => {
  try {
    const { data, error } = await supabase
      .from('form_data')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map((item: any) => ({
      id: item.id,
      categoryId: item.category_id,
      schoolId: item.school_id,
      data: item.data,
      status: item.status,
      submittedAt: item.submitted_at,
      approvedAt: item.approved_at,
      approvedBy: item.approved_by,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      categoryName: item.category_name,
      schoolName: item.school_name,
      createdBy: item.created_by
    }));
  } catch (error) {
    console.error('Error fetching all form data:', error);
    toast.error('Failed to load form data');
    return [];
  }
};

// Export the formData API
export const formData = {
  getAllFormDataByCategory,
  createFormData,
  updateFormData,
  getFormDataById,
  getAllFormData
};
