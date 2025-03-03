
import { useState } from 'react';
import { api } from '@/lib/api';
import { NotificationGroup, CreateNotificationGroupData, UpdateNotificationGroupData } from '@/lib/api/types';

export function useNotificationGroups() {
  const [groups, setGroups] = useState<NotificationGroup[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch notification groups
  const fetchNotificationGroups = async () => {
    setLoading(true);
    try {
      const data = await api.notifications.getNotificationGroups();
      setGroups(data);
    } catch (error) {
      console.error('Error fetching notification groups:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create a new notification group
  const createNotificationGroup = async (data: CreateNotificationGroupData) => {
    setLoading(true);
    try {
      const result = await api.notifications.createNotificationGroup(data);
      if (result) {
        // Refresh groups list
        await fetchNotificationGroups();
        return result;
      }
      return null;
    } catch (error) {
      console.error('Error creating notification group:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing notification group
  const updateNotificationGroup = async (data: UpdateNotificationGroupData) => {
    setLoading(true);
    try {
      const result = await api.notifications.updateNotificationGroup(data.id, {
        name: data.name,
        description: data.description
      });
      if (result) {
        // Refresh groups list
        await fetchNotificationGroups();
        return result;
      }
      return null;
    } catch (error) {
      console.error('Error updating notification group:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Delete a notification group
  const deleteNotificationGroup = async (id: string) => {
    setLoading(true);
    try {
      const success = await api.notifications.deleteNotificationGroup(id);
      if (success) {
        // Refresh groups list
        await fetchNotificationGroups();
      }
      return success;
    } catch (error) {
      console.error('Error deleting notification group:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    groups,
    loading,
    fetchNotificationGroups,
    createNotificationGroup,
    updateNotificationGroup,
    deleteNotificationGroup
  };
}
