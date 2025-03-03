
import React, { useState, useEffect } from 'react';
import { notifications as notificationsApi, NotificationChannel, NotificationPreference } from '@/lib/api/notifications';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, RefreshCcw, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

// Define the notification types
const NOTIFICATION_TYPES = [
  { id: 'deadline_reminder', name: 'Deadline Reminders', description: 'Notifications about upcoming deadlines' },
  { id: 'form_approval', name: 'Form Approvals', description: 'Notifications when a form is approved' },
  { id: 'form_rejection', name: 'Form Rejections', description: 'Notifications when a form is rejected' },
  { id: 'form_submission', name: 'Form Submissions', description: 'Notifications when a form is submitted' },
  { id: 'system_update', name: 'System Updates', description: 'Notifications about system updates and maintenance' },
];

export default function NotificationPreferences() {
  const [channels, setChannels] = useState<NotificationChannel[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  
  // Load channels and preferences
  useEffect(() => {
    loadPreferences();
  }, []);
  
  const loadPreferences = async () => {
    setLoading(true);
    try {
      const [channelsData, preferencesData] = await Promise.all([
        notificationsApi.getChannels(),
        notificationsApi.getUserPreferences()
      ]);
      
      setChannels(channelsData);
      setPreferences(preferencesData);
    } catch (error) {
      console.error('Error loading preferences:', error);
      toast.error('Failed to load notification preferences');
    } finally {
      setLoading(false);
    }
  };
  
  // Get preference for a notification type and channel
  const getPreference = (notificationType: string, channelId: string) => {
    return preferences.find(p => 
      p.notificationType === notificationType && p.channelId === channelId
    );
  };
  
  // Update preference
  const updatePreference = async (
    notificationType: string, 
    channelId: string, 
    isEnabled: boolean,
    quietHoursStart?: string,
    quietHoursEnd?: string
  ) => {
    try {
      setSaving(true);
      await notificationsApi.updatePreference(
        notificationType,
        channelId,
        isEnabled,
        quietHoursStart,
        quietHoursEnd
      );
      
      // Update local state
      const newPreferences = [...preferences];
      const existingIndex = newPreferences.findIndex(p => 
        p.notificationType === notificationType && p.channelId === channelId
      );
      
      if (existingIndex >= 0) {
        newPreferences[existingIndex] = {
          ...newPreferences[existingIndex],
          isEnabled,
          quietHoursStart,
          quietHoursEnd
        };
      } else {
        // This is a new preference
        const newPref: any = {
          id: 'temp-' + new Date().getTime(),
          userId: 'current-user', // Will be set by the API
          notificationType,
          channelId,
          isEnabled,
          quietHoursStart,
          quietHoursEnd,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        newPreferences.push(newPref);
      }
      
      setPreferences(newPreferences);
    } catch (error) {
      console.error('Error updating preference:', error);
      toast.error('Failed to update notification preference');
    } finally {
      setSaving(false);
    }
  };
  
  const handleSwitchChange = (notificationType: string, channelId: string, checked: boolean) => {
    updatePreference(notificationType, channelId, checked);
  };
  
  const handleQuietHoursChange = (
    notificationType: string, 
    channelId: string, 
    startTime: string, 
    endTime: string
  ) => {
    const pref = getPreference(notificationType, channelId);
    updatePreference(
      notificationType, 
      channelId, 
      pref?.isEnabled || false,
      startTime,
      endTime
    );
  };
  
  if (loading) {
    return (
      <div className="container mx-auto py-6 max-w-4xl flex justify-center items-center h-64">
        <RefreshCcw className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold ml-2">Notification Preferences</h1>
        <div className="ml-auto">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={loadPreferences}
            disabled={loading}
          >
            <RefreshCcw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="settings">
        <TabsList className="mb-4">
          <TabsTrigger value="settings">Notification Settings</TabsTrigger>
          <TabsTrigger value="devices">Device Management</TabsTrigger>
        </TabsList>
        
        <TabsContent value="settings" className="mt-0">
          {channels.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Manage Your Notifications</CardTitle>
                <CardDescription>
                  Choose which notifications you want to receive and how you want to receive them.
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-6">
                  {NOTIFICATION_TYPES.map(type => (
                    <div key={type.id} className="border-b pb-4 last:border-0">
                      <h3 className="font-medium text-lg mb-2">{type.name}</h3>
                      <p className="text-gray-500 text-sm mb-4">{type.description}</p>
                      
                      <div className="grid gap-4">
                        {channels.map(channel => {
                          const pref = getPreference(type.id, channel.id);
                          const isEnabled = pref?.isEnabled ?? false;
                          
                          return (
                            <div key={`${type.id}-${channel.id}`} className="flex items-center justify-between">
                              <div>
                                <Label htmlFor={`${type.id}-${channel.id}`} className="text-base">
                                  {channel.name === 'in-app' ? 'In-app' : 
                                   channel.name === 'email' ? 'Email' : 
                                   channel.name === 'push' ? 'Push' : 
                                   channel.name}
                                </Label>
                              </div>
                              
                              <div className="flex items-center gap-6">
                                {channel.name === 'push' && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <div>
                                      <Label htmlFor={`${type.id}-${channel.id}-start`} className="text-xs text-gray-500">
                                        Quiet hours start
                                      </Label>
                                      <Input
                                        id={`${type.id}-${channel.id}-start`}
                                        type="time"
                                        value={pref?.quietHoursStart || ''}
                                        onChange={(e) => handleQuietHoursChange(
                                          type.id,
                                          channel.id,
                                          e.target.value,
                                          pref?.quietHoursEnd || ''
                                        )}
                                        disabled={!isEnabled || saving}
                                        className="w-32 h-8 text-xs"
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor={`${type.id}-${channel.id}-end`} className="text-xs text-gray-500">
                                        Quiet hours end
                                      </Label>
                                      <Input
                                        id={`${type.id}-${channel.id}-end`}
                                        type="time"
                                        value={pref?.quietHoursEnd || ''}
                                        onChange={(e) => handleQuietHoursChange(
                                          type.id,
                                          channel.id,
                                          pref?.quietHoursStart || '',
                                          e.target.value
                                        )}
                                        disabled={!isEnabled || saving}
                                        className="w-32 h-8 text-xs"
                                      />
                                    </div>
                                  </div>
                                )}
                                
                                <Switch
                                  id={`${type.id}-${channel.id}`}
                                  checked={isEnabled}
                                  onCheckedChange={(checked) => handleSwitchChange(type.id, channel.id, checked)}
                                  disabled={saving}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p>No notification channels are currently available.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="devices" className="mt-0">
          <DeviceManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DeviceManagement() {
  // This would be expanded to show registered devices and allow removing them
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Device Management</CardTitle>
        <CardDescription>
          Manage your devices for push notifications
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <p className="text-center p-4 text-gray-500">
          Push notification functionality requires Firebase configuration.
        </p>
        
        <div className="mt-4">
          <Button className="w-full">
            <Save className="w-4 h-4 mr-2" />
            Register this device for push notifications
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
