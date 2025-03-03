
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Region } from "./types";

export const regions = {
  getAll: async () => {
    try {
      const { data, error } = await supabase
        .from('regions')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching regions:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getAll regions:', error);
      return [];
    }
  },
  
  getById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('regions')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching region:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error in getById region:', error);
      return null;
    }
  },

  getNameById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('regions')
        .select('name')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching region name:', error);
        throw error;
      }
      
      return data?.name || 'Unknown';
    } catch (error) {
      console.error('Error in getNameById region:', error);
      return 'Unknown';
    }
  },
  
  create: async (name: string) => {
    try {
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
    } catch (error) {
      console.error('Error in create region:', error);
      toast.error('Failed to create region');
      return { id: "0", name };
    }
  },
  
  update: async (id: string, name: string) => {
    try {
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
    } catch (error) {
      console.error('Error in update region:', error);
      toast.error('Failed to update region');
      return { id, name };
    }
  },
  
  delete: async (id: string) => {
    try {
      const { error } = await supabase
        .from('regions')
        .delete()
        .eq('id', id);
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Region deleted successfully');
    } catch (error) {
      console.error('Error in delete region:', error);
      toast.error('Failed to delete region');
    }
  }
};
