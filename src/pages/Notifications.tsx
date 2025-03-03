
import React, { useState } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import NotificationItem from '@/components/notifications/NotificationItem';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, RefreshCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Notifications() {
  const { allNotifications, loading, refreshNotifications, markAllAsRead, unreadCount } = useNotifications();
  const [activeTab, setActiveTab] = useState<string>('all');
  const navigate = useNavigate();
  
  const filteredNotifications = activeTab === 'unread'
    ? allNotifications.filter(n => !n.isRead)
    : allNotifications;
  
  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold ml-2">Notifications</h1>
        <div className="ml-auto flex gap-2">
          {unreadCount > 0 && (
            <Button 
              variant="outline" 
              onClick={() => markAllAsRead()}
            >
              Mark all as read
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => refreshNotifications()}
            disabled={loading}
          >
            <RefreshCcw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">
            Unread {unreadCount > 0 && `(${unreadCount})`}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-0">
          {renderNotificationList(filteredNotifications, loading)}
        </TabsContent>
        
        <TabsContent value="unread" className="mt-0">
          {renderNotificationList(filteredNotifications, loading)}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function renderNotificationList(notifications: any[], loading: boolean) {
  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <RefreshCcw className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }
  
  if (notifications.length === 0) {
    return (
      <div className="text-center p-12 border rounded-lg bg-gray-50">
        <h3 className="text-lg font-medium text-gray-700">No notifications</h3>
        <p className="text-gray-500 mt-2">You don't have any notifications yet.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      {notifications.map(notification => (
        <NotificationItem 
          key={notification.id} 
          notification={notification} 
          detailed
        />
      ))}
    </div>
  );
}
