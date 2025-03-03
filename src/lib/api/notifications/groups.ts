
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { NotificationGroup } from "../types";

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

export const createNotificationGroup = async (data: { name: string, description?: string }): Promise<NotificationGroup | null> => {
  try {
    const { data: newGroup, error } = await supabase
      .from('notification_groups')
      .insert({
        name: data.name,
        description: data.description,
        created_at: new Date().toISOString(),
        created_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();
    
    if (error) throw error;
    
    toast.success('Notification group created successfully');
    
    return {
      id: newGroup.id,
      name: newGroup.name,
      description: newGroup.description,
      createdAt: newGroup.created_at,
      updatedAt: newGroup.updated_at,
      createdBy: newGroup.created_by
    };
  } catch (error) {
    console.error('Error creating notification group:', error);
    toast.error('Failed to create notification group');
    return null;
  }
};

export const updateNotificationGroup = async (id: string, data: { name?: string, description?: string }): Promise<NotificationGroup | null> => {
  try {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    updateData.updated_at = new Date().toISOString();
    
    const { data: updatedGroup, error } = await supabase
      .from('notification_groups')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    toast.success('Notification group updated successfully');
    
    return {
      id: updatedGroup.id,
      name: updatedGroup.name,
      description: updatedGroup.description,
      createdAt: updatedGroup.created_at,
      updatedAt: updatedGroup.updated_at,
      createdBy: updatedGroup.created_by
    };
  } catch (error) {
    console.error('Error updating notification group:', error);
    toast.error('Failed to update notification group');
    return null;
  }
};

export const deleteNotificationGroup = async (id: string): Promise<boolean> => {
  try {
    // First check if there are any members in this group
    const { data: members, error: membersError } = await supabase
      .from('notification_group_members')
      .select('id')
      .eq('group_id', id);
    
    if (membersError) throw membersError;
    
    // Delete group members first
    if (members && members.length > 0) {
      const { error: deleteError } = await supabase
        .from('notification_group_members')
        .delete()
        .eq('group_id', id);
      
      if (deleteError) throw deleteError;
    }
    
    // Now delete the group
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

export const getGroupMembers = async (groupId: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('notification_group_members')
      .select('id, member_id, member_type')
      .eq('group_id', groupId);
    
    if (error) throw error;
    
    return data.map((member: any) => ({
      id: member.id,
      memberId: member.member_id,
      memberType: member.member_type
    }));
  } catch (error) {
    console.error('Error fetching group members:', error);
    toast.error('Failed to load group members');
    return [];
  }
};

export const addGroupMembers = async (groupId: string, memberIds: string[], memberType: string): Promise<boolean> => {
  try {
    const members = memberIds.map(memberId => ({
      group_id: groupId,
      member_id: memberId,
      member_type: memberType
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
