
import { useState } from 'react';
import { api } from '@/lib/api';
import { AddGroupMemberData } from '@/lib/api/types';

export function useGroupMembers() {
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<any[]>([]);

  // Fetch group members
  const fetchGroupMembers = async (groupId: string) => {
    setLoading(true);
    try {
      const data = await api.notifications.getGroupMembers(groupId);
      setMembers(data);
    } catch (error) {
      console.error('Error fetching group members:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add members to a group
  const addGroupMembers = async (data: AddGroupMemberData) => {
    setLoading(true);
    try {
      await api.notifications.addGroupMembers(
        data.groupId, 
        data.memberIds, 
        data.memberType
      );
      // Refresh the member list
      await fetchGroupMembers(data.groupId);
      return true;
    } catch (error) {
      console.error('Error adding group members:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Remove a member from a group
  const removeGroupMember = async (memberId: string, groupId: string) => {
    setLoading(true);
    try {
      await api.notifications.removeGroupMember(memberId);
      // Refresh the member list
      await fetchGroupMembers(groupId);
      return true;
    } catch (error) {
      console.error('Error removing group member:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    members,
    loading,
    fetchGroupMembers,
    addGroupMembers,
    removeGroupMember
  };
}
