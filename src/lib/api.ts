
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Types
export interface Category {
  id: number;
  name: string;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
  columns: Column[];
}

export interface Column {
  id: number;
  name: string;
  type: string;
}

export interface FormData {
  id?: string;
  categoryId: number;
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

// API Functions
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
      const { data, error } = await supabase
        .from('categories')
        .select('*');
      
      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }
      
      return data || [];
    },
    
    getById: async (id: number) => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error(`Error fetching category ${id}:`, error);
        throw error;
      }
      
      return data;
    },
    
    create: async (category: Omit<Category, 'id' | 'columns'>) => {
      const { data, error } = await supabase
        .from('categories')
        .insert(category)
        .select()
        .single();
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Category created successfully');
      return data;
    },
    
    update: async (id: number, category: Partial<Category>) => {
      const { data, error } = await supabase
        .from('categories')
        .update(category)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Category updated successfully');
      return data;
    },
    
    delete: async (id: number) => {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Category deleted successfully');
    }
  },
  
  // Columns
  columns: {
    getAll: async (categoryId: number) => {
      const { data, error } = await supabase
        .from('columns')
        .select('*')
        .eq('category_id', categoryId);
      
      if (error) {
        console.error(`Error fetching columns for category ${categoryId}:`, error);
        throw error;
      }
      
      return data || [];
    },
    
    create: async (column: Omit<Column, 'id'> & { categoryId: number }) => {
      const { data, error } = await supabase
        .from('columns')
        .insert({
          name: column.name,
          type: column.type,
          category_id: column.categoryId
        })
        .select()
        .single();
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Column created successfully');
      return data;
    },
    
    update: async (id: number, column: Partial<Column>) => {
      const { data, error } = await supabase
        .from('columns')
        .update(column)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Column updated successfully');
      return data;
    },
    
    delete: async (id: number) => {
      const { error } = await supabase
        .from('columns')
        .delete()
        .eq('id', id);
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Column deleted successfully');
    }
  },
  
  // Form Data
  formData: {
    getAll: async (schoolId?: string) => {
      let query = supabase.from('form_data').select('*');
      
      if (schoolId) {
        query = query.eq('school_id', schoolId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching form data:', error);
        throw error;
      }
      
      return data || [];
    },
    
    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('form_data')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error(`Error fetching form data ${id}:`, error);
        throw error;
      }
      
      return data;
    },
    
    submit: async (formData: Omit<FormData, 'id'>) => {
      const { data, error } = await supabase
        .from('form_data')
        .insert({
          ...formData,
          submitted_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Form submitted successfully');
      return data;
    },
    
    update: async (id: string, formData: Partial<FormData>) => {
      const { data, error } = await supabase
        .from('form_data')
        .update(formData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Form updated successfully');
      return data;
    },
    
    approve: async (id: string, approvedBy: string) => {
      const { data, error } = await supabase
        .from('form_data')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: approvedBy
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Form approved successfully');
      return data;
    },
    
    reject: async (id: string) => {
      const { data, error } = await supabase
        .from('form_data')
        .update({
          status: 'rejected'
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Form rejected');
      return data;
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
    }
  },
  
  // Real-time subscriptions
  realtime: {
    subscribeToFormData: (schoolId: string, callback: (payload: any) => void) => {
      const channel = supabase
        .channel('form-data-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'form_data',
            filter: `school_id=eq.${schoolId}`
          },
          callback
        )
        .subscribe();
        
      return channel;
    },
    
    unsubscribe: (channel: any) => {
      supabase.removeChannel(channel);
    }
  }
};
