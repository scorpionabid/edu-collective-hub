
import { supabase } from "@/integrations/supabase/client";

export const profiles = {
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
};
