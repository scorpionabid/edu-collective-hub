import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FormData, PaginatedResponse, QueryOptions } from "./types";
import { withCache } from "@/lib/cache/withCache";
import { Json } from "@/integrations/supabase/types";

// Create enhanced interfaces for form data and submissions
interface GetFormDataOptions extends QueryOptions {
  categoryId?: string;
  schoolId?: string;
  status?: string[] | string;
  submittedBefore?: string;
  submittedAfter?: string;
  approvedBefore?: string;
  approvedAfter?: string;
}

// Get all form data entries with filtering and pagination
export const getFormData = async (
  options: GetFormDataOptions = {}
): Promise<PaginatedResponse<any>> => {
  try {
    const {
      pagination = { page: 1, pageSize: 20 },
      filters = {},
      sort = { column: "created_at", direction: "desc" },
    } = options;

    let query = supabase
      .from("data")
      .select(
        `
        id, category_id, school_id, data, status, 
        submitted_at, approved_at, approved_by, 
        created_at, updated_at,
        categories:category_id (name),
        schools:school_id (name)
        `,
        { count: "exact" }
      );

    // Apply filters
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          if (Array.isArray(value)) {
            query = query.in(key, value);
          } else {
            query = query.eq(key, value);
          }
        }
      });
    }

    // Apply specific filters from options
    if (options.categoryId) {
      query = query.eq("category_id", options.categoryId);
    }

    if (options.schoolId) {
      query = query.eq("school_id", options.schoolId);
    }

    if (options.status) {
      if (Array.isArray(options.status)) {
        query = query.in("status", options.status);
      } else {
        query = query.eq("status", options.status);
      }
    }

    // Apply date range filters
    if (options.submittedAfter) {
      query = query.gte("submitted_at", options.submittedAfter);
    }

    if (options.submittedBefore) {
      query = query.lte("submitted_at", options.submittedBefore);
    }

    if (options.approvedAfter) {
      query = query.gte("approved_at", options.approvedAfter);
    }

    if (options.approvedBefore) {
      query = query.lte("approved_at", options.approvedBefore);
    }

    // Apply sorting
    if (sort) {
      query = query.order(sort.column, { ascending: sort.direction === "asc" });
    }

    // Apply pagination
    const from = (pagination.page - 1) * pagination.pageSize;
    const to = from + pagination.pageSize - 1;
    query = query.range(from, to);

    // Execute the query
    const { data, error, count } = await query;

    if (error) throw error;

    // Transform the response to match the expected format
    const transformedData = data.map((item: any) => ({
      id: item.id,
      categoryId: item.category_id,
      schoolId: item.school_id,
      data: item.data as Json,
      status: item.status,
      submittedAt: item.submitted_at,
      approvedAt: item.approved_at,
      approvedBy: item.approved_by,
      categoryName: item.categories?.name,
      schoolName: item.schools?.name,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));

    // Calculate pagination metadata
    const totalPages = Math.ceil((count || 0) / pagination.pageSize);

    return {
      data: transformedData,
      metadata: {
        total: count || 0,
        page: pagination.page,
        pageSize: pagination.pageSize,
        pageCount: totalPages,
      },
      totalPages, // Added for compatibility
      total: count, // Added for compatibility
    };
  } catch (error) {
    console.error("Error fetching form data:", error);
    toast.error("Failed to load form data");
    return {
      data: [],
      metadata: {
        total: 0,
        page: 1,
        pageSize: 20,
        pageCount: 0,
      },
    };
  }
};

// Get form data with caching
export const getFormDataWithCache = async (
  options: GetFormDataOptions = {}
): Promise<PaginatedResponse<any>> => {
  return withCache(
    async () => getFormData(options),
    { enabled: true, ttl: 5 * 60 * 1000, invalidationTags: ["form-data"] }
  );
};

// Get a single form data entry by ID
export const getFormDataById = async (
  id: string
): Promise<FormData | null> => {
  try {
    const { data, error } = await supabase
      .from("data")
      .select(
        `
        id, category_id, school_id, data, status, 
        submitted_at, approved_at, approved_by, 
        created_at, updated_at,
        categories:category_id (name),
        schools:school_id (name)
        `
      )
      .eq("id", id)
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
      categoryName: data.categories?.name,
      schoolName: data.schools?.name,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch (error) {
    console.error("Error fetching form data by ID:", error);
    toast.error("Failed to load form data");
    return null;
  }
};

// Create a new form data entry
export const createFormData = async (
  formData: Omit<FormData, "id">
): Promise<{ success: boolean; data?: FormData; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from("data")
      .insert({
        category_id: formData.categoryId,
        school_id: formData.schoolId,
        data: formData.data,
        status: formData.status || "draft",
        submitted_at: formData.submittedAt,
        created_by: formData.createdBy
      })
      .select()
      .single();

    if (error) throw error;

    // Invalidate cache
    invalidateFormDataCache();

    toast.success("Form data saved successfully");
    return {
      success: true,
      data: {
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
      },
    };
  } catch (error) {
    console.error("Error creating form data:", error);
    toast.error("Failed to save form data");
    return {
      success: false,
      error: (error as Error).message,
    };
  }
};

// Update an existing form data entry
export const updateFormData = async (
  id: string,
  updates: Partial<FormData>
): Promise<{ success: boolean; data?: FormData; error?: string }> => {
  try {
    const updateData: any = {};

    if (updates.data !== undefined) updateData.data = updates.data;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.submittedAt !== undefined)
      updateData.submitted_at = updates.submittedAt;
    if (updates.approvedAt !== undefined)
      updateData.approved_at = updates.approvedAt;
    if (updates.approvedBy !== undefined)
      updateData.approved_by = updates.approvedBy;

    const { data, error } = await supabase
      .from("data")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // Invalidate cache
    invalidateFormDataCache();

    toast.success("Form data updated successfully");
    return {
      success: true,
      data: {
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
      },
    };
  } catch (error) {
    console.error("Error updating form data:", error);
    toast.error("Failed to update form data");
    return {
      success: false,
      error: (error as Error).message,
    };
  }
};

// Delete a form data entry
export const deleteFormData = async (
  id: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.from("data").delete().eq("id", id);

    if (error) throw error;

    // Invalidate cache
    invalidateFormDataCache();

    toast.success("Form data deleted successfully");
    return { success: true };
  } catch (error) {
    console.error("Error deleting form data:", error);
    toast.error("Failed to delete form data");
    return {
      success: false,
      error: (error as Error).message,
    };
  }
};

// Submit form data
export const submitFormData = async (
  id: string
): Promise<{ success: boolean; data?: FormData; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from("data")
      .update({
        status: "submitted",
        submitted_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // Invalidate cache
    invalidateFormDataCache();

    toast.success("Form submitted successfully");
    return {
      success: true,
      data: {
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
      },
    };
  } catch (error) {
    console.error("Error submitting form:", error);
    toast.error("Failed to submit form");
    return {
      success: false,
      error: (error as Error).message,
    };
  }
};

// Approve form data
export const approveFormData = async (
  id: string,
  approverId: string
): Promise<{ success: boolean; data?: FormData; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from("data")
      .update({
        status: "approved",
        approved_at: new Date().toISOString(),
        approved_by: approverId,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // Invalidate cache
    invalidateFormDataCache();

    toast.success("Form approved successfully");
    return {
      success: true,
      data: {
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
      },
    };
  } catch (error) {
    console.error("Error approving form:", error);
    toast.error("Failed to approve form");
    return {
      success: false,
      error: (error as Error).message,
    };
  }
};

// Reject form data
export const rejectFormData = async (
  id: string,
  rejectionReason?: string
): Promise<{ success: boolean; data?: FormData; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from("data")
      .update({
        status: "rejected",
        // Store rejection reason in data field if needed
        ...(rejectionReason
          ? {
              data: supabase.rpc("jsonb_set", {
                jsonb: supabase.rpc("row_to_json", {
                  row: "data:data",
                }),
                path: '{"rejectionReason"}',
                value: JSON.stringify(rejectionReason),
              }),
            }
          : {}),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // Invalidate cache
    invalidateFormDataCache();

    toast.success("Form rejected successfully");
    return {
      success: true,
      data: {
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
      },
    };
  } catch (error) {
    console.error("Error rejecting form:", error);
    toast.error("Failed to reject form");
    return {
      success: false,
      error: (error as Error).message,
    };
  }
};

// Helper to invalidate form data cache
export const invalidateFormDataCache = async (): Promise<void> => {
  try {
    await supabase.from("cache_entries").delete().like("cache_key", "%form-data%");
  } catch (error) {
    console.error("Error invalidating form data cache:", error);
  }
};

// Export enhanced form data API
export const formData = {
  getFormData,
  getFormDataWithCache,
  getFormDataById,
  createFormData,
  updateFormData,
  deleteFormData,
  submitFormData,
  approveFormData,
  rejectFormData,
  getById: getFormDataById,
  create: createFormData,
  update: updateFormData,
  delete: deleteFormData,
  submit: submitFormData,
  approve: approveFormData,
  reject: rejectFormData,
  getAll: getFormData
};
