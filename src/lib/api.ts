
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Types
export interface Category {
  id: string; // Changed from number to string to match Supabase UUID format
  name: string;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
  columns: Column[];
}

export interface Column {
  id: string; // Changed from number to string to match Supabase UUID format
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

// Mock API until we create the actual tables in Supabase
// This allows for development without changing the database schema yet
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
    // For now, return mock data since categories table doesn't exist yet
    getAll: async () => {
      console.log("Fetching categories (mock data)");
      return [
        { id: "1", name: "Məktəbin ümumi məlumatları" },
        { id: "2", name: "Şagirdlər haqqında məlumat" },
        { id: "3", name: "Müəllimlər haqqında məlumat" },
        { id: "4", name: "Maddi-texniki baza" }
      ];
    },
    
    getById: async (id: string) => {
      console.log(`Fetching category ${id} (mock data)`);
      const mockData = [
        { id: "1", name: "Məktəbin ümumi məlumatları" },
        { id: "2", name: "Şagirdlər haqqında məlumat" },
        { id: "3", name: "Müəllimlər haqqında məlumat" },
        { id: "4", name: "Maddi-texniki baza" }
      ];
      return mockData.find(c => c.id === id) || mockData[0];
    },
    
    create: async (category: Omit<Category, 'id' | 'columns'>) => {
      console.log("Creating category (mock)", category);
      toast.success('Category created successfully');
      return { id: Date.now().toString(), ...category, columns: [] };
    },
    
    update: async (id: string, category: Partial<Category>) => {
      console.log(`Updating category ${id} (mock)`, category);
      toast.success('Category updated successfully');
      return { id, ...category };
    },
    
    delete: async (id: string) => {
      console.log(`Deleting category ${id} (mock)`);
      toast.success('Category deleted successfully');
    }
  },
  
  // Columns
  columns: {
    getAll: async (categoryId: string) => {
      console.log(`Fetching columns for category ${categoryId} (mock data)`);
      const mockColumns = {
        "1": [
          { id: "101", name: "Məktəbin adı", type: "text", categoryId: "1" },
          { id: "102", name: "Məktəbin ünvanı", type: "text", categoryId: "1" },
          { id: "103", name: "Direktor", type: "text", categoryId: "1" },
          { id: "104", name: "Əlaqə nömrəsi", type: "text", categoryId: "1" }
        ],
        "2": [
          { id: "201", name: "Şagird sayı", type: "number", categoryId: "2" },
          { id: "202", name: "Siniflərin sayı", type: "number", categoryId: "2" },
          { id: "203", name: "Birinci sinif şagirdləri", type: "number", categoryId: "2" }
        ],
        "3": [
          { id: "301", name: "Müəllim sayı", type: "number", categoryId: "3" },
          { id: "302", name: "Ali təhsilli müəllimlər", type: "number", categoryId: "3" },
          { id: "303", name: "Orta yaş", type: "number", categoryId: "3" }
        ],
        "4": [
          { id: "401", name: "Sinif otaqları", type: "number", categoryId: "4" },
          { id: "402", name: "Kompüter sayı", type: "number", categoryId: "4" },
          { id: "403", name: "İdman zalı", type: "select", categoryId: "4" }
        ]
      };
      
      return mockColumns[categoryId as keyof typeof mockColumns] || [];
    },
    
    create: async (column: Omit<Column, 'id'> & { categoryId: string }) => {
      console.log("Creating column (mock)", column);
      toast.success('Column created successfully');
      return { id: Date.now().toString(), ...column };
    },
    
    update: async (id: string, column: Partial<Column>) => {
      console.log(`Updating column ${id} (mock)`, column);
      toast.success('Column updated successfully');
      return { id, ...column };
    },
    
    delete: async (id: string) => {
      console.log(`Deleting column ${id} (mock)`);
      toast.success('Column deleted successfully');
    }
  },
  
  // Form Data
  formData: {
    getAll: async (schoolId?: string) => {
      console.log(`Fetching form data for school ${schoolId} (mock data)`);
      // Mock data to simulate form submissions
      const mockFormData = [
        {
          id: "fd1",
          categoryId: "1",
          schoolId: "school-1",
          data: { "101": "Məktəb №1", "102": "Bakı şəhəri", "103": "Anar Məmmədov", "104": "+994 50 123 45 67" },
          status: "approved",
          submittedAt: "2023-06-12T10:15:30Z",
          approvedAt: "2023-06-14T08:20:15Z",
          approvedBy: "admin-1"
        },
        {
          id: "fd2",
          categoryId: "2",
          schoolId: "school-1",
          data: { "201": 450, "202": 25, "203": 75 },
          status: "submitted",
          submittedAt: "2023-06-15T11:30:00Z"
        }
      ];
      
      if (schoolId) {
        return mockFormData.filter(fd => fd.schoolId === schoolId);
      }
      
      return mockFormData;
    },
    
    getById: async (id: string) => {
      console.log(`Fetching form data ${id} (mock)`);
      return {
        id,
        categoryId: "1",
        schoolId: "school-1",
        data: { "101": "Məktəb №1", "102": "Bakı şəhəri", "103": "Anar Məmmədov", "104": "+994 50 123 45 67" },
        status: "approved",
        submittedAt: "2023-06-12T10:15:30Z"
      };
    },
    
    submit: async (formData: Omit<FormData, 'id'>) => {
      console.log("Submitting form data (mock)", formData);
      toast.success('Form submitted successfully');
      return { id: Date.now().toString(), ...formData, submittedAt: new Date().toISOString() };
    },
    
    update: async (id: string, formData: Partial<FormData>) => {
      console.log(`Updating form data ${id} (mock)`, formData);
      toast.success('Form updated successfully');
      return { id, ...formData };
    },
    
    approve: async (id: string, approvedBy: string) => {
      console.log(`Approving form data ${id} (mock)`);
      toast.success('Form approved successfully');
      return { 
        id, 
        status: 'approved', 
        approvedAt: new Date().toISOString(), 
        approvedBy 
      };
    },
    
    reject: async (id: string) => {
      console.log(`Rejecting form data ${id} (mock)`);
      toast.success('Form rejected');
      return { id, status: 'rejected' };
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
      console.log(`Setting up real-time subscription for school ${schoolId} (mock)`);
      // Since we don't have the form_data table yet, return a mock channel 
      // that can be "unsubscribed" without errors
      return { id: 'mock-channel' };
    },
    
    unsubscribe: (channel: any) => {
      console.log('Unsubscribing from channel (mock)', channel);
      // Mock implementation
    }
  }
};
