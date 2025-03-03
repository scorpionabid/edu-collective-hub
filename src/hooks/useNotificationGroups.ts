
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { NotificationGroup } from '@/lib/api/types';

export const useNotificationGroups = () => {
  const [groups, setGroups] = useState<NotificationGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Access the notifications.groups.getAll method correctly
      const groupsData = await api.notifications.groups.getAll();
      setGroups(groupsData);
    } catch (err: any) {
      setError(err);
      toast.error('Failed to fetch notification groups');
    } finally {
      setLoading(false);
    }
  }, []);

  const createGroup = useCallback(async (groupData: { name: string; description?: string }) => {
    setLoading(true);
    setError(null);
    
    try {
      // Access the notifications.groups.create method correctly
      const newGroup = await api.notifications.groups.create(groupData);
      setGroups((prevGroups) => [...prevGroups, newGroup]);
      toast.success('Notification group created successfully');
      return newGroup;
    } catch (err: any) {
      setError(err);
      toast.error('Failed to create notification group');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateGroup = useCallback(async (id: string, groupData: { name?: string; description?: string }) => {
    setLoading(true);
    setError(null);
    
    try {
      // Access the notifications.groups.update method correctly
      const updatedGroup = await api.notifications.groups.update(id, groupData);
      setGroups((prevGroups) => 
        prevGroups.map((group) => group.id === id ? updatedGroup : group)
      );
      toast.success('Notification group updated successfully');
      return updatedGroup;
    } catch (err: any) {
      setError(err);
      toast.error('Failed to update notification group');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteGroup = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Access the notifications.groups.delete method correctly
      await api.notifications.groups.deleteGroup(id);
      setGroups((prevGroups) => prevGroups.filter((group) => group.id !== id));
      toast.success('Notification group deleted successfully');
    } catch (err: any) {
      setError(err);
      toast.error('Failed to delete notification group');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

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
