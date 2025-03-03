
import { useState } from 'react';
import { api } from '@/lib/api';
import { AddGroupMemberData } from '@/lib/api/types';

export const useGroupMembers = (groupId: string) => {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const data = await api.notifications.getGroupMembers(groupId);
      setMembers(data);
      return data;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addMembers = async (memberData: AddGroupMemberData) => {
    setLoading(true);
    try {
      await api.notifications.addGroupMembers(memberData);
      await fetchMembers();
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeMember = async (memberId: string) => {
    setLoading(true);
    try {
      await api.notifications.removeGroupMember(groupId, memberId);
      await fetchMembers();
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    members,
    loading,
    error,
    fetchMembers,
    addMembers,
    removeMember
  };
};
