
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { UserProfile } from '@/lib/api/types';
import { toast } from 'sonner';

export const useUserProfile = (userId?: string) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchUserProfile(userId);
    } else {
      setLoading(false);
    }
  }, [userId]);

  const fetchUserProfile = async (uid: string) => {
    setLoading(true);
    try {
      const response = await api.auth.getUserProfile(uid);
      if (response.success && response.profile) {
        setProfile(response.profile);
      } else if (response.error) {
        setError(response.error);
        toast.error('Failed to load user profile');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      toast.error('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (profileData: Partial<UserProfile>) => {
    setLoading(true);
    try {
      if (!profile?.id) {
        throw new Error('No profile to update');
      }
      
      const response = await api.auth.updateUserProfile(profile.id, profileData);
      if (response.success && response.profile) {
        setProfile(response.profile);
        toast.success('Profile updated successfully');
        return response.profile;
      } else if (response.error) {
        setError(response.error);
        toast.error('Failed to update profile');
        return null;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      toast.error('Failed to update profile');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    loading,
    error,
    fetchUserProfile,
    updateUserProfile
  };
};
