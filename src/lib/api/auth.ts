
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
    } catch (error) {
      console.error('Error in signIn:', error);
      return null;
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
    } catch (error) {
      console.error('Error in signUp:', error);
      return null;
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
    } catch (error) {
      console.error('Error in signOut:', error);
    }
  },
  
  resetPassword: async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Password reset email sent');
    } catch (error) {
      console.error('Error in resetPassword:', error);
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
    } catch (error) {
      console.error('Error in updatePassword:', error);
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
    } catch (error) {
      console.error('Error in getUser:', error);
      return null;
    }
  }
};
