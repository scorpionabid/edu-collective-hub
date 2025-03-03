
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { AddGroupMemberData } from '@/lib/api/types';

export function useGroupMembers(groupId?: string) {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  // Fetch group members
  const {
    data: members = [],
    isLoading: isMembersLoading,
    error: membersError,
    refetch: refetchMembers,
  } = useQuery({
    queryKey: ['groupMembers', groupId],
    queryFn: () => api.notifications.groups.getGroupMembers(groupId!),
    enabled: !!groupId,
  });

  // Add members mutation
  const addMembersMutation = useMutation({
    mutationFn: (data: AddGroupMemberData) => 
      api.notifications.groups.addGroupMembers(data),
    onSuccess: () => {
      toast.success('Members added successfully');
      queryClient.invalidateQueries({ queryKey: ['groupMembers', groupId] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to add members: ${error.message}`);
    },
  });

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: (memberId: string) => 
      api.notifications.groups.removeGroupMember(groupId!, memberId),
    onSuccess: () => {
      toast.success('Member removed successfully');
      queryClient.invalidateQueries({ queryKey: ['groupMembers', groupId] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove member: ${error.message}`);
    },
  });

  // Add members function
  const addMembers = async (memberIds: string[], memberType: string) => {
    if (!groupId) {
      toast.error('No group selected');
      return;
    }

    setIsLoading(true);
    try {
      await addMembersMutation.mutateAsync({
        groupId,
        memberIds,
        memberType,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Remove member function
  const removeMember = async (memberId: string) => {
    if (!groupId) {
      toast.error('No group selected');
      return;
    }

    setIsLoading(true);
    try {
      await removeMemberMutation.mutateAsync(memberId);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    members,
    isLoading: isLoading || isMembersLoading,
    error: membersError,
    addMembers,
    removeMember,
    refetchMembers,
  };
}
