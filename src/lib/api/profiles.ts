
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Profile } from "./types";

export const profiles = {
  getAll: async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      
      if (error) {
        console.error('Error fetching profiles:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getAll profiles:', error);
      return [];
    }
  },
  
  getById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error in getById profile:', error);
      return null;
    }
  },
  
  getByUserId: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching profile by user id:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error in getByUserId profile:', error);
      return null;
    }
  },
  
  create: async (profile: Omit<Profile, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          first_name: profile.firstName,
          last_name: profile.lastName,
          email: profile.email,
          role: profile.role,
          region_id: profile.regionId,
          sector_id: profile.sectorId,
          school_id: profile.schoolId,
          user_id: profile.userId
        })
        .select()
        .single();
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Profile created successfully');
      return data;
    } catch (error) {
      console.error('Error in create profile:', error);
      toast.error('Failed to create profile');
      return null;
    }
  },
  
  update: async (id: string, profile: Partial<Profile>) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          first_name: profile.firstName,
          last_name: profile.lastName,
          email: profile.email,
          role: profile.role,
          region_id: profile.regionId,
          sector_id: profile.sectorId,
          school_id: profile.schoolId
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Profile updated successfully');
      return data;
    } catch (error) {
      console.error('Error in update profile:', error);
      toast.error('Failed to update profile');
      return null;
    }
  },
  
  delete: async (id: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Profile deleted successfully');
    } catch (error) {
      console.error('Error in delete profile:', error);
      toast.error('Failed to delete profile');
    }
  }
};
