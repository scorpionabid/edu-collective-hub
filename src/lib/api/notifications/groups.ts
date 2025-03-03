
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { NotificationGroup, AddGroupMemberData, CreateNotificationGroupData, UpdateNotificationGroupData } from '../types';

// Get all notification groups
export const getNotificationGroups = async (): Promise<NotificationGroup[]> => {
  try {
    const { data, error } = await supabase
      .from('notification_groups')
      .select('*')
      .order('name');

    if (error) throw error;

    return data.map((group: any) => ({
      id: group.id,
      name: group.name,
      description: group.description,
      createdAt: group.created_at,
      updatedAt: group.updated_at,
      createdBy: group.created_by
    }));
  } catch (error) {
    console.error('Error fetching notification groups:', error);
    toast.error('Failed to load notification groups');
    return [];
  }
};

// Create a notification group
export const createNotificationGroup = async (data: CreateNotificationGroupData): Promise<NotificationGroup> => {
  try {
    const { data: groupData, error } = await supabase
      .from('notification_groups')
      .insert({
        name: data.name,
        description: data.description,
        created_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();

    if (error) throw error;

    toast.success('Notification group created successfully');

    return {
      id: groupData.id,
      name: groupData.name,
      description: groupData.description,
      createdAt: groupData.created_at,
      updatedAt: groupData.updated_at,
      createdBy: groupData.created_by
    };
  } catch (error) {
    console.error('Error creating notification group:', error);
    toast.error('Failed to create notification group');
    throw error;
  }
};

// Update a notification group
export const updateNotificationGroup = async (data: UpdateNotificationGroupData): Promise<NotificationGroup> => {
  try {
    const { data: groupData, error } = await supabase
      .from('notification_groups')
      .update({
        name: data.name,
        description: data.description,
        updated_at: new Date().toISOString()
      })
      .eq('id', data.id)
      .select()
      .single();

    if (error) throw error;

    toast.success('Notification group updated successfully');

    return {
      id: groupData.id,
      name: groupData.name,
      description: groupData.description,
      createdAt: groupData.created_at,
      updatedAt: groupData.updated_at,
      createdBy: groupData.created_by
    };
  } catch (error) {
    console.error('Error updating notification group:', error);
    toast.error('Failed to update notification group');
    throw error;
  }
};

// Delete a notification group
export const deleteNotificationGroup = async (id: string): Promise<boolean> => {
  try {
    // First delete all members of the group
    await supabase
      .from('notification_group_members')
      .delete()
      .eq('group_id', id);

    // Then delete the group itself
    const { error } = await supabase
      .from('notification_groups')
      .delete()
      .eq('id', id);

    if (error) throw error;

    toast.success('Notification group deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting notification group:', error);
    toast.error('Failed to delete notification group');
    return false;
  }
};

// Get members of a notification group
export const getGroupMembers = async (groupId: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('notification_group_members')
      .select('*, profiles(*)')
      .eq('group_id', groupId);

    if (error) throw error;

    return data.map((member: any) => ({
      id: member.id,
      groupId: member.group_id,
      memberId: member.member_id,
      memberType: member.member_type,
      createdAt: member.created_at,
      profile: member.profiles
    }));
  } catch (error) {
    console.error('Error fetching group members:', error);
    toast.error('Failed to load group members');
    return [];
  }
};

// Add members to a notification group
export const addGroupMembers = async (data: AddGroupMemberData): Promise<boolean> => {
  try {
    const members = data.memberIds.map(memberId => ({
      group_id: data.groupId,
      member_id: memberId,
      member_type: data.memberType
    }));

    const { error } = await supabase
      .from('notification_group_members')
      .insert(members);

    if (error) throw error;

    toast.success('Members added to group successfully');
    return true;
  } catch (error) {
    console.error('Error adding members to group:', error);
    toast.error('Failed to add members to group');
    return false;
  }
};

// Remove a member from a notification group
export const removeGroupMember = async (memberId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notification_group_members')
      .delete()
      .eq('id', memberId);

    if (error) throw error;

    toast.success('Member removed from group successfully');
    return true;
  } catch (error) {
    console.error('Error removing member from group:', error);
    toast.error('Failed to remove member from group');
    return false;
  }
};

export const groups = {
  getNotificationGroups,
  createNotificationGroup,
  updateNotificationGroup,
  deleteNotificationGroup,
  getGroupMembers,
  addGroupMembers,
  removeGroupMember
};
