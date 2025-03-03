
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { withCache } from '@/lib/cache/withCache';
import { cacheService } from '@/lib/cache/cacheService';
import { PaginatedResponse, QueryOptions, FormData } from './types';

const CACHE_TAGS = {
  FORM_DATA: 'form_data',
  CATEGORY_DATA: 'category_data',
  SCHOOL_DATA: 'school_data',
};

const buildCacheKey = (baseKey: string, options?: QueryOptions): string => {
  if (!options) return baseKey;
  
  const parts = [baseKey];
  
  if (options.pagination) {
    parts.push(`page=${options.pagination.page}`);
    parts.push(`pageSize=${options.pagination.pageSize}`);
  }
  
  if (options.sort) {
    parts.push(`sort=${options.sort.column},${options.sort.direction}`);
  }
  
  if (options.filters && Object.keys(options.filters).length > 0) {
    parts.push(`filters=${JSON.stringify(options.filters)}`);
  }
  
  return parts.join(':');
};

export const formData = {
  getAll: async (options?: QueryOptions): Promise<PaginatedResponse<any>> => {
    const cacheKey = buildCacheKey('form_data:all', options);
    
    return withCache(cacheKey, async () => {
      try {
        let query = supabase
          .from('data')
          .select('*, category:categories(name), school:schools(name)', { count: 'exact' });
        
        if (options?.filters) {
          Object.entries(options.filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
              if (key === 'status') {
                query = query.eq(key, value);
              } else if (key === 'category_id') {
                query = query.eq(key, value);
              } else if (key === 'school_id') {
                query = query.eq(key, value);
              } else if (key === 'search' && typeof value === 'string') {
                query = query.or(`name.ilike.%${value}%,data->>'title'.ilike.%${value}%`);
              }
            }
          });
        }
        
        if (options?.sort) {
          query = query.order(options.sort.column, { 
            ascending: options.sort.direction === 'asc' 
          });
        } else {
          query = query.order('created_at', { ascending: false });
        }
        
        const { page = 1, pageSize = 10 } = options?.pagination || {};
        const start = (page - 1) * pageSize;
        query = query.range(start, start + pageSize - 1);
        
        const { data, error, count } = await query;
        
        if (error) throw error;
        
        // Transform snake_case to camelCase for consistent API
        const transformedData = data?.map(item => ({
          id: item.id,
          categoryId: item.category_id,
          schoolId: item.school_id,
          data: item.data,
          status: item.status,
          submittedAt: item.submitted_at,
          approvedAt: item.approved_at,
          approvedBy: item.approved_by,
          categoryName: item.category?.name,
          schoolName: item.school?.name
        })) || [];
        
        return {
          data: transformedData,
          metadata: {
            total: count || 0,
            page,
            pageSize,
            pageCount: Math.ceil((count || 0) / pageSize)
          }
        };
      } catch (error) {
        console.error('Error in getAll form data:', error);
        return {
          data: [],
          metadata: {
            total: 0,
            page: 1,
            pageSize: 10,
            pageCount: 0
          }
        };
      }
    }, options?.cache || { 
      enabled: true, 
      ttl: 300, 
      invalidationTags: [CACHE_TAGS.FORM_DATA]
    });
  },
  
  getAllByCategory: async (categoryId: string, options?: QueryOptions): Promise<PaginatedResponse<any>> => {
    const cacheKey = buildCacheKey(`form_data:category:${categoryId}`, options);
    
    return withCache(cacheKey, async () => {
      try {
        let query = supabase
          .from('data')
          .select('*, category:categories(name), school:schools(name)', { count: 'exact' })
          .eq('category_id', categoryId);
        
        if (options?.filters) {
          Object.entries(options.filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
              if (key === 'status') {
                query = query.eq(key, value);
              } else if (key === 'school_id') {
                query = query.eq(key, value);
              } else if (key === 'search' && typeof value === 'string') {
                query = query.or(`name.ilike.%${value}%,data->>'title'.ilike.%${value}%`);
              }
            }
          });
        }
        
        if (options?.sort) {
          query = query.order(options.sort.column, { 
            ascending: options.sort.direction === 'asc' 
          });
        } else {
          query = query.order('created_at', { ascending: false });
        }
        
        const { page = 1, pageSize = 10 } = options?.pagination || {};
        const start = (page - 1) * pageSize;
        query = query.range(start, start + pageSize - 1);
        
        const { data, error, count } = await query;
        
        if (error) throw error;
        
        // Transform snake_case to camelCase for consistent API
        const transformedData = data?.map(item => ({
          id: item.id,
          categoryId: item.category_id,
          schoolId: item.school_id,
          data: item.data,
          status: item.status,
          submittedAt: item.submitted_at,
          approvedAt: item.approved_at,
          approvedBy: item.approved_by,
          categoryName: item.category?.name,
          schoolName: item.school?.name
        })) || [];
        
        return {
          data: transformedData,
          metadata: {
            total: count || 0,
            page,
            pageSize,
            pageCount: Math.ceil((count || 0) / pageSize)
          }
        };
      } catch (error) {
        console.error('Error in getAllByCategory form data:', error);
        return {
          data: [],
          metadata: {
            total: 0,
            page: 1,
            pageSize: 10,
            pageCount: 0
          }
        };
      }
    }, options?.cache || { 
      enabled: true, 
      ttl: 300, 
      invalidationTags: [CACHE_TAGS.FORM_DATA, CACHE_TAGS.CATEGORY_DATA]
    });
  },
  
  getById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('data')
        .select('*, category:categories(name), school:schools(name)')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching form data by ID:', error);
        throw error;
      }
      
      if (!data) {
        return null;
      }
      
      return {
        id: data.id,
        categoryId: data.category_id,
        schoolId: data.school_id,
        data: data.data,
        status: data.status,
        submittedAt: data.submitted_at,
        approvedAt: data.approved_at,
        approvedBy: data.approved_by,
        categoryName: data.category?.name,
        schoolName: data.school?.name
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
  
  submit: async (data: any) => {
    try {
      const { data: submittedData, error } = await supabase.rpc('submit_form_data', {
        category_id: data.category_id,
        school_id: data.school_id,
        form_data: data.data,
        status: 'submitted',
        submitted_at: new Date().toISOString()
      });
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Form submitted successfully');
      
      await cacheService.invalidate([
        CACHE_TAGS.FORM_DATA, 
        CACHE_TAGS.CATEGORY_DATA, 
        CACHE_TAGS.SCHOOL_DATA
      ]);
      
      return submittedData;
    } catch (error) {
      console.error('Error in submit form data:', error);
      toast.error('Failed to submit form');
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
      console.error('Error rejecting form data:', error);
      toast.error('Failed to reject form data');
      return null;
    }
  }
};
