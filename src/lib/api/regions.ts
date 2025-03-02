
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const regions = {
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
};
