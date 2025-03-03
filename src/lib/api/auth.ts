
import { supabase } from '@/integrations/supabase/client';
import { AuthError, Session, User, UserAttributes } from '@supabase/supabase-js';
import { handleAuthError } from '@/utils/authUtils';

export interface UserProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string; // Add email field
  role: string;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
  createdAt?: string;
}

// Export all auth functions in an object
export const auth = {
  /**
   * Get the current user's profile information
   */
  getUserProfile: async (userId: string): Promise<UserProfile | null> => {
    try {
      if (!userId) {
        return null;
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }
      
      if (!data) {
        return null;
      }
      
      // Get user email from auth
      const { data: userData } = await supabase.auth.admin.getUserById(userId);
      const email = userData?.user?.email || '';
      
      return {
        id: data.id,
        userId: data.user_id,
        firstName: data.first_name,
        lastName: data.last_name,
        email,
        role: data.role,
        regionId: data.region_id,
        sectorId: data.sector_id,
        schoolId: data.school_id,
        createdAt: data.created_at
      };
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      return null;
    }
  },

  /**
   * Sign up a new user
   */
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
  ): Promise<void> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            ...userData
          }
        }
      });

      if (error) {
        handleAuthError(error, "Signup failed");
        throw error;
      }

      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            { 
              user_id: data.user.id, 
              first_name: userData.firstName, 
              last_name: userData.lastName, 
              role: userData.role,
              region_id: userData.regionId,
              sector_id: userData.sectorId,
              school_id: userData.schoolId
            }
          ]);

        if (profileError) {
          handleAuthError(profileError, "Failed to create user profile");
          throw profileError;
        }
      }
    } catch (error: any) {
      handleAuthError(error, "Signup failed");
      throw error;
    }
  },

  /**
   * Log in an existing user
   */
  signIn: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        handleAuthError(error, "Login failed");
        throw error;
      }
      
      return data;
    } catch (error: any) {
      handleAuthError(error, "Login failed");
      throw error;
    }
  },

  /**
   * Log out the current user
   */
  signOut: async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        handleAuthError(error, "Logout failed");
        throw error;
      }
    } catch (error: any) {
      handleAuthError(error, "Logout failed");
      throw error;
    }
  },

  /**
   * Reset a user's password
   */
  resetPassword: async (email: string): Promise<void> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) {
        handleAuthError(error, "Password reset failed");
        throw error;
      }
    } catch (error: any) {
      handleAuthError(error, "Password reset failed");
      throw error;
    }
  },

  /**
   * Update a user's password
   */
  updatePassword: async (password: string): Promise<void> => {
    try {
      const { error } = await supabase.auth.updateUser({ password: password });

      if (error) {
        handleAuthError(error, "Password update failed");
        throw error;
      }
    } catch (error: any) {
      handleAuthError(error, "Password update failed");
      throw error;
    }
  },

  /**
   * Get the current session
   */
  getSession: async (): Promise<{ session: Session | null; user: User | null }> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      return {
        session: session,
        user: session?.user || null,
      };
    } catch (error: any) {
      handleAuthError(error, "Failed to get session");
      return { session: null, user: null };
    }
  },

  /**
   * Update a user's profile information
   */
  updateUserProfile: async (
    userId: string,
    profileData: Partial<Omit<UserProfile, 'id' | 'userId' | 'createdAt'>>
  ): Promise<UserProfile | null> => {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }
      
      // Get the user profile
      const { data: profileRecord, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (profileError) {
        throw profileError;
      }
      
      if (!profileRecord) {
        throw new Error('Profile not found');
      }
      
      // Convert camelCase to snake_case for the database
      const dbData: Record<string, any> = {};
      if (profileData.firstName) dbData.first_name = profileData.firstName;
      if (profileData.lastName) dbData.last_name = profileData.lastName;
      if (profileData.role) dbData.role = profileData.role;
      if (profileData.regionId) dbData.region_id = profileData.regionId;
      if (profileData.sectorId) dbData.sector_id = profileData.sectorId;
      if (profileData.schoolId) dbData.school_id = profileData.schoolId;
      
      // Update the profile
      const { data, error } = await supabase
        .from('profiles')
        .update(dbData)
        .eq('id', profileRecord.id)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Get user email from auth
      const { data: userData } = await supabase.auth.admin.getUserById(userId);
      const email = userData?.user?.email || '';
      
      return {
        id: data.id,
        userId: data.user_id,
        firstName: data.first_name,
        lastName: data.last_name,
        email,
        role: data.role,
        regionId: data.region_id,
        sectorId: data.sector_id,
        schoolId: data.school_id,
        createdAt: data.created_at
      };
    } catch (error) {
      console.error('Error updating profile:', error);
      return null;
    }
  }
};
