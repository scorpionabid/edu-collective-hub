
import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Info, AlertCircle, Clock } from "lucide-react";
import { DataEntryForm } from "@/components/forms/DataEntryForm";
import { useAuth } from "@/contexts/AuthContext";
import { useCategories } from "@/hooks/useCategories";
import { useColumns } from "@/hooks/useColumns";
import { useFormData } from "@/hooks/useFormData";
import { toast } from "sonner";

const SchoolDashboard = () => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { categories, isLoading: categoriesLoading } = useCategories();
  const { columns, isLoading: columnsLoading } = useColumns(selectedCategory || "");
  const { 
    formData, 
    isLoading: formDataLoading, 
    submitForm 
  } = useFormData(user?.schoolId);
  
  // Select the first category by default
  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0].id);
    }
  }, [categories, selectedCategory]);

  const handleSubmitForm = async (data: any) => {
    try {
      if (!user?.schoolId) {
        toast.error("School ID not found");
        return;
      }
      
      await submitForm.mutateAsync({
        ...data,
        schoolId: user.schoolId,
        categoryId: selectedCategory || "",
        status: "submitted"
      });
      
      toast.success("Form submitted successfully");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to submit form");
    }
  };

  // Find if the current category has already been submitted
  const findSubmittedData = (categoryId: string) => {
    return formData.find(item => item.categoryId === categoryId);
  };

  // Check if a form has been approved
  const isApproved = (categoryId: string) => {
    const data = findSubmittedData(categoryId);
    return data && data.status === 'approved';
  };

  // Get status badge based on form status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return (
          <Badge variant="outline" className="ml-2 bg-gray-100 text-gray-700 border-gray-300">
            <Clock className="h-3 w-3 mr-1" /> Qaralama
          </Badge>
        );
      case 'submitted':
        return (
          <Badge variant="outline" className="ml-2 bg-blue-500 text-white border-0">
            <Info className="h-3 w-3 mr-1" /> Təqdim edilib
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="outline" className="ml-2 bg-green-500 text-white border-0">
            <CheckCircle className="h-3 w-3 mr-1" /> Təsdiq edilmişdir
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="ml-2 bg-red-500 text-white border-0">
            <AlertCircle className="h-3 w-3 mr-1" /> Rədd edilmişdir
          </Badge>
        );
      default:
        return null;
    }
  };

  // Loading state
  if (categoriesLoading || (selectedCategory && columnsLoading) || formDataLoading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <div className="flex-1 p-8">
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  // No categories available
  if (categories.length === 0) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <div className="flex-1 p-8">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Kateqoriyalar tapılmadı</AlertTitle>
              <AlertDescription>
                Hazırda tamamlanmalı olan anket yoxdur. Zəhmət olmasa daha sonra yenidən yoxlayın.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1">
          <header className="bg-white shadow">
            <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <h1 className="text-xl font-semibold">Məktəb İdarəetmə Paneli</h1>
              </div>
            </div>
          </header>
          
          <main className="p-6">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Xoş gəlmisiniz!</CardTitle>
                <CardDescription>
                  Bu panel vasitəsilə məlumatları daxil edə və izləyə bilərsiniz.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Məlumatları daxil etmək üçün aşağıdakı kateqoriyaları seçin. Qeyd edilmiş sahələri dolduraraq məlumatları təqdim edə bilərsiniz.
                </p>
              </CardContent>
            </Card>

            <Tabs 
              defaultValue={categories[0]?.id.toString()} 
              onValueChange={(value) => setSelectedCategory(value)}
              className="space-y-6"
            >
              <TabsList className="grid" style={{ gridTemplateColumns: `repeat(${Math.min(categories.length, 4)}, minmax(0, 1fr))` }}>
                {categories.map((category) => (
                  <TabsTrigger key={category.id} value={category.id.toString()}>
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {categories.map((category) => {
                const submittedData = findSubmittedData(category.id);
                const isReadOnly = !!submittedData && submittedData.status !== 'draft';
                
                return (
                  <TabsContent key={category.id} value={category.id.toString()}>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          {category.name}
                          {submittedData && getStatusBadge(submittedData.status)}
                        </CardTitle>
                        <CardDescription>
                          {isReadOnly 
                            ? "Bu məlumatlar artıq təqdim edilib və yalnız oxunuş üçün mövcuddur."
                            : "Zəhmət olmasa aşağıdakı sahələri doldurun və təqdim edin."}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {selectedCategory === category.id && (
                          <DataEntryForm
                            columns={columns}
                            categoryId={category.id}
                            schoolId={user?.schoolId || ''}
                            initialData={submittedData?.data || {}}
                            isReadOnly={isReadOnly}
                            onSubmit={handleSubmitForm}
                          />
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                );
              })}
            </Tabs>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default SchoolDashboard;
