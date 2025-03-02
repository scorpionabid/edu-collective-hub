
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const sectors = {
  getAll: async () => {
    try {
      const { data, error } = await supabase
        .from('sectors')
        .select('*');
      
      if (error) {
        console.error('Error fetching sectors:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getAll sectors:', error);
      return [];
    }
  },
  
  getByRegion: async (regionId: string) => {
    try {
      const { data, error } = await supabase
        .from('sectors')
        .select('*')
        .eq('region_id', regionId);
      
      if (error) {
        console.error('Error fetching sectors by region:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getByRegion sectors:', error);
      return [];
    }
  },
  
  create: async (name: string, regionId: string) => {
    try {
      const { data, error } = await supabase
        .from('sectors')
        .insert({ name, region_id: regionId })
        .select()
        .single();
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Sector created successfully');
      return data;
    } catch (error) {
      console.error('Error in create sector:', error);
      toast.error('Failed to create sector');
      return { id: "0", name, region_id: regionId };
    }
  },
  
  update: async (id: string, name: string) => {
    try {
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
    } catch (error) {
      console.error('Error in update sector:', error);
      toast.error('Failed to update sector');
      return { id, name };
    }
  },
  
  delete: async (id: string) => {
    try {
      const { error } = await supabase
        .from('sectors')
        .delete()
        .eq('id', id);
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Sector deleted successfully');
    } catch (error) {
      console.error('Error in delete sector:', error);
      toast.error('Failed to delete sector');
    }
  }
};
