
import { supabase } from '@/integrations/supabase/client';
import { NotificationGroup } from '../types/notifications';

// Map DB fields to frontend fields
const mapDbToNotificationGroup = (item: any): NotificationGroup => ({
  id: item.id,
  name: item.name,
  description: item.description || '',
  createdAt: item.created_at,
  updatedAt: item.updated_at,
  createdBy: item.created_by
});

export const getAll = async (): Promise<NotificationGroup[]> => {
  try {
    const { data, error } = await supabase.from('notification_groups').select('*');
    
    if (error) throw error;
    
    return Array.isArray(data) ? data.map(mapDbToNotificationGroup) : [];
  } catch (error) {
    console.error('Error fetching notification groups:', error);
    return [];
  }
};

export const create = async (groupData: { name: string; description?: string }): Promise<NotificationGroup> => {
  try {
    const { data, error } = await supabase.from('notification_groups').insert({
      name: groupData.name,
      description: groupData.description,
      created_by: (await supabase.auth.getUser()).data.user?.id
    }).select().single();
    
    if (error) throw error;
    
    return mapDbToNotificationGroup(data);
  } catch (error) {
    console.error('Error creating notification group:', error);
    throw error;
  }
};

export const update = async (id: string, groupData: { name?: string; description?: string }): Promise<NotificationGroup> => {
  try {
    const updateData: Record<string, any> = {};
    if (groupData.name !== undefined) updateData.name = groupData.name;
    if (groupData.description !== undefined) updateData.description = groupData.description;
    
    const { data, error } = await supabase.from('notification_groups')
      .update(updateData)
      .match({ id })
      .select()
      .single();
    
    if (error) throw error;
    
    return mapDbToNotificationGroup(data);
  } catch (error) {
    console.error('Error updating notification group:', error);
    throw error;
  }
};

export const deleteGroup = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase.from('notification_groups').delete().match({ id });
    
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting notification group:', error);
    throw error;
  }
};

export const getMembers = async (groupId: string, memberType?: string): Promise<any[]> => {
  try {
    let query = supabase.from('notification_group_members')
      .select('*, member:member_id(*)')
      .match({ group_id: groupId });
    
    if (memberType) {
      query = query.match({ member_type: memberType });
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching group members:', error);
    return [];
  }
};

export const addMembers = async (data: { groupId: string; memberIds: string[]; memberType: string }): Promise<void> => {
  try {
    const members = data.memberIds.map(memberId => ({
      group_id: data.groupId,
      member_id: memberId,
      member_type: data.memberType
    }));
    
    const { error } = await supabase.from('notification_group_members').insert(members);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error adding members to group:', error);
    throw error;
  }
};

export const removeMembers = async (groupId: string, memberIds: string[]): Promise<void> => {
  try {
    const { error } = await supabase.from('notification_group_members')
      .delete()
      .match({ group_id: groupId })
      .in('member_id', memberIds);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error removing members from group:', error);
    throw error;
  }
};
