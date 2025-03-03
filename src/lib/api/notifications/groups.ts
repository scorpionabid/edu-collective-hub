
import { supabase } from '@/integrations/supabase/client';
import { NotificationGroup, AddGroupMemberData } from '../types/notifications';

/**
 * Get all notification groups
 */
export const getAllGroups = async (): Promise<NotificationGroup[]> => {
  const { data, error } = await supabase
    .from('notification_groups')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  // Map the database fields to frontend fields
  return (data || []).map(group => ({
    id: group.id,
    name: group.name,
    description: group.description,
    createdAt: group.created_at,
    updatedAt: group.updated_at,
    createdBy: group.created_by
  }));
};

/**
 * Get a notification group by ID
 */
export const getGroupById = async (id: string): Promise<NotificationGroup> => {
  const { data, error } = await supabase
    .from('notification_groups')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    createdBy: data.created_by
  };
};

/**
 * Create a new notification group
 */
export const createGroup = async (groupData: { name: string; description?: string }): Promise<NotificationGroup> => {
  const { data, error } = await supabase
    .from('notification_groups')
    .insert({
      name: groupData.name,
      description: groupData.description
    })
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    createdBy: data.created_by
  };
};

/**
 * Update a notification group
 */
export const updateGroup = async (id: string, groupData: { name?: string; description?: string }): Promise<NotificationGroup> => {
  const { data, error } = await supabase
    .from('notification_groups')
    .update({
      name: groupData.name,
      description: groupData.description
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    createdBy: data.created_by
  };
};

/**
 * Delete a notification group
 */
export const deleteGroup = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('notification_groups')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

/**
 * Add members to a notification group
 */
export const addGroupMembers = async (data: AddGroupMemberData): Promise<void> => {
  const memberEntries = data.memberIds.map(memberId => ({
    group_id: data.groupId,
    member_id: memberId,
    member_type: data.memberType
  }));
  
  const { error } = await supabase
    .from('notification_group_members')
    .insert(memberEntries);
  
  if (error) throw error;
};

/**
 * Get members of a notification group
 */
export const getGroupMembers = async (groupId: string, memberType?: string): Promise<any[]> => {
  let query = supabase
    .from('notification_group_members')
    .select('*')
    .eq('group_id', groupId);
  
  if (memberType) {
    query = query.eq('member_type', memberType);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  
  return data || [];
};

/**
 * Remove members from a notification group
 */
export const removeGroupMembers = async (groupId: string, memberIds: string[]): Promise<void> => {
  const { error } = await supabase
    .from('notification_group_members')
    .delete()
    .eq('group_id', groupId)
    .in('member_id', memberIds);
  
  if (error) throw error;
};
