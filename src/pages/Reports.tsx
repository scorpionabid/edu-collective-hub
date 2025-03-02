
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download } from "lucide-react";
import { useEffect } from "react";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { ReportFilters } from "@/components/reports/ReportFilters";
import { ReportTable } from "@/components/reports/ReportTable";
import { useReportData } from "@/hooks/useReportData";

const Reports = () => {
  const { user } = useAuth();
  const {
    selectedRegion,
    setSelectedRegion,
    selectedSector,
    setSelectedSector,
    selectedCategory,
    setSelectedCategory,
    filteredSectors,
    setFilteredSectors,
    columns,
    setData,
    filters,
    sortConfig,
    handleFilter,
    handleSort,
    filteredAndSortedData,
    handleExportToExcel
  } = useReportData();

  const { data: regions = [] } = useQuery({
    queryKey: ['regions'],
    queryFn: () => api.regions.getAll(),
  });

  const { data: sectors = [] } = useQuery({
    queryKey: ['sectors'],
    queryFn: () => api.sectors.getAll(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.categories.getAll(),
  });

  const { data: formData = [] } = useQuery({
    queryKey: ['formData', selectedCategory],
    queryFn: () => api.formData.getAll(),
    enabled: !!selectedCategory,
  });

  useEffect(() => {
    if (selectedRegion) {
      const filtered = sectors.filter(
        (sector) => sector.region_id === selectedRegion
      );
      setFilteredSectors(filtered);
      setSelectedSector("");
      setSelectedCategory("");
    }
  }, [selectedRegion, sectors, setFilteredSectors, setSelectedSector, setSelectedCategory]);

  useEffect(() => {
    if (selectedCategory) {
      api.categories.getById(selectedCategory)
        .then(category => {
          if (category && category.columns) {
            // This will set columns in the useReportData hook
            // but we need an additional effect since we're splitting components
            if (formData.length > 0) {
              setData(formData);
            }
          }
        })
        .catch(error => {
          console.error('Error fetching category columns:', error);
        });
    }
  }, [selectedCategory, formData, setData]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1">
          <header className="bg-white shadow">
            <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <h1 className="text-xl font-semibold">Reports</h1>
              </div>
            </div>
          </header>
          <main className="p-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Report Generator</CardTitle>
                <Button onClick={handleExportToExcel} disabled={filteredAndSortedData().length === 0}>
                  <Download className="w-4 h-4 mr-2" />
                  Export to Excel
                </Button>
              </CardHeader>
              <CardContent>
                <ReportFilters
                  regions={regions}
                  sectors={sectors}
                  categories={categories}
                  selectedRegion={selectedRegion}
                  selectedSector={selectedSector}
                  selectedCategory={selectedCategory}
                  filteredSectors={filteredSectors}
                  setSelectedRegion={setSelectedRegion}
                  setSelectedSector={setSelectedSector}
                  setSelectedCategory={setSelectedCategory}
                />

                {selectedCategory && columns.length > 0 && (
                  <ReportTable
                    columns={columns}
                    data={formData}
                    filters={filters}
                    sortConfig={sortConfig}
                    handleFilter={handleFilter}
                    handleSort={handleSort}
                    filteredAndSortedData={filteredAndSortedData}
                  />
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Reports;
