
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Save, FileDown, AlertTriangle, FileUp, CheckCircle, Info } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface Category {
  id: string;
  name: string;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
  columns: Column[];
}

interface Column {
  id: number;
  name: string;
  type: string;
  options?: string[];
  required?: boolean;
}

interface FormData {
  [key: string]: string | boolean | number | null;
}

interface ColumnStatus {
  filled: number;
  total: number;
  percentage: number;
}

interface DataStatus {
  [categoryId: string]: {
    approved: boolean;
    lastUpdated: string;
    comment?: string;
  };
}

const SchoolDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<FormData>({});
  const [dataStatus, setDataStatus] = useState<DataStatus>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("incomplete");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [importingCategory, setImportingCategory] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  
  // Stats
  const [categoryStatus, setCategoryStatus] = useState<{[key: string]: ColumnStatus}>({});

  useEffect(() => {
    // Check if user is a school admin
    if (user && user.role !== 'schooladmin') {
      navigate('/');
      return;
    }

    // Fetch categories and form data
    // In a real application, these would be API calls
    setTimeout(() => {
      const mockCategories = [
        { 
          id: "1", 
          name: "Ümumi Məlumatlar", 
          columns: [
            { id: 1, name: "Ünvan", type: "text", required: true },
            { id: 2, name: "Direktor", type: "text", required: true },
            { id: 3, name: "Telefon", type: "text", required: true },
            { id: 4, name: "Email", type: "text", required: true },
          ]
        },
        { 
          id: "2", 
          name: "Tədris Göstəriciləri", 
          columns: [
            { id: 5, name: "Tələbə sayı", type: "number", required: true },
            { id: 6, name: "Müəllim sayı", type: "number", required: true },
            { id: 7, name: "Orta bal", type: "number", required: true },
            { id: 8, name: "Məzun sayı", type: "number", required: false },
          ]
        },
        { 
          id: "3", 
          name: "İnfrastruktur", 
          columns: [
            { id: 9, name: "Sinif otaqları", type: "number", required: true },
            { id: 10, name: "Laboratoriyalar", type: "number", required: false },
            { id: 11, name: "İdman zalı", type: "select", options: ["Var", "Yoxdur"], required: true },
            { id: 12, name: "İnternetə çıxış", type: "boolean", required: true },
            { id: 13, name: "Əlavə məlumat", type: "textarea", required: false },
          ]
        },
      ];
      
      // Initialize with some mock form data for demonstration
      const mockFormData: FormData = {
        "1-1": "Bakı şəh., Yasamal r.",
        "1-2": "Əliyev Məmməd",
        // "1-3": "", // Telefon boş
        "1-4": "mekteb@example.com",
        
        "2-5": 450,
        "2-6": 35,
        // "2-7": null, // Orta bal boş
        "2-8": 125,
        
        "3-9": 25,
        "3-10": 3, 
        "3-11": "Var",
        "3-12": true,
        // "3-13": null, // Əlavə məlumat boş
      };
      
      // Mock data status
      const mockDataStatus: DataStatus = {
        "1": {
          approved: true,
          lastUpdated: "2023-05-15T14:30:00",
          comment: "Məlumatlar təsdiq edilmişdir"
        },
        "2": {
          approved: false,
          lastUpdated: "2023-05-20T10:15:00",
          comment: "Orta bal daxil edilməyib"
        },
        "3": {
          approved: false,
          lastUpdated: "2023-05-18T09:45:00"
        }
      };
      
      setCategories(mockCategories);
      setFormData(mockFormData);
      setDataStatus(mockDataStatus);
      setLoading(false);
      
      // Calculate stats
      const stats: {[key: string]: ColumnStatus} = {};
      mockCategories.forEach(category => {
        const total = category.columns.length;
        let filled = 0;
        
        category.columns.forEach(column => {
          const value = mockFormData[`${category.id}-${column.id}`];
          if (value !== undefined && value !== null && value !== '') {
            filled++;
          }
        });
        
        const percentage = Math.round((filled / total) * 100);
        stats[category.id] = { filled, total, percentage };
      });
      
      setCategoryStatus(stats);
    }, 1000);
  }, [user, navigate]);

  const handleInputChange = (categoryId: string, columnId: number, value: string | boolean | number | null) => {
    // Don't allow changes if the category is approved
    if (dataStatus[categoryId]?.approved) {
      toast.error("Bu kateqoriya təsdiq edilmişdir, dəyişiklik edilə bilməz");
      return;
    }
    
    const fieldKey = `${categoryId}-${columnId}`;
    
    setFormData(prev => ({
      ...prev,
      [fieldKey]: value
    }));
    
    // Update stats
    setTimeout(() => {
      const stats = {...categoryStatus};
      const category = categories.find(c => c.id === categoryId);
      if (category) {
        const total = category.columns.length;
        let filled = 0;
        
        category.columns.forEach(column => {
          const fieldKey = `${categoryId}-${column.id}`;
          const value = formData[fieldKey];
          if (value !== undefined && value !== null && value !== '') {
            filled++;
          }
        });
        
        const percentage = Math.round((filled / total) * 100);
        stats[categoryId] = { filled, total, percentage };
        setCategoryStatus(stats);
      }
    }, 100);
  };

  const handleSaveForm = (categoryId: string) => {
    // Validate required fields
    const category = categories.find(c => c.id === categoryId);
    if (category) {
      const requiredColumns = category.columns.filter(col => col.required);
      let missingFields = false;
      
      requiredColumns.forEach(column => {
        const fieldKey = `${categoryId}-${column.id}`;
        const value = formData[fieldKey];
        if (value === undefined || value === null || value === '') {
          missingFields = true;
          toast.error(`${column.name} daxil edilməlidir`);
        }
      });
      
      if (missingFields) return;
    }
    
    // In a real app, this would save to database
    setDataStatus(prev => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        lastUpdated: new Date().toISOString(),
        approved: false
      }
    }));
    
    toast.success("Məlumatlar uğurla yadda saxlanıldı");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = () => {
    if (!file || !importingCategory) {
      toast.error("Zəhmət olmasa fayl seçin");
      return;
    }
    
    // In a real app, process the file
    setTimeout(() => {
      toast.success("Məlumatlar uğurla import edildi");
      setFile(null);
      setUploadDialogOpen(false);
      
      // Update category status
      const categoryId = importingCategory;
      const category = categories.find(c => c.id === categoryId);
      if (category) {
        const total = category.columns.length;
        
        setDataStatus(prev => ({
          ...prev,
          [categoryId]: {
            ...prev[categoryId],
            lastUpdated: new Date().toISOString(),
            approved: false
          }
        }));
        
        setCategoryStatus(prev => ({
          ...prev,
          [categoryId]: {
            ...prev[categoryId],
            filled: total,
            percentage: 100
          }
        }));
      }
    }, 1500);
  };

  // Get the incomplete categories
  const incompleteCategories = categories.filter(category => {
    const status = categoryStatus[category.id];
    return status?.percentage < 100 || !dataStatus[category.id]?.lastUpdated;
  });

  // Get the complete but not approved categories
  const pendingCategories = categories.filter(category => {
    const status = categoryStatus[category.id];
    return status?.percentage === 100 && !dataStatus[category.id]?.approved;
  });

  // Get the approved categories
  const approvedCategories = categories.filter(category => 
    dataStatus[category.id]?.approved
  );

  // Render form fields based on column type
  const renderFormField = (category: Category, column: Column) => {
    const fieldKey = `${category.id}-${column.id}`;
    const value = formData[fieldKey];
    const isApproved = dataStatus[category.id]?.approved;
    
    switch(column.type) {
      case 'text':
        return (
          <Input 
            id={`field-${fieldKey}`}
            value={(value as string) || ''}
            onChange={(e) => handleInputChange(category.id, column.id, e.target.value)}
            placeholder={`${column.name} daxil edin`}
            disabled={isApproved}
            className={!value && column.required ? "border-red-300" : ""}
          />
        );
      
      case 'number':
        return (
          <Input 
            id={`field-${fieldKey}`}
            type="number"
            value={(value as number) ?? ''}
            onChange={(e) => handleInputChange(category.id, column.id, e.target.value ? parseFloat(e.target.value) : null)}
            placeholder={`${column.name} daxil edin`}
            disabled={isApproved}
            className={!value && column.required ? "border-red-300" : ""}
          />
        );
      
      case 'textarea':
        return (
          <Textarea 
            id={`field-${fieldKey}`}
            value={(value as string) || ''}
            onChange={(e) => handleInputChange(category.id, column.id, e.target.value)}
            placeholder={`${column.name} daxil edin`}
            rows={3}
            disabled={isApproved}
            className={!value && column.required ? "border-red-300" : ""}
          />
        );
      
      case 'select':
        return (
          <Select 
            value={(value as string) || ''}
            onValueChange={(val) => handleInputChange(category.id, column.id, val)}
            disabled={isApproved}
          >
            <SelectTrigger className={!value && column.required ? "border-red-300" : ""}>
              <SelectValue placeholder={`${column.name} seçin`} />
            </SelectTrigger>
            <SelectContent>
              {column.options?.map(option => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Switch 
              id={`field-${fieldKey}`}
              checked={value as boolean || false}
              onCheckedChange={(checked) => handleInputChange(category.id, column.id, checked)}
              disabled={isApproved}
            />
            <Label 
              htmlFor={`field-${fieldKey}`} 
              className={`cursor-pointer ${isApproved ? 'opacity-70' : ''}`}
            >
              {value ? 'Bəli' : 'Xeyr'}
            </Label>
          </div>
        );
      
      default:
        return (
          <Input 
            id={`field-${fieldKey}`}
            value={(value as string) || ''}
            onChange={(e) => handleInputChange(category.id, column.id, e.target.value)}
            placeholder={`${column.name} daxil edin`}
            disabled={isApproved}
            className={!value && column.required ? "border-red-300" : ""}
          />
        );
    }
  };

  // Render a category card
  const renderCategoryCard = (category: Category) => {
    const status = categoryStatus[category.id] || { filled: 0, total: 0, percentage: 0 };
    const isApproved = dataStatus[category.id]?.approved;
    const lastUpdated = dataStatus[category.id]?.lastUpdated 
      ? new Date(dataStatus[category.id].lastUpdated).toLocaleString() 
      : null;
    const comment = dataStatus[category.id]?.comment;
    
    return (
      <Card key={category.id} className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {category.name}
              {isApproved && (
                <Badge variant="success" className="ml-2 bg-green-500">
                  <CheckCircle className="h-3 w-3 mr-1" /> Təsdiq edilmişdir
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {isApproved 
                ? `Təsdiq edilmişdir: ${lastUpdated}`
                : lastUpdated 
                  ? `Son dəyişiklik: ${lastUpdated}`
                  : 'Heç bir məlumat daxil edilməyib'
              }
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={uploadDialogOpen && importingCategory === category.id} 
                   onOpenChange={(open) => {
                     setUploadDialogOpen(open);
                     if (!open) setImportingCategory(null);
                   }}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  disabled={isApproved}
                  onClick={() => setImportingCategory(category.id)}
                >
                  <FileUp className="h-4 w-4 mr-2" />
                  Import et
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Məlumatları import edin</DialogTitle>
                  <DialogDescription>
                    Excel faylından {category.name} üçün məlumatları import edin
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Label htmlFor="import-file" className="mb-2 block">Excel faylını seçin</Label>
                  <Input 
                    id="import-file" 
                    type="file" 
                    accept=".xlsx,.xls,.csv" 
                    onChange={handleFileChange}
                  />
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setUploadDialogOpen(false);
                      setImportingCategory(null);
                    }}
                  >
                    Ləğv et
                  </Button>
                  <Button onClick={handleImport} disabled={!file}>
                    Import et
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Button 
              onClick={() => handleSaveForm(category.id)} 
              disabled={isApproved || status.percentage === 0}
            >
              <Save className="h-4 w-4 mr-2" />
              Yadda saxla
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Progress information */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">Tamamlanma: {status.percentage}%</span>
              <span className="text-sm text-muted-foreground">
                {status.filled} / {status.total} xana
              </span>
            </div>
            <div className="w-full bg-secondary h-2 rounded-full">
              <div 
                className={`h-2 rounded-full ${
                  status.percentage === 100 
                    ? 'bg-green-500' 
                    : status.percentage > 50 
                      ? 'bg-yellow-500' 
                      : 'bg-red-500'
                }`}
                style={{ width: `${status.percentage}%` }}
              ></div>
            </div>
          </div>
          
          {/* Info or warning messages */}
          {isApproved && comment && (
            <Alert className="mb-4 bg-green-50">
              <Info className="h-4 w-4" />
              <AlertTitle>Təsdiq qeydi</AlertTitle>
              <AlertDescription>{comment}</AlertDescription>
            </Alert>
          )}
          
          {!isApproved && status.percentage < 100 && category.columns.some(col => col.required) && (
            <Alert className="mb-4 bg-amber-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Diqqət</AlertTitle>
              <AlertDescription>
                Tələb olunan bütün xanaları doldurun. Tələb olunan xanalar qırmızı xətt ilə işarələnmişdir.
              </AlertDescription>
            </Alert>
          )}
          
          {/* Form fields */}
          <div className="space-y-4">
            {category.columns.map(column => {
              const fieldKey = `${category.id}-${column.id}`;
              const value = formData[fieldKey];
              const isEmpty = value === undefined || value === null || value === '';
              
              return (
                <div key={column.id} className="space-y-2">
                  <Label 
                    htmlFor={`field-${fieldKey}`} 
                    className={`flex items-center ${isApproved ? 'opacity-70' : ''}`}
                  >
                    {column.name}
                    {column.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                    {isEmpty && column.required && (
                      <span className="text-red-500 text-xs ml-2">Tələb olunur</span>
                    )}
                  </Label>
                  {renderFormField(category, column)}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
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
                <h1 className="text-xl font-semibold">Məktəb Paneli</h1>
              </div>
            </div>
          </header>

          <main className="p-6">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <p>Yüklənir...</p>
              </div>
            ) : (
              <>
                {/* Overview stats */}
                <div className="grid gap-4 md:grid-cols-3 mb-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Tamamlanmayan
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{incompleteCategories.length}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Tamamlanmayan kateqoriyalar
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Təsdiq gözləyən
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{pendingCategories.length}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Təsdiq gözləyən kateqoriyalar
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Təsdiq edilmiş
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{approvedCategories.length}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Təsdiq edilmiş kateqoriyalar
                      </p>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Tabs for different category states */}
                <Tabs defaultValue="incomplete" value={activeTab} onValueChange={setActiveTab} className="mb-6">
                  <TabsList>
                    <TabsTrigger value="incomplete" className="relative">
                      Tamamlanmayan
                      {incompleteCategories.length > 0 && (
                        <span className="ml-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                          {incompleteCategories.length}
                        </span>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="pending" className="relative">
                      Təsdiq gözləyən
                      {pendingCategories.length > 0 && (
                        <span className="ml-2 bg-yellow-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                          {pendingCategories.length}
                        </span>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="approved" className="relative">
                      Təsdiq edilmiş
                      {approvedCategories.length > 0 && (
                        <span className="ml-2 bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                          {approvedCategories.length}
                        </span>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="all">
                      Hamısı
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="incomplete" className="space-y-4 mt-4">
                    {incompleteCategories.length === 0 ? (
                      <Card>
                        <CardContent className="py-10 text-center">
                          <p className="text-muted-foreground">
                            Bütün kateqoriyalar tamamlanmışdır
                          </p>
                        </CardContent>
                      </Card>
                    ) : (
                      incompleteCategories.map(category => renderCategoryCard(category))
                    )}
                  </TabsContent>
                  
                  <TabsContent value="pending" className="space-y-4 mt-4">
                    {pendingCategories.length === 0 ? (
                      <Card>
                        <CardContent className="py-10 text-center">
                          <p className="text-muted-foreground">
                            Təsdiq gözləyən kateqoriya yoxdur
                          </p>
                        </CardContent>
                      </Card>
                    ) : (
                      pendingCategories.map(category => renderCategoryCard(category))
                    )}
                  </TabsContent>
                  
                  <TabsContent value="approved" className="space-y-4 mt-4">
                    {approvedCategories.length === 0 ? (
                      <Card>
                        <CardContent className="py-10 text-center">
                          <p className="text-muted-foreground">
                            Təsdiq edilmiş kateqoriya yoxdur
                          </p>
                        </CardContent>
                      </Card>
                    ) : (
                      approvedCategories.map(category => renderCategoryCard(category))
                    )}
                  </TabsContent>
                  
                  <TabsContent value="all" className="space-y-4 mt-4">
                    {categories.map(category => renderCategoryCard(category))}
                  </TabsContent>
                </Tabs>
              </>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default SchoolDashboard;
