
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserProfile, Profile } from "./types";

export const profiles = {
  getAll: async (): Promise<UserProfile[]> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      
      if (error) throw error;
      
      return data.map(profile => ({
        id: profile.id,
        userId: profile.user_id,
        firstName: profile.first_name,
        lastName: profile.last_name,
        role: profile.role,
        regionId: profile.region_id,
        sectorId: profile.sector_id,
        schoolId: profile.school_id,
        createdAt: profile.created_at,
        name: `${profile.first_name} ${profile.last_name}` // Add name property
      }));
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast.error('Failed to load profiles');
      return [];
    }
  },
  
  getById: async (id: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      if (!data) return null;
      
      return {
        id: data.id,
        userId: data.user_id,
        firstName: data.first_name,
        lastName: data.last_name,
        role: data.role,
        regionId: data.region_id,
        sectorId: data.sector_id,
        schoolId: data.school_id,
        createdAt: data.created_at,
        name: `${data.first_name} ${data.last_name}` // Add name property
      };
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
      return null;
    }
  },
  
  getByUserId: async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) throw error;
      
      if (!data) return null;
      
      return {
        id: data.id,
        userId: data.user_id,
        firstName: data.first_name,
        lastName: data.last_name,
        role: data.role,
        regionId: data.region_id,
        sectorId: data.sector_id,
        schoolId: data.school_id,
        createdAt: data.created_at,
        name: `${data.first_name} ${data.last_name}` // Add name property
      };
    } catch (error) {
      console.error('Error fetching profile by user ID:', error);
      toast.error('Failed to load profile');
      return null;
    }
  },
  
  create: async (profile: Omit<UserProfile, 'id' | 'createdAt'>): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          user_id: profile.userId,
          first_name: profile.firstName,
          last_name: profile.lastName,
          role: profile.role,
          region_id: profile.regionId,
          sector_id: profile.sectorId,
          school_id: profile.schoolId
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        userId: data.user_id,
        firstName: data.first_name,
        lastName: data.last_name,
        role: data.role,
        regionId: data.region_id,
        sectorId: data.sector_id,
        schoolId: data.school_id,
        createdAt: data.created_at,
        name: `${data.first_name} ${data.last_name}` // Add name property
      };
    } catch (error) {
      console.error('Error creating profile:', error);
      toast.error('Failed to create profile');
      return null;
    }
  },
  
  update: async (id: string, profile: Partial<Omit<UserProfile, 'id' | 'userId' | 'createdAt'>>): Promise<UserProfile | null> => {
    try {
      const updates: any = {};
      
      if (profile.firstName) updates.first_name = profile.firstName;
      if (profile.lastName) updates.last_name = profile.lastName;
      if (profile.role) updates.role = profile.role;
      if (profile.regionId !== undefined) updates.region_id = profile.regionId;
      if (profile.sectorId !== undefined) updates.sector_id = profile.sectorId;
      if (profile.schoolId !== undefined) updates.school_id = profile.schoolId;
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        userId: data.user_id,
        firstName: data.first_name,
        lastName: data.last_name,
        role: data.role,
        regionId: data.region_id,
        sectorId: data.sector_id,
        schoolId: data.school_id,
        createdAt: data.created_at,
        name: `${data.first_name} ${data.last_name}` // Add name property
      };
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
      return null;
    }
  },
  
  delete: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error deleting profile:', error);
      toast.error('Failed to delete profile');
      return false;
    }
  }
};
