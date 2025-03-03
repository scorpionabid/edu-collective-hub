
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useNotifications } from '@/contexts/NotificationContext';
import { Notification } from '@/lib/api/notifications';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface NotificationItemProps {
  notification: Notification;
  detailed?: boolean;
}

export default function NotificationItem({ notification, detailed = false }: NotificationItemProps) {
  const { markAsRead } = useNotifications();
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    
    if (notification.actionUrl) {
      if (notification.actionUrl.startsWith('http')) {
        window.open(notification.actionUrl, '_blank');
      } else {
        navigate(notification.actionUrl);
      }
    }
  };
  
  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true });
  
  return (
    <div 
      className={cn(
        "p-3 rounded-md cursor-pointer transition-colors",
        notification.isRead ? "bg-transparent hover:bg-gray-100" : "bg-gray-50 hover:bg-gray-100",
        detailed && "border mb-2"
      )}
      onClick={handleClick}
    >
      <div className="flex items-start gap-2">
        {!notification.isRead && (
          <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 flex-shrink-0" />
        )}
        
        <div className="flex-1">
          <div className="flex justify-between">
            <h5 className={cn("text-sm font-medium", !notification.isRead && "text-blue-700")}>
              {notification.title}
            </h5>
            <span className="text-xs text-gray-500">{timeAgo}</span>
          </div>
          
          <p className="text-sm text-gray-600 mt-1">
            {notification.body}
          </p>
          
          {detailed && notification.data && (
            <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
              <pre className="whitespace-pre-wrap overflow-hidden">
                {JSON.stringify(notification.data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
