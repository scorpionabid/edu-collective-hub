
import { supabase } from "@/integrations/supabase/client";
import { NotificationGroup, CreateNotificationGroupData, UpdateNotificationGroupData, AddGroupMemberData } from '../types/notifications';

// Get all notification groups
export const getNotificationGroups = async (): Promise<NotificationGroup[]> => {
  const { data, error } = await supabase
    .from('notification_groups')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching notification groups:', error);
    throw new Error(error.message);
  }

  return data as NotificationGroup[];
};

// Create a new notification group
export const createNotificationGroup = async (
  groupData: CreateNotificationGroupData
): Promise<NotificationGroup> => {
  const { data, error } = await supabase
    .from('notification_groups')
    .insert([groupData])
    .select()
    .single();

  if (error) {
    console.error('Error creating notification group:', error);
    throw new Error(error.message);
  }

  return data as NotificationGroup;
};

// Update an existing notification group
export const updateNotificationGroup = async (
  groupData: UpdateNotificationGroupData
): Promise<NotificationGroup> => {
  const { id, ...updateData } = groupData;
  
  const { data, error } = await supabase
    .from('notification_groups')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating notification group:', error);
    throw new Error(error.message);
  }

  return data as NotificationGroup;
};

// Delete a notification group
export const deleteNotificationGroup = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('notification_groups')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting notification group:', error);
    throw new Error(error.message);
  }
};

// Get members of a notification group
export const getGroupMembers = async (groupId: string): Promise<any[]> => {
  const { data, error } = await supabase
    .from('notification_group_members')
    .select('*')
    .eq('group_id', groupId);

  if (error) {
    console.error('Error fetching group members:', error);
    throw new Error(error.message);
  }

  return data;
};

// Add members to a notification group
export const addGroupMembers = async (memberData: AddGroupMemberData): Promise<void> => {
  const { groupId, memberIds, memberType } = memberData;

  const membersToAdd = memberIds.map((memberId) => ({
    group_id: groupId,
    member_id: memberId,
    member_type: memberType,
  }));

  const { error } = await supabase
    .from('notification_group_members')
    .insert(membersToAdd);

  if (error) {
    console.error('Error adding members to group:', error);
    throw new Error(error.message);
  }
};

// Remove a member from a notification group
export const removeGroupMember = async (groupId: string, memberId: string): Promise<void> => {
  const { error } = await supabase
    .from('notification_group_members')
    .delete()
    .match({ group_id: groupId, member_id: memberId });

  if (error) {
    console.error('Error removing member from group:', error);
    throw new Error(error.message);
  }
};
