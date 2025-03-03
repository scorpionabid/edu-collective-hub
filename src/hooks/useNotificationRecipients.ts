
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';

interface Recipient {
  id: string;
  notificationId: string;
  recipientType: string;
  recipientId: string;
  status: string;
  createdAt: string;
}

export const useNotificationRecipients = () => {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchRecipients = useCallback(async (notificationId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Access the notifications.mass.getRecipients method correctly
      const dbRecipients = await api.notifications.mass.getRecipients(notificationId);
      
      // Map DB format to frontend format
      const formattedRecipients = dbRecipients.map((recipient: any) => ({
        id: recipient.id,
        notificationId: recipient.notification_id,
        recipientType: recipient.recipient_type,
        recipientId: recipient.recipient_id,
        status: recipient.status,
        createdAt: recipient.created_at
      }));
      
      setRecipients(formattedRecipients);
    } catch (err: any) {
      setError(err);
      toast.error('Failed to fetch notification recipients');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    recipients,
    loading,
    error,
    fetchRecipients
  };
};
