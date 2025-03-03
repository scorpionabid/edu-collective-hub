
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { ReportFilters } from '@/components/reports/ReportFilters';
import { ReportTable } from '@/components/reports/ReportTable';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Column } from '@/lib/api/types';
import { utils, writeFileXLSX } from 'xlsx';

const Reports = () => {
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedSector, setSelectedSector] = useState<string>("");
  const [selectedSchool, setSelectedSchool] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [categories, setCategories] = useState<any[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [filteredSectors, setFilteredSectors] = useState<any[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [filters, setFilters] = useState<{ [key: string]: string }>({});
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const fetchRegions = async () => {
    try {
      const regions = await api.regions.getAll();
      return regions;
    } catch (error) {
      console.error("Error fetching regions:", error);
      toast.error("Failed to fetch regions");
      return [];
    }
  };

  const fetchSectors = async (regionId?: string) => {
    try {
      const sectors = await api.sectors.getAll();
      if (regionId) {
        return sectors.filter((sector) => sector.region_id === regionId);
      }
      return sectors;
    } catch (error) {
      console.error("Error fetching sectors:", error);
      toast.error("Failed to fetch sectors");
      return [];
    }
  };

  const fetchSchools = async (sectorId?: string) => {
    try {
      const schools = await api.schools.getAll();
      if (sectorId) {
        return schools.filter((school) => school.sector_id === sectorId);
      }
      return schools;
    } catch (error) {
      console.error("Error fetching schools:", error);
      toast.error("Failed to fetch schools");
      return [];
    }
  };

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const categoriesData = await api.categories.getAll();
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error loading categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategoryColumns = async (categoryId: string) => {
    try {
      setIsLoading(true);
      const categoryDetails = await api.categories.getById(categoryId);
      if (categoryDetails && categoryDetails.columns) {
        setColumns(categoryDetails.columns);
      }
    } catch (error) {
      console.error("Error loading columns:", error);
      toast.error("Failed to load columns");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const formData = await api.formData.getAll();
      
      // Filter based on selected filters
      let filteredData = formData;
      
      if (selectedCategory) {
        filteredData = filteredData.filter(
          (item) => item.categoryId === selectedCategory
        );
      }
      
      if (selectedSchool) {
        filteredData = filteredData.filter(
          (item) => item.schoolId === selectedSchool
        );
      }
      
      setData(filteredData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load report data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchCategoryColumns(selectedCategory);
      fetchData();
    }
  }, [selectedCategory, selectedSchool]);

  const handleFilter = (columnName: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [columnName]: value,
    }));
  };

  const handleSort = (columnName: string) => {
    setSortConfig((prev) => ({
      key: columnName,
      direction:
        prev?.key === columnName && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const filteredAndSortedData = () => {
    let result = [...data];

    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        result = result.filter((item) =>
          String(item.data[key])
            .toLowerCase()
            .includes(filters[key].toLowerCase())
        );
      }
    });

    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = (a.data[sortConfig.key] || '').toString();
        const bValue = (b.data[sortConfig.key] || '').toString();
        
        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  };

  const handleExportToExcel = () => {
    try {
      const filteredData = filteredAndSortedData();
      
      if (filteredData.length === 0) {
        toast.error("No data to export");
        return;
      }
      
      // Transform data for Excel export
      const exportData = filteredData.map(item => ({
        School: item.schoolName || 'Unknown School',
        Status: item.status,
        ...item.data
      }));
      
      const worksheet = utils.json_to_sheet(exportData);
      
      const workbook = utils.book_new();
      utils.book_append_sheet(workbook, worksheet, "Report Data");
      
      const categoryName = categories.find(c => c.id === selectedCategory)?.name || "Report";
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const fileName = `${categoryName}_${timestamp}.xlsx`;
      
      writeFileXLSX(workbook, fileName);
      
      toast.success("Report exported to Excel");
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast.error("Failed to export data to Excel");
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Reports</h1>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Report Builder</CardTitle>
          <Button onClick={handleExportToExcel} disabled={data.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Export to Excel
          </Button>
        </CardHeader>
        <CardContent>
          <ReportFilters 
            selectedRegion={selectedRegion}
            setSelectedRegion={setSelectedRegion}
            selectedSector={selectedSector}
            setSelectedSector={setSelectedSector}
            selectedSchool={selectedSchool}
            setSelectedSchool={setSelectedSchool}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            categories={categories}
            filteredSectors={filteredSectors}
            filteredSchools={filteredSchools}
            fetchRegions={fetchRegions}
            fetchSectors={fetchSectors}
            fetchSchools={fetchSchools}
            fetchCategoryColumns={fetchCategoryColumns}
          />
          
          {isLoading ? (
            <div className="flex justify-center my-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            columns.length > 0 && (
              <ReportTable 
                columns={columns}
                data={data}
                filters={filters}
                sortConfig={sortConfig}
                handleFilter={handleFilter}
                handleSort={handleSort}
                filteredAndSortedData={filteredAndSortedData}
              />
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
