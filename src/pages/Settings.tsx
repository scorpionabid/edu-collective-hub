
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe, Bell, Shield, Database } from "lucide-react";

const Settings = () => {
  const { user } = useAuth();

  const isSuperAdmin = user?.role === 'superadmin';

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1">
          <header className="bg-white shadow">
            <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <h1 className="text-xl font-semibold">Settings</h1>
              </div>
            </div>
          </header>
          <main className="p-6">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="general" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="general">
                      <Globe className="h-4 w-4 mr-2" />
                      General
                    </TabsTrigger>
                    <TabsTrigger value="notifications">
                      <Bell className="h-4 w-4 mr-2" />
                      Notifications
                    </TabsTrigger>
                    {isSuperAdmin && (
                      <>
                        <TabsTrigger value="security">
                          <Shield className="h-4 w-4 mr-2" />
                          Security
                        </TabsTrigger>
                        <TabsTrigger value="data">
                          <Database className="h-4 w-4 mr-2" />
                          Data Management
                        </TabsTrigger>
                      </>
                    )}
                  </TabsList>

                  <TabsContent value="general" className="space-y-4">
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="language">System Language</Label>
                        <Select defaultValue="en">
                          <SelectTrigger id="language">
                            <SelectValue placeholder="Select Language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="az">Azerbaijani</SelectItem>
                            <SelectItem value="ru">Russian</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="timezone">Timezone</Label>
                        <Select defaultValue="asia-baku">
                          <SelectTrigger id="timezone">
                            <SelectValue placeholder="Select Timezone" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="asia-baku">Asia/Baku</SelectItem>
                            <SelectItem value="europe-moscow">Europe/Moscow</SelectItem>
                            <SelectItem value="utc">UTC</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="notifications" className="space-y-4">
                    <div className="grid gap-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Email Notifications</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive email notifications for important updates
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Deadline Reminders</Label>
                          <p className="text-sm text-muted-foreground">
                            Get reminded about upcoming deadlines
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </TabsContent>

                  {isSuperAdmin && (
                    <TabsContent value="security" className="space-y-4">
                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                          <Input
                            id="session-timeout"
                            type="number"
                            defaultValue="30"
                            min="5"
                            max="120"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Two-Factor Authentication</Label>
                            <p className="text-sm text-muted-foreground">
                              Require 2FA for all admin accounts
                            </p>
                          </div>
                          <Switch />
                        </div>
                      </div>
                    </TabsContent>
                  )}

                  {isSuperAdmin && (
                    <TabsContent value="data" className="space-y-4">
                      <div className="grid gap-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Data Backup</Label>
                            <p className="text-sm text-muted-foreground">
                              Enable automatic daily backups
                            </p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="retention">Data Retention Period (days)</Label>
                          <Input
                            id="retention"
                            type="number"
                            defaultValue="90"
                            min="30"
                            max="365"
                          />
                        </div>
                      </div>
                    </TabsContent>
                  )}
                </Tabs>
                
                <div className="mt-6 flex justify-end space-x-4">
                  <Button variant="outline">Cancel</Button>
                  <Button>Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Settings;
