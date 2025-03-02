
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const schools = {
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
};
