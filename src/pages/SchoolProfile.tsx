
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Save, Upload, Mail, Phone, School, User } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
  schoolName: string;
  position: string;
  utisCode: string;
}

const SchoolProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  useEffect(() => {
    // Check if user is a school admin
    if (user && user.role !== 'schooladmin') {
      navigate('/');
      return;
    }

    // Fetch user profile
    // In a real application, this would be an API call
    setTimeout(() => {
      const mockProfile: UserProfile = {
        id: "1",
        firstName: "Məmməd",
        lastName: "Əliyev",
        email: "school@example.com",
        phone: "+994 50 123 45 67",
        avatar: "",
        schoolName: "Məktəb 123",
        position: "Məktəb Admini",
        utisCode: "UT123456"
      };
      
      setProfile(mockProfile);
      setLoading(false);
    }, 1000);
  }, [user, navigate]);

  const handleChange = (field: keyof UserProfile, value: string) => {
    if (profile) {
      setProfile({ ...profile, [field]: value });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    // Validate form
    if (!profile?.firstName) {
      toast.error("Ad daxil edilməlidir");
      return;
    }
    if (!profile?.lastName) {
      toast.error("Soyad daxil edilməlidir");
      return;
    }
    if (!profile?.email || !profile.email.includes('@')) {
      toast.error("Düzgün email daxil edilməlidir");
      return;
    }
    if (!profile?.phone) {
      toast.error("Telefon daxil edilməlidir");
      return;
    }
    
    // In a real app, this would send data to the server
    toast.success("Profil məlumatları uğurla yeniləndi");
    setIsEditing(false);
    
    // If there's an image preview, update avatar
    if (imagePreview) {
      setProfile(prev => prev ? { ...prev, avatar: imagePreview } : null);
      setImagePreview(null);
    }
  };

  const handleCancelEdit = () => {
    // Reset form
    setIsEditing(false);
    setImagePreview(null);
    
    // In a real app, this would refetch the profile
    setTimeout(() => {
      const mockProfile: UserProfile = {
        id: "1",
        firstName: "Məmməd",
        lastName: "Əliyev",
        email: "school@example.com",
        phone: "+994 50 123 45 67",
        avatar: "",
        schoolName: "Məktəb 123",
        position: "Məktəb Admini",
        utisCode: "UT123456"
      };
      
      setProfile(mockProfile);
    }, 500);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1">
          <header className="bg-white shadow">
            <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <h1 className="text-xl font-semibold">Profil</h1>
              </div>
              <div className="flex gap-2">
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)}>
                    Redaktə et
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" onClick={handleCancelEdit}>
                      Ləğv et
                    </Button>
                    <Button onClick={handleSaveProfile}>
                      <Save className="h-4 w-4 mr-2" />
                      Yadda saxla
                    </Button>
                  </>
                )}
              </div>
            </div>
          </header>

          <main className="p-6">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <p>Yüklənir...</p>
              </div>
            ) : profile ? (
              <div className="grid gap-6 md:grid-cols-[300px_1fr]">
                {/* Profile sidebar */}
                <Card>
                  <CardContent className="p-6 flex flex-col items-center justify-center space-y-6">
                    <div className="relative">
                      <Avatar className="w-32 h-32">
                        <AvatarImage src={imagePreview || profile.avatar} alt={profile.firstName} />
                        <AvatarFallback className="text-2xl">
                          {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {isEditing && (
                        <Label 
                          htmlFor="avatar-upload" 
                          className="absolute bottom-0 right-0 bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center cursor-pointer"
                        >
                          <Upload className="h-4 w-4" />
                          <Input 
                            id="avatar-upload" 
                            type="file" 
                            accept="image/*" 
                            onChange={handleFileChange} 
                            className="hidden"
                          />
                        </Label>
                      )}
                    </div>
                    
                    <div className="text-center">
                      <h3 className="text-xl font-bold">
                        {profile.firstName} {profile.lastName}
                      </h3>
                      <p className="text-muted-foreground">{profile.position}</p>
                    </div>
                    
                    <Separator />
                    
                    <div className="w-full space-y-3">
                      <div className="flex items-center">
                        <School className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{profile.schoolName}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{profile.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{profile.phone}</span>
                      </div>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{profile.utisCode}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Profile form */}
                <Card>
                  <CardHeader>
                    <CardTitle>Profil məlumatları</CardTitle>
                    <CardDescription>
                      Şəxsi məlumatlarınızı düzəldə və yeniləyə bilərsiniz
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Ad</Label>
                        <Input 
                          id="firstName" 
                          value={profile.firstName} 
                          onChange={(e) => handleChange('firstName', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Soyad</Label>
                        <Input 
                          id="lastName" 
                          value={profile.lastName} 
                          onChange={(e) => handleChange('lastName', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={profile.email} 
                        onChange={(e) => handleChange('email', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefon</Label>
                      <Input 
                        id="phone" 
                        value={profile.phone} 
                        onChange={(e) => handleChange('phone', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="schoolName">Məktəb</Label>
                        <Input 
                          id="schoolName" 
                          value={profile.schoolName} 
                          disabled={true}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="position">Vəzifə</Label>
                        <Input 
                          id="position" 
                          value={profile.position} 
                          disabled={true}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="utisCode">UTIS kodu</Label>
                      <Input 
                        id="utisCode" 
                        value={profile.utisCode} 
                        disabled={true}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        UTIS kodu dəyişdirilə bilməz
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="py-10 text-center">
                  <p className="text-muted-foreground">
                    Profil məlumatları tapılmadı
                  </p>
                </CardContent>
              </Card>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default SchoolProfile;
