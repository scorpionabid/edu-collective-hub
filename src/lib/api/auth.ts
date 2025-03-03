
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  
  signUp: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Sign up successful. Check your email for verification.');
      return data;
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
      
      toast.success('Signed out successfully');
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
      
      toast.success('Password reset email sent');
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
      
      toast.success('Password updated successfully');
    } catch (error: any) {
      console.error('Error in updatePassword:', error);
      throw error;
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
      throw error;
    }
  }
};
