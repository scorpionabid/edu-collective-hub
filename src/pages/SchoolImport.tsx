
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Download, Upload, FileUp, FileDown, Info, HelpCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Category {
  id: string;
  name: string;
  columns: Column[];
}

interface Column {
  id: number;
  name: string;
  type: string;
}

interface ImportHistory {
  id: string;
  categoryId: string;
  categoryName: string;
  filename: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  comment?: string;
}

const SchoolImport = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [importHistory, setImportHistory] = useState<ImportHistory[]>([]);
  const [activeTab, setActiveTab] = useState("upload");
  
  useEffect(() => {
    // Check if user is a school admin
    if (user && user.role !== 'schooladmin') {
      navigate('/');
      return;
    }

    // Fetch categories and import history
    // In a real application, these would be API calls
    setTimeout(() => {
      const mockCategories = [
        { 
          id: "1", 
          name: "Ümumi Məlumatlar", 
          columns: [
            { id: 1, name: "Ünvan", type: "text" },
            { id: 2, name: "Direktor", type: "text" },
            { id: 3, name: "Telefon", type: "text" },
          ]
        },
        { 
          id: "2", 
          name: "Tədris Göstəriciləri", 
          columns: [
            { id: 4, name: "Tələbə sayı", type: "number" },
            { id: 5, name: "Müəllim sayı", type: "number" },
            { id: 6, name: "Orta bal", type: "number" },
          ]
        },
        { 
          id: "3", 
          name: "İnfrastruktur", 
          columns: [
            { id: 7, name: "Sinif otaqları", type: "number" },
            { id: 8, name: "Laboratoriyalar", type: "number" },
            { id: 9, name: "İdman zalı", type: "select" },
          ]
        },
      ];
      
      const mockImportHistory: ImportHistory[] = [
        {
          id: "1",
          categoryId: "1",
          categoryName: "Ümumi Məlumatlar",
          filename: "umumi_melumatlar.xlsx",
          date: "2023-05-15T14:30:00",
          status: 'approved',
          comment: "Məlumatlar təsdiq edildi"
        },
        {
          id: "2",
          categoryId: "2",
          categoryName: "Tədris Göstəriciləri",
          filename: "tedris_gostericileri.xlsx",
          date: "2023-05-20T10:15:00",
          status: 'pending'
        },
        {
          id: "3",
          categoryId: "3",
          categoryName: "İnfrastruktur",
          filename: "infrastruktur.xlsx",
          date: "2023-05-18T09:45:00",
          status: 'rejected',
          comment: "Yanlış məlumatlar. Yenidən daxil edin."
        },
      ];
      
      setCategories(mockCategories);
      setImportHistory(mockImportHistory);
      setLoading(false);
    }, 1000);
  }, [user, navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleDownloadTemplate = () => {
    if (!selectedCategory) {
      toast.error("Zəhmət olmasa kateqoriya seçin");
      return;
    }
    
    // In a real app, this would download a template
    toast.success("Nümunə fayl yüklənir...");
    
    // Simulate download
    setTimeout(() => {
      const category = categories.find(c => c.id === selectedCategory);
      if (category) {
        const a = document.createElement('a');
        a.href = "data:text/plain;charset=utf-8,";
        a.download = `${category.name.toLowerCase().replace(/\s+/g, '_')}_numune.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    }, 500);
  };

  const handleImport = () => {
    if (!selectedCategory) {
      toast.error("Zəhmət olmasa kateqoriya seçin");
      return;
    }
    
    if (!file) {
      toast.error("Zəhmət olmasa fayl seçin");
      return;
    }
    
    // In a real app, this would upload the file
    setLoading(true);
    
    setTimeout(() => {
      const category = categories.find(c => c.id === selectedCategory);
      if (category) {
        // Add to history
        const newImport: ImportHistory = {
          id: Date.now().toString(),
          categoryId: selectedCategory,
          categoryName: category.name,
          filename: file.name,
          date: new Date().toISOString(),
          status: 'pending'
        };
        
        setImportHistory([newImport, ...importHistory]);
        setFile(null);
        setSelectedCategory("");
        toast.success("Fayl uğurla yükləndi və təsdiq gözləyir");
        setActiveTab("history");
      }
      
      setLoading(false);
    }, 1500);
  };

  const getStatusBadgeClass = (status: ImportHistory['status']) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };
  
  const getStatusText = (status: ImportHistory['status']) => {
    switch (status) {
      case 'approved':
        return 'Təsdiq edildi';
      case 'rejected':
        return 'Rədd edildi';
      default:
        return 'Təsdiq gözləyir';
    }
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
                <h1 className="text-xl font-semibold">Məlumat İmportu</h1>
              </div>
            </div>
          </header>

          <main className="p-6">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <p>Yüklənir...</p>
              </div>
            ) : (
              <Tabs defaultValue="upload" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-6">
                  <TabsTrigger value="upload">Fayl yüklə</TabsTrigger>
                  <TabsTrigger value="history">Tarixçə</TabsTrigger>
                  <TabsTrigger value="help">Kömək</TabsTrigger>
                </TabsList>
                
                <TabsContent value="upload">
                  <Card>
                    <CardHeader>
                      <CardTitle>Məlumat faylı yüklə</CardTitle>
                      <CardDescription>
                        Excel faylı vasitəsilə kateqoriyaya uyğun məlumatları import edin
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <Alert className="bg-blue-50">
                        <Info className="h-4 w-4" />
                        <AlertTitle>Məlumat</AlertTitle>
                        <AlertDescription>
                          Nümunə faylı yükləyin, doldurduqdan sonra import edin. Import edilmiş məlumatlar təsdiq gözləyəcək.
                        </AlertDescription>
                      </Alert>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="category">Kateqoriya</Label>
                          <Select
                            value={selectedCategory}
                            onValueChange={setSelectedCategory}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Kateqoriya seçin" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map(category => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <Button 
                            variant="outline" 
                            onClick={handleDownloadTemplate}
                            disabled={!selectedCategory}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Nümunə faylı yüklə
                          </Button>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="file">Excel faylı</Label>
                          <Input 
                            id="file" 
                            type="file" 
                            accept=".xlsx,.xls,.csv" 
                            onChange={handleFileChange}
                          />
                        </div>
                        
                        <Button 
                          onClick={handleImport}
                          disabled={!selectedCategory || !file}
                          className="w-full"
                        >
                          <FileUp className="h-4 w-4 mr-2" />
                          Faylı import et
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="history">
                  <Card>
                    <CardHeader>
                      <CardTitle>İmport tarixçəsi</CardTitle>
                      <CardDescription>
                        Əvvəlki import əməliyyatlarınız və statusları
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {importHistory.length === 0 ? (
                        <div className="text-center py-10">
                          <p className="text-muted-foreground">İmport tarixçəsi boşdur</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {importHistory.map(item => (
                            <div key={item.id} className="border rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="font-semibold">{item.categoryName}</div>
                                <div className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(item.status)}`}>
                                  {getStatusText(item.status)}
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                                <div>Fayl: {item.filename}</div>
                                <div>Tarix: {new Date(item.date).toLocaleString()}</div>
                              </div>
                              {item.comment && (
                                <div className="mt-2 text-sm bg-gray-50 p-2 rounded">
                                  <span className="font-medium">Qeyd:</span> {item.comment}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="help">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <HelpCircle className="h-5 w-5" />
                        Kömək
                      </CardTitle>
                      <CardDescription>
                        Məlumatların import edilməsi haqqında məlumat
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-2">İmport prosesi</h3>
                        <ol className="space-y-2 list-decimal pl-5">
                          <li><strong>Kateqoriya seçin:</strong> İlk öncə məlumatı hansı kateqoriyaya import etmək istədiyinizi seçin.</li>
                          <li><strong>Nümunə faylı yükləyin:</strong> Düzgün formatda bir Excel faylı hazırlamaq üçün nümunə faylı yükləyin.</li>
                          <li><strong>Nümunə faylı doldurun:</strong> Nümunə faylında göstərilən təlimatlara uyğun məlumatları daxil edin. Bütün tələb olunan xanaları doldurun.</li>
                          <li><strong>Faylı yükləyin:</strong> Doldurulmuş faylı seçin və "Faylı import et" düyməsini sıxın.</li>
                          <li><strong>Təsdiq gözləyin:</strong> Import edilmiş məlumatlar sektor admin və ya superadmin tərəfindən təsdiq ediləcək.</li>
                        </ol>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Tez-tez soruşulan suallar</h3>
                        <div className="space-y-3">
                          <div>
                            <p className="font-medium">1. Hansı fayl formatları dəstəklənir?</p>
                            <p className="text-muted-foreground ml-5">Excel (.xlsx, .xls) və CSV (.csv) formatları dəstəklənir.</p>
                          </div>
                          <div>
                            <p className="font-medium">2. Məlumatlar nə vaxt yenilənir?</p>
                            <p className="text-muted-foreground ml-5">İmport zamanı göndərilən məlumatlar dərhal sistemə yüklənir, lakin təsdiq olunduqdan sonra yekun məlumat bazasına əlavə olunur.</p>
                          </div>
                          <div>
                            <p className="font-medium">3. İmport edilmiş məlumatları redaktə edə bilərəmmi?</p>
                            <p className="text-muted-foreground ml-5">Təsdiq gözləyən məlumatları paneldən manual olaraq redaktə edə bilərsiniz. Təsdiq olunmuş məlumatlar redaktə edilə bilməz.</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default SchoolImport;
