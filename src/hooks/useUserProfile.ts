
import { useState, useEffect, useCallback } from 'react';
import { auth, UserProfile } from '@/lib/api/auth';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useUserProfile = (user: User | null) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const userProfile = await auth.getUserProfile(user.id);
      setProfile(userProfile);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching user profile:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateProfile = useCallback(async (profileData: Partial<Omit<UserProfile, 'id' | 'userId' | 'createdAt'>>) => {
    if (!user) return null;

    try {
      const updatedProfile = await auth.updateUserProfile(user.id, profileData);
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (err) {
      console.error('Error updating profile:', err);
      throw err;
    }
  }, [user]);

  // Initial fetch
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Subscribe to profile changes
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          fetchProfile();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, fetchProfile]);

  return {
    profile,
    loading,
    error,
    updateProfile,
    refreshProfile: fetchProfile
  };
};
