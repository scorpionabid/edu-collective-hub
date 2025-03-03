
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { AddGroupMemberData } from "@/lib/api";

export const useGroupMembers = (groupId: string) => {
  const queryClient = useQueryClient();
  
  const { 
    data: members = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['groupMembers', groupId],
    queryFn: () => api.notifications.getGroupMembers(groupId),
    enabled: !!groupId,
  });

  const addMembersMutation = useMutation({
    mutationFn: (members: AddGroupMemberData[]) => api.notifications.addGroupMembers(groupId, members),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groupMembers', groupId] });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (memberId: string) => api.notifications.removeGroupMember(memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groupMembers', groupId] });
    },
  });

  const addMembers = async (members: AddGroupMemberData[]): Promise<void> => {
    return addMembersMutation.mutateAsync(members);
  };

  const removeMember = async (memberId: string): Promise<void> => {
    return removeMemberMutation.mutateAsync(memberId);
  };

  return {
    members,
    isLoading,
    error: error as Error | null,
    addMembers,
    removeMember
  };
};
