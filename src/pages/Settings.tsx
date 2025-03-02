
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

// Define translations
const translations = {
  az: {
    settings: "Tənzimləmələr",
    userSettings: "İstifadəçi tənzimləmələri",
    language: "Dil",
    appearance: "Görünüş",
    lightTheme: "Açıq tema",
    darkTheme: "Tünd tema",
    emailNotifications: "E-poçt bildirişləri",
    notificationInfo: "Sistem bildirişləri bu e-poçt ünvanına göndəriləcək",
    saveSettings: "Tənzimləmələri saxla",
    settingsSaved: "Tənzimləmələr uğurla saxlanıldı",
    refreshRequired: "Dəyişikliklərin tətbiq olunması üçün səhifəni yeniləyin"
  },
  en: {
    settings: "Settings",
    userSettings: "User Settings",
    language: "Language",
    appearance: "Appearance",
    lightTheme: "Light theme",
    darkTheme: "Dark theme",
    emailNotifications: "Email notifications",
    notificationInfo: "System notifications will be sent to this email address",
    saveSettings: "Save Settings",
    settingsSaved: "Settings saved successfully",
    refreshRequired: "Refresh the page to apply changes"
  },
  ru: {
    settings: "Настройки",
    userSettings: "Настройки пользователя",
    language: "Язык",
    appearance: "Внешний вид",
    lightTheme: "Светлая тема",
    darkTheme: "Темная тема",
    emailNotifications: "Уведомления по электронной почте",
    notificationInfo: "Системные уведомления будут отправляться на этот адрес электронной почты",
    saveSettings: "Сохранить настройки",
    settingsSaved: "Настройки успешно сохранены",
    refreshRequired: "Обновите страницу, чтобы применить изменения"
  }
};

const Settings = () => {
  const { user } = useAuth();
  const [language, setLanguage] = useState<string>("az");
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [t, setT] = useState(translations.az);

  useEffect(() => {
    // Load settings from localStorage
    const savedLanguage = localStorage.getItem("language");
    if (savedLanguage) {
      setLanguage(savedLanguage);
      setT(translations[savedLanguage as keyof typeof translations] || translations.az);
    }
    
    const savedDarkMode = localStorage.getItem("darkMode");
    if (savedDarkMode) {
      setDarkMode(savedDarkMode === "true");
    }

    // Apply language to document
    document.documentElement.lang = language;
    
    // Apply theme
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    setT(translations[newLanguage as keyof typeof translations]);
  };

  const handleSaveSettings = () => {
    // Save settings to localStorage
    localStorage.setItem("language", language);
    localStorage.setItem("darkMode", darkMode.toString());
    
    toast.success(t.settingsSaved);
    
    // In a real app, we'd apply the language and theme changes immediately
    // For now, we'll just notify the user that they need to refresh
    toast.info(t.refreshRequired);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1">
          <header className="bg-white shadow">
            <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
              <SidebarTrigger />
              <h1 className="text-xl font-semibold">{t.settings}</h1>
            </div>
          </header>
          <main className="p-6">
            <Card>
              <CardHeader>
                <CardTitle>{t.userSettings}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>{t.language}</Label>
                  <RadioGroup 
                    value={language} 
                    onValueChange={handleLanguageChange} 
                    className="flex gap-4"
                  >
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
                  <Label>{t.appearance}</Label>
                  <RadioGroup 
                    value={darkMode ? "dark" : "light"} 
                    onValueChange={(value) => setDarkMode(value === "dark")}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="light" id="light" />
                      <Label htmlFor="light">{t.lightTheme}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="dark" id="dark" />
                      <Label htmlFor="dark">{t.darkTheme}</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email-notifications">{t.emailNotifications}</Label>
                  <Input type="email" id="email-notifications" defaultValue={user?.email} />
                  <p className="text-sm text-muted-foreground">
                    {t.notificationInfo}
                  </p>
                </div>

                <Button onClick={handleSaveSettings}>{t.saveSettings}</Button>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Settings;
