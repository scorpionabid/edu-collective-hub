
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { AddGroupMemberData } from '@/lib/api/types';

export const useGroupMembers = () => {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchMembers = useCallback(async (groupId: string, memberType?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const membersData = await api.notifications.groups.getMembers(groupId, memberType);
      setMembers(membersData);
    } catch (err: any) {
      setError(err);
      toast.error('Failed to fetch group members');
    } finally {
      setLoading(false);
    }
  }, []);

  const addMembers = useCallback(async (data: AddGroupMemberData) => {
    setLoading(true);
    setError(null);
    
    try {
      await api.notifications.groups.addMembers(data);
      // Refresh members list
      const membersData = await api.notifications.groups.getMembers(data.groupId);
      setMembers(membersData);
      toast.success('Members added to group successfully');
    } catch (err: any) {
      setError(err);
      toast.error('Failed to add members to group');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeMembers = useCallback(async (groupId: string, memberIds: string[]) => {
    setLoading(true);
    setError(null);
    
    try {
      await api.notifications.groups.removeMembers(groupId, memberIds);
      // Refresh members list
      const membersData = await api.notifications.groups.getMembers(groupId);
      setMembers(membersData);
      toast.success('Members removed from group successfully');
    } catch (err: any) {
      setError(err);
      toast.error('Failed to remove members from group');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    members,
    loading,
    error,
    fetchMembers,
    addMembers,
    removeMembers
  };
};
