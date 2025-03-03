
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserProfile } from './types';

// Make sure we export UserProfile for other parts of the code
export { UserProfile };

export const auth = {
  login: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        return { success: false, error };
      }
      
      return { 
        success: true, 
        user: data.user, 
        session: data.session 
      };
    } catch (error) {
      console.error('Error signing in:', error);
      return { success: false, error };
    }
  },
  
  signUp: async (email: string, password: string, userData: { firstName: string; lastName: string; role: string; regionId?: string; sectorId?: string; schoolId?: string }) => {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            role: userData.role
          }
        }
      });
      
      if (authError) {
        return { success: false, error: authError };
      }
      
      if (authData.user) {
        // Create profile for the user
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: authData.user.id,
            first_name: userData.firstName,
            last_name: userData.lastName,
            role: userData.role,
            region_id: userData.regionId,
            sector_id: userData.sectorId,
            school_id: userData.schoolId
          })
          .select()
          .single();
        
        if (profileError) {
          console.error('Error creating profile:', profileError);
          return { success: false, error: profileError };
        }
        
        return { 
          success: true, 
          user: authData.user,
          profile: mapDbProfileToUserProfile(profileData)
        };
      }
      
      return { success: false, error: new Error('Failed to create user') };
    } catch (error) {
      console.error('Error signing up:', error);
      return { success: false, error };
    }
  },
  
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return { success: false, error };
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error signing out:', error);
      return { success: false, error };
    }
  },
  
  resetPassword: async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (error) {
        return { success: false, error };
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error resetting password:', error);
      return { success: false, error };
    }
  },
  
  updatePassword: async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        return { success: false, error };
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error updating password:', error);
      return { success: false, error };
    }
  },
  
  updateProfile: async (profileData: Partial<UserProfile>) => {
    try {
      // First ensure we have the user's ID
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData?.user) {
        return { success: false, error: 'User not authenticated' };
      }
      
      // Map profile data to database fields
      const dbProfileData: any = {
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        role: profileData.role,
        region_id: profileData.regionId,
        sector_id: profileData.sectorId,
        school_id: profileData.schoolId
      };
      
      // Remove undefined fields
      Object.keys(dbProfileData).forEach(key => 
        dbProfileData[key] === undefined && delete dbProfileData[key]
      );
      
      // Update the profile in the database
      const { data, error } = await supabase
        .from('profiles')
        .update(dbProfileData)
        .eq('user_id', userData.user.id)
        .select()
        .single();
      
      if (error) {
        return { success: false, error };
      }
      
      return { 
        success: true, 
        profile: mapDbProfileToUserProfile(data)
      };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, error };
    }
  }
};

// Helper function to map database profile to UserProfile
function mapDbProfileToUserProfile(dbProfile: any): UserProfile {
  return {
    id: dbProfile.id,
    userId: dbProfile.user_id,
    firstName: dbProfile.first_name,
    lastName: dbProfile.last_name,
    role: dbProfile.role,
    regionId: dbProfile.region_id,
    sectorId: dbProfile.sector_id,
    schoolId: dbProfile.school_id,
    createdAt: dbProfile.created_at
  };
}
