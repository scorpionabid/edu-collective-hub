
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  NotificationGroup, 
  CreateNotificationGroupData,
  UpdateNotificationGroupData,
  NotificationGroupMember,
  AddGroupMemberData,
  MassNotification,
  CreateMassNotificationData,
  MassNotificationRecipient,
  NotificationStats,
  GetMassNotificationsParams
} from "./types";

export const notifications = {
  // Notification Groups
  getGroups: async (): Promise<NotificationGroup[]> => {
    try {
      const { data, error } = await supabase
        .from('notification_groups')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data as NotificationGroup[];
    } catch (error) {
      console.error('Error fetching notification groups:', error);
      toast.error('Failed to load notification groups');
      return [];
    }
  },

  getGroupById: async (id: string): Promise<NotificationGroup | null> => {
    try {
      const { data, error } = await supabase
        .from('notification_groups')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as NotificationGroup;
    } catch (error) {
      console.error('Error fetching notification group:', error);
      toast.error('Failed to load notification group');
      return null;
    }
  },

  createGroup: async (groupData: CreateNotificationGroupData): Promise<NotificationGroup | null> => {
    try {
      const { data, error } = await supabase
        .from('notification_groups')
        .insert({
          name: groupData.name,
          description: groupData.description,
          created_by: (await supabase.auth.getUser()).data.user?.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Notification group created successfully');
      return data as NotificationGroup;
    } catch (error) {
      console.error('Error creating notification group:', error);
      toast.error('Failed to create notification group');
      return null;
    }
  },

  updateGroup: async (id: string, groupData: UpdateNotificationGroupData): Promise<NotificationGroup | null> => {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString()
      };
      
      if (groupData.name !== undefined) updateData.name = groupData.name;
      if (groupData.description !== undefined) updateData.description = groupData.description;
      
      const { data, error } = await supabase
        .from('notification_groups')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Notification group updated successfully');
      return data as NotificationGroup;
    } catch (error) {
      console.error('Error updating notification group:', error);
      toast.error('Failed to update notification group');
      return null;
    }
  },

  deleteGroup: async (id: string): Promise<boolean> => {
    try {
      // First delete all members
      const { error: membersError } = await supabase
        .from('notification_group_members')
        .delete()
        .eq('group_id', id);
        
      if (membersError) throw membersError;
      
      // Then delete the group
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
  },

  // Group Members
  getGroupMembers: async (groupId: string): Promise<NotificationGroupMember[]> => {
    try {
      const { data, error } = await supabase
        .from('notification_group_members')
        .select('*')
        .eq('group_id', groupId);

      if (error) throw error;
      return data as NotificationGroupMember[];
    } catch (error) {
      console.error('Error fetching group members:', error);
      toast.error('Failed to load group members');
      return [];
    }
  },

  addGroupMember: async (memberData: AddGroupMemberData): Promise<NotificationGroupMember | null> => {
    try {
      // Check if member already exists
      const { data: existingMember, error: checkError } = await supabase
        .from('notification_group_members')
        .select('*')
        .eq('group_id', memberData.groupId)
        .eq('member_id', memberData.memberId)
        .eq('member_type', memberData.memberType)
        .maybeSingle();
        
      if (checkError) throw checkError;
      
      if (existingMember) {
        toast.info('Member already exists in this group');
        return existingMember as NotificationGroupMember;
      }
      
      const { data, error } = await supabase
        .from('notification_group_members')
        .insert({
          group_id: memberData.groupId,
          member_id: memberData.memberId,
          member_type: memberData.memberType,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Member added to group successfully');
      return data as NotificationGroupMember;
    } catch (error) {
      console.error('Error adding group member:', error);
      toast.error('Failed to add member to group');
      return null;
    }
  },

  removeGroupMember: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('notification_group_members')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Member removed from group successfully');
      return true;
    } catch (error) {
      console.error('Error removing group member:', error);
      toast.error('Failed to remove member from group');
      return false;
    }
  },

  // Mass Notifications
  getMassNotifications: async (params?: GetMassNotificationsParams): Promise<MassNotification[]> => {
    try {
      let query = supabase
        .from('mass_notifications')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (params?.fromDate) {
        query = query.gte('created_at', params.fromDate);
      }
      
      if (params?.toDate) {
        query = query.lte('created_at', params.toDate);
      }
      
      if (params?.status) {
        query = query.eq('delivery_status', params.status);
      }
      
      if (params?.type) {
        query = query.eq('notification_type', params.type);
      }
      
      if (params?.page !== undefined && params?.limit !== undefined) {
        const from = (params.page - 1) * params.limit;
        const to = from + params.limit - 1;
        query = query.range(from, to);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as MassNotification[];
    } catch (error) {
      console.error('Error fetching mass notifications:', error);
      toast.error('Failed to load notifications');
      return [];
    }
  },

  getMassNotificationById: async (id: string): Promise<MassNotification | null> => {
    try {
      const { data, error } = await supabase
        .from('mass_notifications')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as MassNotification;
    } catch (error) {
      console.error('Error fetching notification:', error);
      toast.error('Failed to load notification');
      return null;
    }
  },

  createMassNotification: async (notificationData: CreateMassNotificationData): Promise<MassNotification | null> => {
    try {
      // Create notification
      const { data: notification, error: notificationError } = await supabase
        .from('mass_notifications')
        .insert({
          title: notificationData.title,
          message: notificationData.message,
          notification_type: notificationData.notificationType,
          delivery_status: 'pending',
          created_by: (await supabase.auth.getUser()).data.user?.id,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (notificationError) throw notificationError;
      
      // Trigger the function to process recipients and send the notification
      const { error: functionError } = await supabase.functions.invoke('process-notification', {
        body: { 
          notificationId: notification.id,
          recipients: notificationData.recipients
        }
      });
      
      if (functionError) throw functionError;
      
      toast.success('Notification sent successfully');
      return notification as MassNotification;
    } catch (error) {
      console.error('Error creating mass notification:', error);
      toast.error('Failed to send notification');
      return null;
    }
  },

  // Notification Recipients
  getNotificationRecipients: async (notificationId: string): Promise<MassNotificationRecipient[]> => {
    try {
      const { data, error } = await supabase
        .from('mass_notification_recipients')
        .select('*')
        .eq('notification_id', notificationId);

      if (error) throw error;
      return data as MassNotificationRecipient[];
    } catch (error) {
      console.error('Error fetching notification recipients:', error);
      toast.error('Failed to load notification recipients');
      return [];
    }
  },

  getNotificationStats: async (notificationId: string): Promise<NotificationStats> => {
    try {
      const { data, error } = await supabase
        .from('mass_notification_recipients')
        .select('status')
        .eq('notification_id', notificationId);

      if (error) throw error;
      
      const stats: NotificationStats = {
        totalSent: data.length,
        delivered: data.filter(r => r.status === 'sent').length,
        read: data.filter(r => r.status === 'read').length,
        failed: data.filter(r => r.status === 'failed').length,
        pending: data.filter(r => r.status === 'pending').length
      };
      
      return stats;
    } catch (error) {
      console.error('Error fetching notification stats:', error);
      toast.error('Failed to load notification statistics');
      return {
        totalSent: 0,
        delivered: 0,
        read: 0,
        failed: 0,
        pending: 0
      };
    }
  }
};
