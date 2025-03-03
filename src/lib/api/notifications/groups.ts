
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { NotificationGroup, CreateNotificationGroupData, UpdateNotificationGroupData, AddGroupMemberData } from '../types';

// Mock notification groups data since the table doesn't exist yet
const mockGroups: NotificationGroup[] = [
  {
    id: '1',
    name: 'Administrators',
    description: 'All system administrators',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system'
  },
  {
    id: '2',
    name: 'Teachers',
    description: 'All teachers in the system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system'
  }
];

// Mock group members
const mockGroupMembers = [
  { id: '1', groupId: '1', memberId: 'user1', memberType: 'user' },
  { id: '2', groupId: '1', memberId: 'user2', memberType: 'user' },
  { id: '3', groupId: '2', memberId: 'user3', memberType: 'user' },
];

// Get all notification groups
export const getNotificationGroups = async (): Promise<NotificationGroup[]> => {
  try {
    // Using mock data for now since the actual table doesn't exist yet
    return mockGroups;
  } catch (error) {
    console.error('Error fetching notification groups:', error);
    toast.error('Failed to load notification groups');
    return [];
  }
};

// Create a new notification group
export const createNotificationGroup = async (data: CreateNotificationGroupData): Promise<NotificationGroup> => {
  try {
    // In a real implementation, we would insert into the notification_groups table
    
    // For now, create a mock group
    const newGroup: NotificationGroup = {
      id: `${Date.now()}`,
      name: data.name,
      description: data.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current-user'
    };
    
    mockGroups.push(newGroup);
    
    return newGroup;
  } catch (error) {
    console.error('Error creating notification group:', error);
    toast.error('Failed to create notification group');
    throw error;
  }
};

// Update an existing notification group
export const updateNotificationGroup = async (data: UpdateNotificationGroupData): Promise<NotificationGroup> => {
  try {
    // In a real implementation, we would update the notification_groups table
    
    // For now, update the mock group
    const groupIndex = mockGroups.findIndex(g => g.id === data.id);
    
    if (groupIndex === -1) {
      throw new Error('Group not found');
    }
    
    const updatedGroup = {
      ...mockGroups[groupIndex],
      ...(data.name && { name: data.name }),
      ...(data.description && { description: data.description }),
      updatedAt: new Date().toISOString()
    };
    
    mockGroups[groupIndex] = updatedGroup;
    
    return updatedGroup;
  } catch (error) {
    console.error('Error updating notification group:', error);
    toast.error('Failed to update notification group');
    throw error;
  }
};

// Delete a notification group
export const deleteNotificationGroup = async (id: string): Promise<boolean> => {
  try {
    // In a real implementation, we would delete from the notification_groups table
    
    // For now, remove from mock groups
    const groupIndex = mockGroups.findIndex(g => g.id === id);
    
    if (groupIndex === -1) {
      throw new Error('Group not found');
    }
    
    mockGroups.splice(groupIndex, 1);
    
    return true;
  } catch (error) {
    console.error('Error deleting notification group:', error);
    toast.error('Failed to delete notification group');
    throw error;
  }
};

// Get members of a notification group
export const getGroupMembers = async (groupId: string) => {
  try {
    // Mock implementation since the table doesn't exist yet
    return mockGroupMembers.filter(m => m.groupId === groupId);
  } catch (error) {
    console.error('Error fetching group members:', error);
    toast.error('Failed to load group members');
    return [];
  }
};

// Add members to a notification group
export const addGroupMembers = async (data: AddGroupMemberData) => {
  try {
    // In a real implementation, we would insert into the group_members table
    
    // For now, add to mock members
    const newMembers = data.memberIds.map(memberId => ({
      id: `${Date.now()}_${memberId}`,
      groupId: data.groupId,
      memberId,
      memberType: data.memberType
    }));
    
    mockGroupMembers.push(...newMembers);
    
    return newMembers;
  } catch (error) {
    console.error('Error adding group members:', error);
    toast.error('Failed to add members to group');
    throw error;
  }
};

// Remove a member from a notification group
export const removeGroupMember = async (groupId: string, memberId: string) => {
  try {
    // In a real implementation, we would delete from the group_members table
    
    // For now, remove from mock members
    const memberIndex = mockGroupMembers.findIndex(
      m => m.groupId === groupId && m.memberId === memberId
    );
    
    if (memberIndex === -1) {
      throw new Error('Member not found in group');
    }
    
    mockGroupMembers.splice(memberIndex, 1);
    
    return true;
  } catch (error) {
    console.error('Error removing group member:', error);
    toast.error('Failed to remove member from group');
    throw error;
  }
};
