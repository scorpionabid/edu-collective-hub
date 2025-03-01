
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const Settings = () => {
  const { user } = useAuth();
  const [language, setLanguage] = useState<string>("az");
  const [darkMode, setDarkMode] = useState<boolean>(false);

  useEffect(() => {
    // Load settings from localStorage
    const savedLanguage = localStorage.getItem("language");
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
    
    const savedDarkMode = localStorage.getItem("darkMode");
    if (savedDarkMode) {
      setDarkMode(savedDarkMode === "true");
    }
  }, []);

  const handleSaveSettings = () => {
    // Save settings to localStorage
    localStorage.setItem("language", language);
    localStorage.setItem("darkMode", darkMode.toString());
    
    toast.success("Tənzimləmələr uğurla saxlanıldı");
    
    // In a real app, we'd apply the language and theme changes immediately
    // For now, we'll just notify the user that they need to refresh
    toast.info("Dəyişikliklərin tətbiq olunması üçün səhifəni yeniləyin");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1">
          <header className="bg-white shadow">
            <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
              <SidebarTrigger />
              <h1 className="text-xl font-semibold">Tənzimləmələr</h1>
            </div>
          </header>
          <main className="p-6">
            <Card>
              <CardHeader>
                <CardTitle>İstifadəçi tənzimləmələri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Dil</Label>
                  <RadioGroup value={language} onValueChange={setLanguage} className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="az" id="az" />
                      <Label htmlFor="az">Azərbaycan dili</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="en" id="en" />
                      <Label htmlFor="en">English</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="ru" id="ru" />
                      <Label htmlFor="ru">Русский</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>Görünüş</Label>
                  <RadioGroup 
                    value={darkMode ? "dark" : "light"} 
                    onValueChange={(value) => setDarkMode(value === "dark")}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="light" id="light" />
                      <Label htmlFor="light">Açıq tema</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="dark" id="dark" />
                      <Label htmlFor="dark">Tünd tema</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email-notifications">E-poçt bildirişləri</Label>
                  <Input type="email" id="email-notifications" defaultValue={user?.email} />
                  <p className="text-sm text-muted-foreground">
                    Sistem bildirişləri bu e-poçt ünvanına göndəriləcək
                  </p>
                </div>

                <Button onClick={handleSaveSettings}>Tənzimləmələri saxla</Button>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Settings;
