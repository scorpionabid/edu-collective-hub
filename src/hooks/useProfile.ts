
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export function useProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const profileQuery = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => user ? api.profiles.getByUserId(user.id) : null,
    enabled: !!user
  });
  
  const updateProfile = useMutation({
    mutationFn: (profile: any) => user ? api.profiles.update(profileQuery.data?.id, profile) : Promise.reject('No user'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
    }
  });
  
  return {
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    isError: profileQuery.isError,
    error: profileQuery.error,
    updateProfile
  };
}
