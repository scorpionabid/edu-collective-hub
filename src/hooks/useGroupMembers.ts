
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { AddGroupMemberData } from '@/lib/api/types';
import { toast } from 'sonner';

export const useGroupMembers = (groupId: string) => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  // Get members of a notification group
  const {
    data: members,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['group-members', groupId],
    queryFn: async () => {
      if (api.groups && api.groups.getGroupMembers) {
        return api.groups.getGroupMembers(groupId);
      }
      setError('API method not available: getGroupMembers');
      return [];
    },
    enabled: !!groupId
  });

  // Add members to a group
  const addMembersMutation = useMutation({
    mutationFn: async (data: AddGroupMemberData) => {
      if (api.groups && api.groups.addGroupMembers) {
        return api.groups.addGroupMembers(data);
      }
      throw new Error('API method not available: addGroupMembers');
    },
    onSuccess: () => {
      toast.success('Members added to group successfully');
      queryClient.invalidateQueries({ queryKey: ['group-members', groupId] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add members to group');
      setError(error.message || 'Failed to add members to group');
    }
  });

  // Remove a member from a group
  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      if (api.groups && api.groups.removeGroupMember) {
        return api.groups.removeGroupMember(groupId, memberId);
      }
      throw new Error('API method not available: removeGroupMember');
    },
    onSuccess: () => {
      toast.success('Member removed from group successfully');
      queryClient.invalidateQueries({ queryKey: ['group-members', groupId] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to remove member from group');
      setError(error.message || 'Failed to remove member from group');
    }
  });

  // Add members to the group
  const addMembers = useCallback(async (memberIds: string[], memberType: string) => {
    return addMembersMutation.mutateAsync({
      groupId,
      memberIds,
      memberType
    });
  }, [groupId, addMembersMutation]);

  // Remove a member from the group
  const removeMember = useCallback(async (memberId: string) => {
    return removeMemberMutation.mutateAsync(memberId);
  }, [groupId, removeMemberMutation]);

  return {
    members,
    isLoading,
    isError,
    error,
    addMembers,
    removeMember,
    refetch
  };
};
