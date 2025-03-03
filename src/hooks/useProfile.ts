
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

export function useProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // We would normally fetch this from an API
        // For now, we'll just use the user object
        setProfile({
          id: user.id,
          email: user.email,
          firstName: 'Test',
          lastName: 'User',
          role: user.role || 'user',
          regionId: user.regionId,
          sectorId: user.sectorId,
          schoolId: user.schoolId
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const updateProfile = async (data: any) => {
    try {
      setLoading(true);
      // In a real app, we would call an API to update the profile
      setProfile({ ...profile, ...data });
      toast.success('Profile updated successfully');
      return { ...profile, ...data };
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { profile, loading, updateProfile };
}
