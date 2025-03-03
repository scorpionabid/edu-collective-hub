
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FormData } from "./types";

// We'll use direct RPC calls for form data operations to avoid the tables not found issues
const transformFormDataFromDB = (item: any): FormData => ({
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
});

// Get all form data by category
export const getAllFormDataByCategory = async (categoryId: string): Promise<FormData[]> => {
  try {
    const { data, error } = await supabase.rpc('get_form_data_by_category', { p_category_id: categoryId });
    
    if (error) throw error;
    
    return Array.isArray(data) ? data.map(transformFormDataFromDB) : [];
  } catch (error) {
    console.error('Error fetching form data by category:', error);
    toast.error('Failed to load form data');
    return [];
  }
};

// Create new form data
export const createFormData = async (data: Omit<FormData, 'id'>): Promise<FormData> => {
  try {
    const { data: newData, error } = await supabase.rpc('create_form_data', {
      p_category_id: data.categoryId,
      p_school_id: data.schoolId,
      p_data: data.data,
      p_status: data.status
    });
    
    if (error) throw error;
    
    toast.success('Form data created successfully');
    
    return transformFormDataFromDB(newData);
  } catch (error) {
    console.error('Error creating form data:', error);
    toast.error('Failed to create form data');
    throw error;
  }
};

// Update existing form data
export const updateFormData = async (id: string, data: Partial<FormData>): Promise<FormData> => {
  try {
    const updateParams: any = { p_form_data_id: id };
    
    if (data.categoryId !== undefined) updateParams.p_category_id = data.categoryId;
    if (data.schoolId !== undefined) updateParams.p_school_id = data.schoolId;
    if (data.data !== undefined) updateParams.p_data = data.data;
    if (data.status !== undefined) updateParams.p_status = data.status;
    
    const { data: updatedData, error } = await supabase.rpc('update_form_data', updateParams);
    
    if (error) throw error;
    
    toast.success('Form data updated successfully');
    
    return transformFormDataFromDB(updatedData);
  } catch (error) {
    console.error('Error updating form data:', error);
    toast.error('Failed to update form data');
    throw error;
  }
};

// Get form data by ID
export const getFormDataById = async (id: string): Promise<FormData | null> => {
  try {
    const { data, error } = await supabase.rpc('get_form_data_by_id', { p_form_data_id: id });
    
    if (error) throw error;
    
    if (!data || data.length === 0) return null;
    
    return transformFormDataFromDB(data[0]);
  } catch (error) {
    console.error('Error fetching form data by ID:', error);
    toast.error('Failed to load form data');
    return null;
  }
};

// Get all form data
export const getAllFormData = async (): Promise<FormData[]> => {
  try {
    const { data, error } = await supabase.rpc('get_all_form_data');
    
    if (error) throw error;
    
    return Array.isArray(data) ? data.map(transformFormDataFromDB) : [];
  } catch (error) {
    console.error('Error fetching all form data:', error);
    toast.error('Failed to load form data');
    return [];
  }
};

// Additional method for the hooks
export const getAllByCategory = async (categoryId: string): Promise<FormData[]> => {
  return getAllFormDataByCategory(categoryId);
};

// Export the formData API
export const formData = {
  getAllFormDataByCategory,
  createFormData,
  updateFormData,
  getFormDataById,
  getAllFormData,
  getAllByCategory
};
