
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserProfile } from './types';

export const auth = {
  login: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      return {
        success: true,
        user: data.user,
        session: data.session
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  logout: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  register: async (email: string, password: string, userData: any) => {
    try {
      // First, create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            role: userData.role || 'user'
          }
        }
      });
      
      if (authError) throw authError;
      
      if (!authData.user) {
        throw new Error('Failed to create user');
      }
      
      // Then, create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: authData.user.id,
          first_name: userData.firstName,
          last_name: userData.lastName,
          role: userData.role || 'user',
          region_id: userData.regionId,
          sector_id: userData.sectorId,
          school_id: userData.schoolId
        });
        
      if (profileError) {
        // If profile creation fails, try to delete the auth user
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw profileError;
      }
      
      return {
        success: true,
        user: authData.user
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  resetPassword: async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      console.error('Reset password error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  updatePassword: async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password
      });
      
      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      console.error('Update password error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  getProfile: async (): Promise<UserProfile | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
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
        createdAt: data.created_at
      };
    } catch (error) {
      console.error('Get profile error:', error);
      return null;
    }
  },
  
  updateProfile: async (profileData: Partial<UserProfile>): Promise<UserProfile | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('User not authenticated');
      
      const updateData: any = {};
      
      if (profileData.firstName !== undefined) updateData.first_name = profileData.firstName;
      if (profileData.lastName !== undefined) updateData.last_name = profileData.lastName;
      if (profileData.regionId !== undefined) updateData.region_id = profileData.regionId;
      if (profileData.sectorId !== undefined) updateData.sector_id = profileData.sectorId;
      if (profileData.schoolId !== undefined) updateData.school_id = profileData.schoolId;
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', user.id)
        .select()
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
        createdAt: data.created_at
      };
    } catch (error) {
      console.error('Update profile error:', error);
      return null;
    }
  }
};
