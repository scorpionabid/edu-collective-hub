
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface UserProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  role: string;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
  createdAt: string;
}

export const auth = {
  signIn: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  signUp: async (
    email: string, 
    password: string, 
    userData: { 
      firstName: string; 
      lastName: string; 
      role: string; 
      regionId?: string; 
      sectorId?: string; 
      schoolId?: string 
    }
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: userData.role,
            regionId: userData.regionId,
            sectorId: userData.sectorId,
            schoolId: userData.schoolId
          }
        }
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  },
  
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Signout error:', error);
      throw error;
    }
  },
  
  resetPassword: async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (error) throw error;
      toast.success("Password reset link sent to your email");
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  },
  
  updatePassword: async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password
      });
      
      if (error) throw error;
      toast.success("Password has been updated");
    } catch (error) {
      console.error('Update password error:', error);
      throw error;
    }
  },
  
  getProfile: async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('userId', userId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get profile error:', error);
      return null;
    }
  },
  
  updateProfile: async (
    userId: string, 
    profileData: Partial<Omit<UserProfile, 'id' | 'userId' | 'createdAt'>>
  ): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('userId', userId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Update profile error:', error);
      return null;
    }
  }
};
