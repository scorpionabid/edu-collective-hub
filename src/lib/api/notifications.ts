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

// Notification Groups API
export const createNotificationGroup = async (data: CreateNotificationGroupData): Promise<NotificationGroup> => {
  try {
    const { data: group, error } = await supabase
      .from('notification_groups')
      .insert({
        name: data.name,
        description: data.description,
        created_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select('*')
      .single();

    if (error) {
      toast.error(error.message);
      throw error;
    }

    toast.success('Bildiriş qrupu yaradıldı');

    return {
      id: group.id,
      name: group.name,
      description: group.description,
      createdBy: group.created_by,
      createdAt: group.created_at,
      updatedAt: group.updated_at
    };
  } catch (error) {
    console.error('Error creating notification group:', error);
    toast.error('Bildiriş qrupu yaratmaq alınmadı');
    throw error;
  }
};

export const getNotificationGroups = async (): Promise<NotificationGroup[]> => {
  try {
    const { data: groups, error } = await supabase
      .from('notification_groups')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      toast.error(error.message);
      throw error;
    }

    return groups.map(group => ({
      id: group.id,
      name: group.name,
      description: group.description,
      createdBy: group.created_by,
      createdAt: group.created_at,
      updatedAt: group.updated_at
    }));
  } catch (error) {
    console.error('Error fetching notification groups:', error);
    toast.error('Bildiriş qruplarını almaq alınmadı');
    return [];
  }
};

export const getNotificationGroupById = async (id: string): Promise<NotificationGroup> => {
  try {
    const { data: group, error } = await supabase
      .from('notification_groups')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      toast.error(error.message);
      throw error;
    }

    return {
      id: group.id,
      name: group.name,
      description: group.description,
      createdBy: group.created_by,
      createdAt: group.created_at,
      updatedAt: group.updated_at
    };
  } catch (error) {
    console.error(`Error fetching notification group ${id}:`, error);
    toast.error('Bildiriş qrupunu almaq alınmadı');
    throw error;
  }
};

export const updateNotificationGroup = async (id: string, data: UpdateNotificationGroupData): Promise<NotificationGroup> => {
  try {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    updateData.updated_at = new Date().toISOString();

    const { data: group, error } = await supabase
      .from('notification_groups')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      toast.error(error.message);
      throw error;
    }

    toast.success('Bildiriş qrupu yeniləndi');

    return {
      id: group.id,
      name: group.name,
      description: group.description,
      createdBy: group.created_by,
      createdAt: group.created_at,
      updatedAt: group.updated_at
    };
  } catch (error) {
    console.error(`Error updating notification group ${id}:`, error);
    toast.error('Bildiriş qrupunu yeniləmək alınmadı');
    throw error;
  }
};

export const deleteNotificationGroup = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('notification_groups')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error(error.message);
      throw error;
    }

    toast.success('Bildiriş qrupu silindi');
  } catch (error) {
    console.error(`Error deleting notification group ${id}:`, error);
    toast.error('Bildiriş qrupunu silmək alınmadı');
    throw error;
  }
};

// Group Members API
export const addGroupMembers = async (groupId: string, members: AddGroupMemberData[]): Promise<void> => {
  try {
    const dataToInsert = members.map(member => ({
      group_id: groupId,
      member_type: member.memberType,
      member_id: member.memberId
    }));

    const { error } = await supabase
      .from('notification_group_members')
      .insert(dataToInsert);

    if (error) {
      toast.error(error.message);
      throw error;
    }

    toast.success('Üzvlər qrupa əlavə edildi');
  } catch (error) {
    console.error(`Error adding members to group ${groupId}:`, error);
    toast.error('Üzvləri qrupa əlavə etmək alınmadı');
    throw error;
  }
};

export const removeGroupMember = async (memberId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('notification_group_members')
      .delete()
      .eq('id', memberId);

    if (error) {
      toast.error(error.message);
      throw error;
    }

    toast.success('Üzv qrupdan silindi');
  } catch (error) {
    console.error(`Error removing group member ${memberId}:`, error);
    toast.error('Üzvü qrupdan silmək alınmadı');
    throw error;
  }
};

export const getGroupMembers = async (groupId: string): Promise<NotificationGroupMember[]> => {
  try {
    const { data: members, error } = await supabase
      .from('notification_group_members')
      .select('*')
      .eq('group_id', groupId);

    if (error) {
      toast.error(error.message);
      throw error;
    }

    // Get additional information for each member based on their type
    const enhancedMembers = await Promise.all(members.map(async member => {
      let memberName = '';
      
      try {
        if (member.member_type === 'region') {
          const { data } = await supabase
            .from('regions')
            .select('name')
            .eq('id', member.member_id)
            .single();
          memberName = data?.name || '';
        } else if (member.member_type === 'sector') {
          const { data } = await supabase
            .from('sectors')
            .select('name')
            .eq('id', member.member_id)
            .single();
          memberName = data?.name || '';
        } else if (member.member_type === 'school') {
          const { data } = await supabase
            .from('schools')
            .select('name')
            .eq('id', member.member_id)
            .single();
          memberName = data?.name || '';
        } else if (member.member_type === 'profile') {
          const { data } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', member.member_id)
            .single();
          memberName = data ? `${data.first_name} ${data.last_name}` : '';
        }
      } catch (error) {
        console.error(`Error fetching name for ${member.member_type} with ID ${member.member_id}:`, error);
      }

      return {
        id: member.id,
        groupId: member.group_id,
        memberType: member.member_type as "region" | "sector" | "school" | "profile",
        memberId: member.member_id,
        memberName,
        createdAt: member.created_at
      };
    }));

    return enhancedMembers;
  } catch (error) {
    console.error(`Error fetching members for group ${groupId}:`, error);
    toast.error('Qrup üzvlərini almaq alınmadı');
    return [];
  }
};

// Mass Notifications API
export const createMassNotification = async (data: CreateMassNotificationData): Promise<MassNotification> => {
  try {
    // First, create the notification
    const { data: notification, error } = await supabase
      .from('mass_notifications')
      .insert({
        title: data.title,
        message: data.message,
        notification_type: data.notificationType,
        delivery_status: 'pending',
        created_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select('*')
      .single();

    if (error) {
      toast.error(error.message);
      throw error;
    }

    // Process recipients
    const recipientsToAdd: any[] = [];
    
    for (const recipient of data.recipients) {
      if (recipient.type === 'group') {
        // If it's a group, get all members of the group and add them
        const { data: groupMembers } = await supabase
          .from('notification_group_members')
          .select('*')
          .eq('group_id', recipient.id);
          
        if (groupMembers && groupMembers.length > 0) {
          groupMembers.forEach(member => {
            recipientsToAdd.push({
              notification_id: notification.id,
              recipient_type: member.member_type,
              recipient_id: member.member_id,
              status: 'pending'
            });
          });
        }
      } else {
        // Direct recipient
        recipientsToAdd.push({
          notification_id: notification.id,
          recipient_type: recipient.type,
          recipient_id: recipient.id,
          status: 'pending'
        });
      }
    }

    // Add recipients to the notification
    if (recipientsToAdd.length > 0) {
      const { error: recipientsError } = await supabase
        .from('mass_notification_recipients')
        .insert(recipientsToAdd);

      if (recipientsError) {
        toast.error(`Recipients error: ${recipientsError.message}`);
        throw recipientsError;
      }
    }

    // Update notification with the count of recipients
    const { data: updatedNotification, error: updateError } = await supabase
      .from('mass_notifications')
      .update({ sent_count: recipientsToAdd.length })
      .eq('id', notification.id)
      .select('*')
      .single();

    if (updateError) {
      toast.error(updateError.message);
      throw updateError;
    }

    toast.success('Kütləvi bildiriş yaradıldı');

    return {
      id: updatedNotification.id,
      title: updatedNotification.title,
      message: updatedNotification.message,
      notificationType: updatedNotification.notification_type as "email" | "sms" | "app" | "all",
      deliveryStatus: updatedNotification.delivery_status as "pending" | "in-progress" | "completed" | "failed",
      sentCount: updatedNotification.sent_count || 0,
      createdBy: updatedNotification.created_by,
      createdAt: updatedNotification.created_at
    };
  } catch (error) {
    console.error('Error creating mass notification:', error);
    toast.error('Kütləvi bildiriş yaratmaq alınmadı');
    throw error;
  }
};

export const getMassNotifications = async (params?: GetMassNotificationsParams): Promise<MassNotification[]> => {
  try {
    let query = supabase
      .from('mass_notifications')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters if provided
    if (params) {
      if (params.status) {
        query = query.eq('delivery_status', params.status);
      }
      if (params.createdBy) {
        query = query.eq('created_by', params.createdBy);
      }
      if (params.createdAfter) {
        query = query.gte('created_at', params.createdAfter);
      }
      if (params.createdBefore) {
        query = query.lte('created_at', params.createdBefore);
      }
      if (params.limit) {
        query = query.limit(params.limit);
      }
    }

    const { data: notifications, error } = await query;

    if (error) {
      toast.error(error.message);
      throw error;
    }

    return notifications.map(notification => ({
      id: notification.id,
      title: notification.title,
      message: notification.message,
      notificationType: notification.notification_type as "email" | "sms" | "app" | "all",
      deliveryStatus: notification.delivery_status as "pending" | "in-progress" | "completed" | "failed",
      sentCount: notification.sent_count || 0,
      createdBy: notification.created_by,
      createdAt: notification.created_at
    }));
  } catch (error) {
    console.error('Error fetching mass notifications:', error);
    toast.error('Kütləvi bildirişləri almaq alınmadı');
    return [];
  }
};

export const getMassNotificationById = async (id: string): Promise<MassNotification> => {
  try {
    const { data: notification, error } = await supabase
      .from('mass_notifications')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      toast.error(error.message);
      throw error;
    }

    return {
      id: notification.id,
      title: notification.title,
      message: notification.message,
      notificationType: notification.notification_type as "email" | "sms" | "app" | "all",
      deliveryStatus: notification.delivery_status as "pending" | "in-progress" | "completed" | "failed",
      sentCount: notification.sent_count || 0,
      createdBy: notification.created_by,
      createdAt: notification.created_at
    };
  } catch (error) {
    console.error(`Error fetching mass notification ${id}:`, error);
    toast.error('Kütləvi bildirişi almaq alınmadı');
    throw error;
  }
};

export const getNotificationRecipients = async (notificationId: string): Promise<MassNotificationRecipient[]> => {
  try {
    const { data: recipientsData, error } = await supabase
      .from('mass_notification_recipients')
      .select('*')
      .eq('notification_id', notificationId);
      
    if (error) {
      console.error('Error fetching notification recipients:', error);
      throw error;
    }
    
    // Cast the status field to the correct type
    return recipientsData?.map((r: any) => ({
      id: r.id,
      notificationId: r.notification_id,
      recipientType: r.recipient_type as "region" | "sector" | "school" | "profile",
      recipientId: r.recipient_id,
      recipientName: r.recipient_name || '',  // Adding a fallback value
      status: r.status as "pending" | "sent" | "failed" | "read",
      sentAt: r.sent_at,
      readAt: r.read_at,
      createdAt: r.created_at
    })) || [];
  } catch (error) {
    console.error('Error in getNotificationRecipients:', error);
    return [];
  }
};

export const getNotificationStats = async (notificationId: string): Promise<NotificationStats> => {
  try {
    const { data: recipients, error } = await supabase
      .from('mass_notification_recipients')
      .select('status')
      .eq('notification_id', notificationId);

    if (error) {
      toast.error(error.message);
      throw error;
    }

    const stats: NotificationStats = {
      total: recipients.length,
      pending: 0,
      sent: 0,
      failed: 0,
      read: 0
    };

    recipients.forEach(recipient => {
      if (recipient.status === 'pending') stats.pending++;
      else if (recipient.status === 'sent') stats.sent++;
      else if (recipient.status === 'failed') stats.failed++;
      else if (recipient.status === 'read') stats.read++;
    });

    return stats;
  } catch (error) {
    console.error(`Error fetching stats for notification ${notificationId}:`, error);
    toast.error('Bildiriş statistikasını almaq alınmadı');
    return {
      total: 0,
      pending: 0,
      sent: 0,
      failed: 0,
      read: 0
    };
  }
};

export const notifications = {
  createNotificationGroup,
  getNotificationGroups,
  getNotificationGroupById,
  updateNotificationGroup,
  deleteNotificationGroup,
  addGroupMembers,
  removeGroupMember,
  getGroupMembers,
  createMassNotification,
  getMassNotifications,
  getMassNotificationById,
  getNotificationRecipients,
  getNotificationStats
};
