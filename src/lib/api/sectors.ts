
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const sectors = {
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
};
