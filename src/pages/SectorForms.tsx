
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
import { Check, Save, FileDown } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

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
}

interface School {
  id: string;
  name: string;
}

interface FormData {
  [key: string]: string | boolean | number;
}

const SectorForms = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get('categoryId');
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryId || "");
  const [selectedSchool, setSelectedSchool] = useState<string>("");
  const [formData, setFormData] = useState<FormData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is a sector admin
    if (user && user.role !== 'sectoradmin') {
      navigate('/');
      return;
    }

    // Fetch categories and schools data
    // In a real application, this would be API calls
    setTimeout(() => {
      const mockCategories = [
        { 
          id: "1", 
          name: "Ümumi Məlumatlar", 
          regionId: "1",
          columns: [
            { id: 1, name: "Ünvan", type: "text" },
            { id: 2, name: "Direktor", type: "text" },
            { id: 3, name: "Telefon", type: "text" },
          ]
        },
        { 
          id: "2", 
          name: "Tədris Göstəriciləri", 
          regionId: "1",
          columns: [
            { id: 4, name: "Tələbə sayı", type: "number" },
            { id: 5, name: "Müəllim sayı", type: "number" },
            { id: 6, name: "Orta bal", type: "number" },
          ]
        },
        { 
          id: "3", 
          name: "İnfrastruktur", 
          sectorId: "1",
          columns: [
            { id: 7, name: "Sinif otaqları", type: "number" },
            { id: 8, name: "Laboratoriyalar", type: "number" },
            { id: 9, name: "İdman zalı", type: "select", options: ["Var", "Yoxdur"] },
            { id: 10, name: "İnternetə çıxış", type: "boolean" },
            { id: 11, name: "Əlavə məlumat", type: "textarea" },
          ]
        },
      ];
      
      const mockSchools = [
        { id: "1", name: "Məktəb 1" },
        { id: "2", name: "Məktəb 2" },
        { id: "3", name: "Məktəb 3" },
      ];
      
      // Filter categories visible to this sector admin
      const filteredCategories = mockCategories.filter(category => 
        category.regionId || category.sectorId === user?.sectorId
      );
      
      setCategories(filteredCategories);
      setSchools(mockSchools);
      setLoading(false);
      
      // Initialize with some mock form data for demo purposes
      const mockFormData: FormData = {
        "1-1": "Bakı şəh., Yasamal r.",
        "1-2": "Əliyev Məmməd",
        "1-3": "055-555-55-55",
        "2-4": 450,
        "2-5": 35,
        "2-6": 78.5,
        "3-7": 25,
        "3-8": 3,
        "3-9": "Var",
        "3-10": true,
        "3-11": "Məktəbimiz 2020-ci ildə əsaslı təmir olunmuşdur."
      };
      
      setFormData(mockFormData);
    }, 1000);
  }, [user, navigate, categoryId]);

  const handleInputChange = (columnId: number, value: string | boolean | number) => {
    if (selectedCategory && selectedSchool) {
      setFormData(prev => ({
        ...prev,
        [`${selectedCategory}-${columnId}`]: value
      }));
    }
  };

  const handleSaveForm = () => {
    // In a real app, this would save to database
    toast.success("Məlumatlar uğurla yadda saxlanıldı");
  };

  // Render form fields based on column type
  const renderFormField = (column: Column) => {
    const fieldKey = `${selectedCategory}-${column.id}`;
    const value = formData[fieldKey];
    
    switch(column.type) {
      case 'text':
        return (
          <Input 
            id={`field-${column.id}`}
            value={value as string || ''}
            onChange={(e) => handleInputChange(column.id, e.target.value)}
            placeholder={`${column.name} daxil edin`}
          />
        );
      
      case 'number':
        return (
          <Input 
            id={`field-${column.id}`}
            type="number"
            value={value as number || ''}
            onChange={(e) => handleInputChange(column.id, parseFloat(e.target.value))}
            placeholder={`${column.name} daxil edin`}
          />
        );
      
      case 'textarea':
        return (
          <Textarea 
            id={`field-${column.id}`}
            value={value as string || ''}
            onChange={(e) => handleInputChange(column.id, e.target.value)}
            placeholder={`${column.name} daxil edin`}
            rows={4}
          />
        );
      
      case 'select':
        return (
          <Select 
            value={value as string || ''}
            onValueChange={(val) => handleInputChange(column.id, val)}
          >
            <SelectTrigger>
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
              id={`field-${column.id}`}
              checked={value as boolean || false}
              onCheckedChange={(checked) => handleInputChange(column.id, checked)}
            />
            <Label htmlFor={`field-${column.id}`} className="cursor-pointer">
              {value ? 'Bəli' : 'Xeyr'}
            </Label>
          </div>
        );
      
      default:
        return (
          <Input 
            id={`field-${column.id}`}
            value={value as string || ''}
            onChange={(e) => handleInputChange(column.id, e.target.value)}
            placeholder={`${column.name} daxil edin`}
          />
        );
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
                <h1 className="text-xl font-semibold">Microsoft Forms kimi görünüş</h1>
              </div>
            </div>
          </header>

          <main className="p-6">
            <Card className="mb-6">
              <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category-select">Kateqoriya</Label>
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
                
                <div>
                  <Label htmlFor="school-select">Məktəb</Label>
                  <Select
                    value={selectedSchool}
                    onValueChange={setSelectedSchool}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Məktəb seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {schools.map(school => (
                        <SelectItem key={school.id} value={school.id}>
                          {school.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {loading ? (
              <div className="flex justify-center items-center h-32">
                <p>Yüklənir...</p>
              </div>
            ) : selectedCategory && selectedSchool ? (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {categories.find(c => c.id === selectedCategory)?.name}
                  </CardTitle>
                  <CardDescription>
                    {schools.find(s => s.id === selectedSchool)?.name} üçün məlumatları doldurun
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-6">
                    {categories
                      .find(c => c.id === selectedCategory)
                      ?.columns.map(column => (
                        <div key={column.id} className="space-y-2">
                          <Label htmlFor={`field-${column.id}`}>{column.name}</Label>
                          {renderFormField(column)}
                        </div>
                      ))}
                      
                    <div className="flex justify-end">
                      <Button onClick={handleSaveForm}>
                        <Save className="w-4 h-4 mr-2" />
                        Yadda saxla
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-10 text-center">
                  <p className="text-muted-foreground">
                    Məlumatları görmək üçün kateqoriya və məktəb seçin
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

export default SectorForms;
