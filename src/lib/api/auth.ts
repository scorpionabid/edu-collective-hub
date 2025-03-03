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

/**
 * Get the current user's profile information
 */
export const getUserProfile = async (): Promise<UserProfile | null> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      return null;
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.user.id)
      .single();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    
    if (!data) {
      return null;
    }
    
    // Get user email from auth
    const email = user.user.email || '';
    
    return {
      id: data.id,
      userId: data.user_id,
      firstName: data.first_name,
      lastName: data.last_name,
      email, // Add email from auth user
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
};

/**
 * Sign up a new user
 */
export const signup = async (
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
};

/**
 * Log in an existing user
 */
export const login = async (email: string, password: string): Promise<void> => {
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      handleAuthError(error, "Login failed");
      throw error;
    }
  } catch (error: any) {
    handleAuthError(error, "Login failed");
    throw error;
  }
};

/**
 * Log out the current user
 */
export const logout = async (): Promise<void> => {
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
};

/**
 * Reset a user's password
 */
export const resetPassword = async (email: string): Promise<void> => {
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
};

/**
 * Update a user's password
 */
export const updatePassword = async (password: string): Promise<void> => {
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
};

/**
 * Get the current session
 */
export const getSession = async (): Promise<{ session: Session | null; user: User | null }> => {
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
};

/**
 * Update a user's profile information
 */
export const updateUserProfile = async (
  profileData: Partial<Omit<UserProfile, 'id' | 'userId' | 'createdAt'>>
): Promise<UserProfile | null> => {
  try {
    // Get the current user
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('User not authenticated');
    }
    
    // Get the user profile
    const { data: profileRecord, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userData.user.id)
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
    const email = userData.user.email || '';
    
    return {
      id: data.id,
      userId: data.user_id,
      firstName: data.first_name,
      lastName: data.last_name,
      email, // Add email from auth user
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
};
