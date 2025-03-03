
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { AddGroupMemberData } from '@/lib/api/types';

export const useGroupMembers = (groupId: string) => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const {
    data: members = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['notificationGroups', groupId, 'members'],
    queryFn: async () => {
      try {
        const response = await api.notifications.groups.getGroupMembers(groupId);
        return response;
      } catch (err) {
        console.error('Error fetching group members:', err);
        setError('Failed to load group members');
        return [];
      }
    },
  });

  const addMembersMutation = useMutation({
    mutationFn: async (data: AddGroupMemberData) => {
      try {
        return await api.notifications.groups.addGroupMembers(data);
      } catch (err) {
        console.error('Error adding group members:', err);
        throw new Error('Failed to add members to group');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationGroups', groupId, 'members'] });
      toast.success('Members added to group successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add members to group');
      setError(error.message || 'Failed to add members to group');
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      try {
        return await api.notifications.groups.removeGroupMember(groupId, memberId);
      } catch (err) {
        console.error('Error removing group member:', err);
        throw new Error('Failed to remove member from group');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationGroups', groupId, 'members'] });
      toast.success('Member removed from group successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to remove member from group');
      setError(error.message || 'Failed to remove member from group');
    },
  });

  const addMembers = useCallback(
    (memberIds: string[], memberType: string) => {
      addMembersMutation.mutate({ groupId, memberIds, memberType });
    },
    [groupId, addMembersMutation]
  );

  const removeMember = useCallback(
    (memberId: string) => {
      removeMemberMutation.mutate(memberId);
    },
    [removeMemberMutation]
  );

  return {
    members,
    isLoading,
    isError,
    error,
    addMembers,
    removeMember,
    refetch,
  };
};
