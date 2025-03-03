
import { useState } from 'react';
import { api } from '@/lib/api';
import { 
  NotificationGroup, 
  CreateNotificationGroupData, 
  UpdateNotificationGroupData 
} from '@/lib/api/types';

export const useNotificationGroups = () => {
  const [groups, setGroups] = useState<NotificationGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const data = await api.notifications.getNotificationGroups();
      setGroups(data);
      return data;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async (groupData: CreateNotificationGroupData) => {
    setLoading(true);
    try {
      const group = await api.notifications.createNotificationGroup(groupData);
      setGroups(prev => [...prev, group]);
      return group;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateGroup = async (groupData: UpdateNotificationGroupData) => {
    setLoading(true);
    try {
      const updatedGroup = await api.notifications.updateNotificationGroup(groupData);
      setGroups(prev => prev.map(g => g.id === updatedGroup.id ? updatedGroup : g));
      return updatedGroup;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteGroup = async (id: string) => {
    setLoading(true);
    try {
      await api.notifications.deleteNotificationGroup(id);
      setGroups(prev => prev.filter(g => g.id !== id));
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    groups,
    loading,
    error,
    fetchGroups,
    createGroup,
    updateGroup,
    deleteGroup
  };
};
