
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { UserProfile } from '@/lib/api/types';

export const useUserProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Use getProfile instead of getUserProfile
      const result = await api.auth.getProfile();
      if (result.success && result.profile) {
        setProfile(result.profile);
      } else {
        throw new Error(result.error || 'Failed to fetch profile');
      }
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching user profile:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = useCallback(async (data: Partial<UserProfile>) => {
    setLoading(true);
    try {
      // Use updateProfile instead of updateUserProfile
      const result = await api.auth.updateProfile(data);
      if (result.success && result.profile) {
        setProfile(result.profile);
        return result.profile;
      } else {
        throw new Error(result.error || 'Failed to update profile');
      }
    } catch (err) {
      setError(err as Error);
      console.error('Error updating user profile:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile
  };
};
