
import React from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import NotificationItem from './NotificationItem';
import { useNavigate } from 'react-router-dom';

export default function NotificationList() {
  const { allNotifications, loading, markAllAsRead, unreadCount } = useNotifications();
  const navigate = useNavigate();

  const handleViewAllClick = () => {
    navigate('/notifications');
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm text-gray-500">Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4">
        <h4 className="font-medium">Notifications</h4>
        {unreadCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => markAllAsRead()}
            className="text-xs"
          >
            Mark all as read
          </Button>
        )}
      </div>
      <Separator />
      
      <ScrollArea className="flex-1 max-h-[350px]">
        {allNotifications.length > 0 ? (
          <div className="flex flex-col gap-1 p-1">
            {allNotifications.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-sm text-gray-500">No notifications yet</p>
          </div>
        )}
      </ScrollArea>
      
      <Separator />
      <div className="p-2">
        <Button 
          variant="outline" 
          className="w-full text-sm" 
          onClick={handleViewAllClick}
        >
          View All Notifications
        </Button>
      </div>
    </div>
  );
}
