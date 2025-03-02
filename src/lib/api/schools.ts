
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const schools = {
  getAll: async () => {
    try {
      const { data, error } = await supabase
        .from('schools')
        .select('*');
      
      if (error) {
        console.error('Error fetching schools:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getAll schools:', error);
      return [];
    }
  },
  
  getBySector: async (sectorId: string) => {
    try {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .eq('sector_id', sectorId);
      
      if (error) {
        console.error('Error fetching schools by sector:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getBySector schools:', error);
      return [];
    }
  },
  
  getById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching school:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error in getById school:', error);
      return null;
    }
  },
  
  create: async (school: { name: string; sector_id: string; address?: string; email?: string; phone?: string }) => {
    try {
      const { data, error } = await supabase
        .from('schools')
        .insert(school)
        .select()
        .single();
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('School created successfully');
      return data;
    } catch (error) {
      console.error('Error in create school:', error);
      toast.error('Failed to create school');
      return { id: "0", ...school };
    }
  },
  
  update: async (id: string, school: { name?: string; address?: string; email?: string; phone?: string }) => {
    try {
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
    } catch (error) {
      console.error('Error in update school:', error);
      toast.error('Failed to update school');
      return { id, ...school };
    }
  },
  
  delete: async (id: string) => {
    try {
      const { error } = await supabase
        .from('schools')
        .delete()
        .eq('id', id);
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('School deleted successfully');
    } catch (error) {
      console.error('Error in delete school:', error);
      toast.error('Failed to delete school');
    }
  }
};
