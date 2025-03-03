
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { auth, UserProfile } from '@/lib/api/auth';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { useUserProfile } from '@/hooks/useUserProfile';
import { AuthContextType } from '@/types/auth';
import { redirectBasedOnRole, shouldRedirectToDashboard, handleAuthError } from '@/utils/authUtils';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, loading: profileLoading, updateProfile, refreshProfile } = useUserProfile(user);

  // Check authentication status
  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      // Check for active session
      const { data: { session: activeSession } } = await supabase.auth.getSession();
      setSession(activeSession);
      
      if (activeSession?.user) {
        setUser(activeSession.user);
      } else {
        setUser(null);
        // Only redirect to login if not already on login or reset password page
        if (location.pathname !== '/login' && location.pathname !== '/reset-password') {
          navigate('/login');
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setUser(null);
      // Only redirect to login if not already on login or reset password page
      if (location.pathname !== '/login' && location.pathname !== '/reset-password') {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate, location.pathname]);

  // Initialize auth state
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Setup auth state change listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user || null);
      
      if (event === 'SIGNED_IN') {
        // Manually refresh profile when signed in
        if (newSession?.user) {
          setUser(newSession.user);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        navigate('/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, refreshProfile]);

  // Handle redirects based on user role
  useEffect(() => {
    if (user && profile && !loading && !profileLoading) {
      if (shouldRedirectToDashboard(profile, location.pathname)) {
        redirectBasedOnRole(profile.role, navigate);
      }
    }
  }, [user, profile, loading, profileLoading, location.pathname, navigate]);

  // Auth methods
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const result = await auth.signIn(email, password);
      
      if (!result || !result.user) {
        return handleAuthError(new Error("Sign in failed"), "Giriş alınmadı");
      }
      
      toast.success("Uğurla daxil oldunuz");
    } catch (error) {
      return handleAuthError(error, "Giriş alınmadı");
    } finally {
      setLoading(false);
    }
  };

  const signup = async (
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
      setLoading(true);
      await auth.signUp(email, password, userData);
      // Don't auto-login after signup since email verification may be required
    } catch (error) {
      return handleAuthError(error, "Qeydiyyat alınmadı");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await auth.signOut();
      // Auth state listener will handle state update and redirection
    } catch (error) {
      console.error('Error during logout:', error);
      // Force logout even if API call fails
      setUser(null);
      setSession(null);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };
  
  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      await auth.resetPassword(email);
      return Promise.resolve();
    } catch (error) {
      toast.error("Şifrə yeniləmə linki göndərilə bilmədi");
      return Promise.reject(error);
    } finally {
      setLoading(false);
    }
  };

  const isAuthenticated = !!user && !!session;
  const contextLoading = loading || profileLoading;

  return (
    <AuthContext.Provider
      value={{
        session,
        user: user ? {
          ...user,
          regionId: profile?.regionId,
          sectorId: profile?.sectorId,
          schoolId: profile?.schoolId,
          role: profile?.role
        } : null,
        profile,
        loading: contextLoading,
        login,
        signup,
        logout,
        isAuthenticated,
        resetPassword,
        updatePassword: auth.updatePassword,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
