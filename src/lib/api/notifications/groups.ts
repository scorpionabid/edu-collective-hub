
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  NotificationGroup, 
  AddGroupMemberData, 
  CreateNotificationGroupData, 
  UpdateNotificationGroupData 
} from "../types";

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

// Get notification group members
export const getGroupMembers = async (groupId: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('notification_group_members')
      .select('*')
      .eq('group_id', groupId);
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching group members:', error);
    toast.error('Failed to load group members');
    return [];
  }
};

// Create a notification group
export const createNotificationGroup = async (
  groupData: CreateNotificationGroupData
): Promise<NotificationGroup> => {
  try {
    const { data, error } = await supabase
      .from('notification_groups')
      .insert({
        name: groupData.name,
        description: groupData.description,
        created_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();
    
    if (error) throw error;
    
    toast.success('Notification group created successfully');
    
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by
    };
  } catch (error) {
    console.error('Error creating notification group:', error);
    toast.error('Failed to create notification group');
    throw error;
  }
};

// Update a notification group
export const updateNotificationGroup = async (
  groupData: UpdateNotificationGroupData
): Promise<NotificationGroup> => {
  try {
    const { data, error } = await supabase
      .from('notification_groups')
      .update({
        name: groupData.name,
        description: groupData.description,
        updated_at: new Date().toISOString()
      })
      .eq('id', groupData.id)
      .select()
      .single();
    
    if (error) throw error;
    
    toast.success('Notification group updated successfully');
    
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by
    };
  } catch (error) {
    console.error('Error updating notification group:', error);
    toast.error('Failed to update notification group');
    throw error;
  }
};

// Delete a notification group
export const deleteNotificationGroup = async (id: string): Promise<void> => {
  try {
    // First delete all members
    await supabase
      .from('notification_group_members')
      .delete()
      .eq('group_id', id);
    
    // Then delete the group
    const { error } = await supabase
      .from('notification_groups')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    toast.success('Notification group deleted successfully');
  } catch (error) {
    console.error('Error deleting notification group:', error);
    toast.error('Failed to delete notification group');
    throw error;
  }
};

// Add members to a group
export const addGroupMembers = async (data: AddGroupMemberData): Promise<void> => {
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
  } catch (error) {
    console.error('Error adding members to group:', error);
    toast.error('Failed to add members to group');
    throw error;
  }
};

// Remove a member from a group
export const removeGroupMember = async (groupId: string, memberId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('notification_group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('member_id', memberId);
    
    if (error) throw error;
    
    toast.success('Member removed from group successfully');
  } catch (error) {
    console.error('Error removing member from group:', error);
    toast.error('Failed to remove member from group');
    throw error;
  }
};

// Export all group-related functions
export const notificationGroups = {
  getNotificationGroups,
  getGroupMembers,
  createNotificationGroup,
  updateNotificationGroup,
  deleteNotificationGroup,
  addGroupMembers,
  removeGroupMember
};
