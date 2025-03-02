
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Types
export interface Category {
  id: string;
  name: string;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
  columns: Column[];
}

export interface Column {
  id: string;
  name: string;
  type: string;
  categoryId: string;
}

export interface FormData {
  id?: string;
  categoryId: string;
  schoolId: string;
  data: Record<string, any>;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  submittedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
}

export interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
}

// Connect to real database instead of mock data
export const api = {
  // Auth
  auth: {
    login: async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      return data;
    },
    
    logout: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error(error.message);
        throw error;
      }
    },
    
    getSession: async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error fetching session:', error);
        throw error;
      }
      return data.session;
    },
    
    getProfile: async (userId: string) => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }
      
      return data;
    },
    
    updateProfile: async (userId: string, profile: Partial<Profile>) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(profile)
        .eq('user_id', userId);
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Profile updated successfully');
      return data;
    }
  },
  
  // Categories
  categories: {
    getAll: async () => {
      try {
        const { data, error } = await supabase.rpc('get_categories');
        
        if (error) {
          console.error('Error fetching categories:', error);
          throw error;
        }
        
        return data || [];
      } catch (error) {
        console.error('Error in getAll categories:', error);
        // Fallback to an empty array if the RPC doesn't exist
        return [];
      }
    },
    
    getById: async (id: string) => {
      try {
        const { data, error } = await supabase.rpc('get_category_by_id', { category_id: id });
        
        if (error) {
          console.error('Error fetching category:', error);
          throw error;
        }
        
        return data;
      } catch (error) {
        console.error('Error in getById category:', error);
        // Return dummy data if the RPC doesn't exist yet
        return { id, name: "Category", columns: [] };
      }
    },
    
    create: async (category: Omit<Category, 'id' | 'columns'>) => {
      try {
        const { data, error } = await supabase.rpc('create_category', { 
          category_name: category.name,
          region_id: category.regionId,
          sector_id: category.sectorId,
          school_id: category.schoolId
        });
        
        if (error) {
          toast.error(error.message);
          throw error;
        }
        
        toast.success('Category created successfully');
        return { ...data, columns: [] };
      } catch (error) {
        console.error('Error in create category:', error);
        toast.error('Failed to create category');
        // Return a placeholder value
        return { id: "0", name: category.name, columns: [] };
      }
    },
    
    update: async (id: string, category: Partial<Category>) => {
      try {
        const { data, error } = await supabase.rpc('update_category', {
          category_id: id,
          category_name: category.name
        });
        
        if (error) {
          toast.error(error.message);
          throw error;
        }
        
        toast.success('Category updated successfully');
        return data;
      } catch (error) {
        console.error('Error in update category:', error);
        toast.error('Failed to update category');
        return { id, name: category.name || "Category", columns: [] };
      }
    },
    
    delete: async (id: string) => {
      try {
        const { error } = await supabase.rpc('delete_category', { category_id: id });
        
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
  },
  
  // Columns
  columns: {
    getAll: async (categoryId: string) => {
      try {
        const { data, error } = await supabase.rpc('get_columns_by_category', { 
          category_id: categoryId 
        });
        
        if (error) {
          console.error('Error fetching columns:', error);
          throw error;
        }
        
        return data || [];
      } catch (error) {
        console.error('Error in getAll columns:', error);
        // Return empty array if RPC doesn't exist
        return [];
      }
    },
    
    create: async (column: Omit<Column, 'id'> & { categoryId: string }) => {
      try {
        const { data, error } = await supabase.rpc('create_column', {
          column_name: column.name,
          column_type: column.type,
          category_id: column.categoryId
        });
        
        if (error) {
          toast.error(error.message);
          throw error;
        }
        
        toast.success('Column created successfully');
        return data as Column;
      } catch (error) {
        console.error('Error in create column:', error);
        toast.error('Failed to create column');
        // Return a placeholder value
        return {
          id: "0",
          name: column.name,
          type: column.type,
          categoryId: column.categoryId
        };
      }
    },
    
    update: async (id: string, column: Partial<Column>) => {
      try {
        const { data, error } = await supabase.rpc('update_column', {
          column_id: id,
          column_name: column.name,
          column_type: column.type
        });
        
        if (error) {
          toast.error(error.message);
          throw error;
        }
        
        toast.success('Column updated successfully');
        return data as Column;
      } catch (error) {
        console.error('Error in update column:', error);
        toast.error('Failed to update column');
        return {
          id,
          name: column.name || "Column",
          type: column.type || "text",
          categoryId: column.categoryId || "0"
        };
      }
    },
    
    delete: async (id: string) => {
      try {
        const { error } = await supabase.rpc('delete_column', { column_id: id });
        
        if (error) {
          toast.error(error.message);
          throw error;
        }
        
        toast.success('Column deleted successfully');
      } catch (error) {
        console.error('Error in delete column:', error);
        toast.error('Failed to delete column');
      }
    }
  },
  
  // Form Data
  formData: {
    getAll: async (schoolId?: string) => {
      try {
        const { data, error } = schoolId 
          ? await supabase.rpc('get_form_data_by_school', { school_id: schoolId })
          : await supabase.rpc('get_all_form_data');
        
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
        const { data, error } = await supabase.rpc('get_form_data_by_id', { form_id: id });
        
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
        return data;
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
          form_data: formData.data,
          form_status: formData.status
        });
        
        if (error) {
          toast.error(error.message);
          throw error;
        }
        
        toast.success('Form updated successfully');
        return data;
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
        const { data, error } = await supabase.rpc('reject_form_data', { form_id: id });
        
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
  },
  
  // Regions
  regions: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('regions')
        .select('*');
      
      if (error) {
        console.error('Error fetching regions:', error);
        throw error;
      }
      
      return data || [];
    },
    
    create: async (name: string) => {
      const { data, error } = await supabase
        .from('regions')
        .insert({ name })
        .select()
        .single();
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Region created successfully');
      return data;
    },
    
    update: async (id: string, name: string) => {
      const { data, error } = await supabase
        .from('regions')
        .update({ name })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Region updated successfully');
      return data;
    },
    
    delete: async (id: string) => {
      const { error } = await supabase
        .from('regions')
        .delete()
        .eq('id', id);
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Region deleted successfully');
    }
  },
  
  // Sectors
  sectors: {
    getAll: async (regionId?: string) => {
      let query = supabase.from('sectors').select('*');
      
      if (regionId) {
        query = query.eq('region_id', regionId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching sectors:', error);
        throw error;
      }
      
      return data || [];
    },
    
    create: async (name: string, regionId: string) => {
      const { data, error } = await supabase
        .from('sectors')
        .insert({ 
          name,
          region_id: regionId
        })
        .select()
        .single();
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Sector created successfully');
      return data;
    },
    
    update: async (id: string, name: string) => {
      const { data, error } = await supabase
        .from('sectors')
        .update({ name })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Sector updated successfully');
      return data;
    },
    
    delete: async (id: string) => {
      const { error } = await supabase
        .from('sectors')
        .delete()
        .eq('id', id);
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Sector deleted successfully');
    }
  },
  
  // Schools
  schools: {
    getAll: async (sectorId?: string) => {
      let query = supabase.from('schools').select('*');
      
      if (sectorId) {
        query = query.eq('sector_id', sectorId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching schools:', error);
        throw error;
      }
      
      return data || [];
    },
    
    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error(`Error fetching school ${id}:`, error);
        throw error;
      }
      
      return data;
    },
    
    create: async (school: { name: string; sectorId: string; address?: string; email?: string; phone?: string }) => {
      const { data, error } = await supabase
        .from('schools')
        .insert({
          name: school.name,
          sector_id: school.sectorId,
          address: school.address,
          email: school.email,
          phone: school.phone
        })
        .select()
        .single();
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('School created successfully');
      return data;
    },
    
    update: async (id: string, school: Partial<{ name: string; address: string; email: string; phone: string }>) => {
      const { data, error } = await supabase
        .from('schools')
        .update(school)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('School updated successfully');
      return data;
    },
    
    delete: async (id: string) => {
      const { error } = await supabase
        .from('schools')
        .delete()
        .eq('id', id);
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('School deleted successfully');
    }
  },
  
  // User profiles
  profiles: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      
      if (error) {
        console.error('Error fetching profiles:', error);
        throw error;
      }
      
      return data || [];
    }
  },
  
  // Real-time subscriptions
  realtime: {
    subscribeToFormData: (schoolId: string, callback: (payload: any) => void) => {
      return supabase
        .channel(`public:form_data:school_id=eq.${schoolId}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'form_data',
          filter: `school_id=eq.${schoolId}`
        }, payload => {
          callback(payload);
        })
        .subscribe();
    },
    
    unsubscribe: (channel: any) => {
      if (channel && channel.unsubscribe) {
        channel.unsubscribe();
      }
    }
  }
};
