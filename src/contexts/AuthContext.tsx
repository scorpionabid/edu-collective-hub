
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { api } from '@/lib/api';
import type { User, Session } from '@supabase/supabase-js';
import type { UserProfile } from '@/lib/api/auth';
import { logger } from '@/lib/monitoring/logger';
import { setSentryUser, clearSentryUser } from '@/lib/monitoring/sentry';
import { trackApiCall } from '@/lib/monitoring/apiMetrics';

interface AuthContextType {
  user: UserProfile | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  updateProfile: (profileData: Partial<Omit<UserProfile, 'id' | 'userId' | 'createdAt'>>) => Promise<UserProfile>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setLoading(true);

        if (session?.user) {
          try {
            logger.info('Auth state changed', { event, userId: session.user.id });
            
            // Get user profile
            const response = await api.auth.getProfile();
            
            if (!response.success) {
              throw new Error(response.error);
            }

            if (response.profile) {
              setUser(response.profile);
              
              // Set user ID for logging
              logger.setUserId(response.profile.id);
              
              // Set user identity in Sentry
              setSentryUser({
                id: response.profile.id,
                email: session.user.email,
                role: response.profile.role
              });
            }
          } catch (error) {
            console.error('Error fetching user profile:', error);
          }
        } else {
          setUser(null);
          logger.clearUserId();
          clearSentryUser();
        }

        setLoading(false);
      }
    );

    // Initial session check
    const initializeAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);

        if (data.session?.user) {
          // Get user profile
          const response = await api.auth.getProfile();
          
          if (response.success && response.profile) {
            setUser(response.profile);
            
            // Set user ID for logging
            logger.setUserId(response.profile.id);
            
            // Set user identity in Sentry
            setSentryUser({
              id: response.profile.id,
              email: data.session.user.email,
              role: response.profile.role
            });
          }
        }
      } catch (error) {
        console.error('Error during auth initialization:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const result = await trackApiCall(
        'auth/login',
        'POST',
        async () => await api.auth.login(email, password)
      );
      
      if (!result.success) {
        throw new Error(result.error || 'Login failed');
      }
      
      logger.info('User logged in successfully', { userId: result.user.id });
    } catch (error: any) {
      logger.error('Login failed', { 
        email,
        errorMessage: error.message,
      });
      throw error;
    }
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      const result = await trackApiCall(
        'auth/signUp',
        'POST',
        async () => await api.auth.signUp({ 
          email, 
          password, 
          userData: { 
            firstName, 
            lastName, 
            role: 'user' 
          } 
        })
      );
      
      if (!result.success) {
        throw new Error(result.error || 'Registration failed');
      }
      
      logger.info('User registered successfully', { userId: result.user.id });
    } catch (error: any) {
      logger.error('Registration failed', { 
        email,
        errorMessage: error.message,
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Log the action before actually logging out so we can include user info
      if (user) {
        logger.info('User logged out', { userId: user.id });
      }
      
      // Clear user identity from logging systems
      logger.clearUserId();
      clearSentryUser();
      
      await trackApiCall(
        'auth/logout',
        'POST',
        async () => await api.auth.signOut()
      );
    } catch (error: any) {
      logger.error('Logout failed', { 
        errorMessage: error.message,
      });
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const result = await trackApiCall(
        'auth/resetPassword',
        'POST',
        async () => await api.auth.resetPassword(email)
      );
      
      if (!result.success) {
        throw new Error(result.error || 'Password reset failed');
      }
      
      logger.info('Password reset requested', { email });
    } catch (error: any) {
      logger.error('Password reset failed', { 
        email,
        errorMessage: error.message,
      });
      throw error;
    }
  };

  const updatePassword = async (password: string) => {
    try {
      const result = await trackApiCall(
        'auth/updatePassword',
        'POST',
        async () => await api.auth.updatePassword(password)
      );
      
      if (!result.success) {
        throw new Error(result.error || 'Password update failed');
      }
      
      logger.info('Password updated successfully', { userId: user?.id });
    } catch (error: any) {
      logger.error('Password update failed', { 
        userId: user?.id,
        errorMessage: error.message,
      });
      throw error;
    }
  };

  const updateProfile = async (profileData: Partial<Omit<UserProfile, 'id' | 'userId' | 'createdAt'>>) => {
    try {
      const result = await trackApiCall(
        'auth/updateProfile',
        'PUT',
        async () => await api.auth.updateProfile(profileData)
      );
      
      if (!result.success) {
        throw new Error(result.error || 'Profile update failed');
      }
      
      setUser(result.profile);
      logger.info('Profile updated successfully', { 
        userId: user?.id,
        fields: Object.keys(profileData).join(',')
      });
      
      return result.profile;
    } catch (error: any) {
      logger.error('Profile update failed', { 
        userId: user?.id,
        errorMessage: error.message,
      });
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        login,
        signUp,
        logout,
        resetPassword,
        updatePassword,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
