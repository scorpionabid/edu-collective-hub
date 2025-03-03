
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";

export interface UserProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin';
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
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      return data;
    } catch (error: any) {
      console.error('Error in signIn:', error);
      throw error;
    }
  },
  
  signUp: async (email: string, password: string, userData: { firstName: string; lastName: string; role: string; regionId?: string; sectorId?: string; schoolId?: string }) => {
    try {
      // First create the auth user
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
        toast.error(authError.message);
        throw authError;
      }
      
      // Then create a profile record
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: authData.user.id,
            first_name: userData.firstName,
            last_name: userData.lastName,
            email: email,
            role: userData.role,
            region_id: userData.regionId || null,
            sector_id: userData.sectorId || null,
            school_id: userData.schoolId || null
          });
          
        if (profileError) {
          console.error('Error creating profile:', profileError);
          toast.error('Profil yaradılarkən xəta baş verdi');
          // Delete the auth user if profile creation fails
          await supabase.auth.admin.deleteUser(authData.user.id);
          throw profileError;
        }
      }
      
      toast.success('Qeydiyyat uğurla tamamlandı. Email-inizi təsdiqləyin.');
      return authData;
    } catch (error: any) {
      console.error('Error in signUp:', error);
      throw error;
    }
  },
  
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Uğurla çıxış edildi');
    } catch (error: any) {
      console.error('Error in signOut:', error);
      throw error;
    }
  },
  
  resetPassword: async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Şifrə sıfırlama linki göndərildi');
    } catch (error: any) {
      console.error('Error in resetPassword:', error);
      throw error;
    }
  },
  
  updatePassword: async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password
      });
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Şifrə uğurla yeniləndi');
    } catch (error: any) {
      console.error('Error in updatePassword:', error);
      throw error;
    }
  },
  
  getSession: async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error fetching session:', error);
        throw error;
      }
      
      return data.session;
    } catch (error: any) {
      console.error('Error in getSession:', error);
      return null;
    }
  },
  
  getUser: async () => {
    try {
      const { data, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('Error fetching user:', error);
        throw error;
      }
      
      return data.user;
    } catch (error: any) {
      console.error('Error in getUser:', error);
      return null;
    }
  },
  
  getUserProfile: async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching user profile:', error);
        throw error;
      }
      
      if (!data) return null;
      
      // Convert database fields to camelCase for the frontend
      return {
        id: data.id,
        userId: data.user_id,
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email || '', // Ensure email exists
        role: data.role as 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin',
        regionId: data.region_id,
        sectorId: data.sector_id,
        schoolId: data.school_id,
        createdAt: data.created_at
      };
    } catch (error: any) {
      console.error('Error in getUserProfile:', error);
      return null;
    }
  },
  
  updateUserProfile: async (userId: string, profileData: Partial<Omit<UserProfile, 'id' | 'userId' | 'createdAt'>>) => {
    try {
      const updateData: any = {};
      
      if (profileData.firstName) updateData.first_name = profileData.firstName;
      if (profileData.lastName) updateData.last_name = profileData.lastName;
      if (profileData.email) updateData.email = profileData.email;
      if (profileData.role) updateData.role = profileData.role;
      if (profileData.regionId !== undefined) updateData.region_id = profileData.regionId;
      if (profileData.sectorId !== undefined) updateData.sector_id = profileData.sectorId;
      if (profileData.schoolId !== undefined) updateData.school_id = profileData.schoolId;
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) {
        toast.error('Profil yenilənərkən xəta baş verdi');
        throw error;
      }
      
      toast.success('Profil uğurla yeniləndi');
      
      // Convert database fields to camelCase for the frontend
      return {
        id: data.id,
        userId: data.user_id,
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email || '', // Ensure email exists
        role: data.role as 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin',
        regionId: data.region_id,
        sectorId: data.sector_id,
        schoolId: data.school_id,
        createdAt: data.created_at
      };
    } catch (error: any) {
      console.error('Error in updateUserProfile:', error);
      throw error;
    }
  }
};
