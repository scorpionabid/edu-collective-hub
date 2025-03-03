
import { useState, useEffect, useCallback } from "react";
import { User } from "@supabase/supabase-js";
import { auth, UserProfile } from "@/lib/api/auth";
import { toast } from "sonner";

export const useUserProfile = (user: User | null) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const userProfile = await auth.getProfile(user.id);
      setProfile(userProfile);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast.error("Failed to load user profile");
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateProfile = async (
    profileData: Partial<Omit<UserProfile, "id" | "userId" | "createdAt">>
  ) => {
    if (!user || !profile) return null;

    try {
      setLoading(true);
      const updatedProfile = await auth.updateProfile(user.id, profileData);
      if (updatedProfile) {
        setProfile(updatedProfile);
        toast.success("Profile updated successfully");
      }
      return updatedProfile;
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = useCallback(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, loading, updateProfile, refreshProfile };
};
