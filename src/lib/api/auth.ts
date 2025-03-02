
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const auth = {
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
};

// Import type from the types module
import { Profile } from './types';
