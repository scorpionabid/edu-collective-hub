
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { utils, writeFileXLSX } from "xlsx";

export const useReportData = () => {
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedSector, setSelectedSector] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [regions, setRegions] = useState<{ id: string; name: string }[]>([]);
  const [sectors, setSectors] = useState<{ id: string; name: string }[]>([]);
  const [schools, setSchools] = useState<{ id: string; name: string }[]>([]);
  const [filteredSectors, setFilteredSectors] = useState<{ id: string; name: string }[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<{ id: string; name: string }[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [columns, setColumns] = useState<{ id: string; name: string; type: string }[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [filters, setFilters] = useState<{ [key: string]: string }>({});

  // Fetch regions on component mount
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        setLoading(true);
        const regionsData = await api.regions.getAll();
        setRegions(regionsData);
      } catch (error) {
        console.error("Error loading regions:", error);
        toast.error("Failed to load regions");
      } finally {
        setLoading(false);
      }
    };

    fetchRegions();
  }, []);

  // Fetch sectors when a region is selected
  useEffect(() => {
    const fetchSectors = async () => {
      if (!selectedRegion) {
        setFilteredSectors([]);
        setSectors([]);
        return;
      }

      try {
        setLoading(true);
        const sectorsData = await api.sectors.getAll();
        setSectors(sectorsData);
        
        const filtered = sectorsData.filter(
          (sector) => sector.regionId === selectedRegion
        );
        setFilteredSectors(filtered);
      } catch (error) {
        console.error("Error loading sectors:", error);
        toast.error("Failed to load sectors");
      } finally {
        setLoading(false);
      }
    };

    fetchSectors();
  }, [selectedRegion]);

  // Fetch schools when a sector is selected
  useEffect(() => {
    const fetchSchools = async () => {
      if (!selectedSector) {
        setFilteredSchools([]);
        return;
      }

      try {
        setLoading(true);
        const schoolsData = await api.schools.getAll();
        setSchools(schoolsData);
        
        const filtered = schoolsData.filter(
          (school) => school.sectorId === selectedSector
        );
        setFilteredSchools(filtered);
      } catch (error) {
        console.error("Error loading schools:", error);
        toast.error("Failed to load schools");
      } finally {
        setLoading(false);
      }
    };

    fetchSchools();
  }, [selectedSector]);

  // Fetch categories when a sector or school is selected
  useEffect(() => {
    const fetchCategories = async () => {
      if (!selectedSector) {
        setCategories([]);
        return;
      }

      try {
        setLoading(true);
        const categoriesData = await api.categories.getAll();
        
        let filtered = categoriesData;
        
        if (selectedSchool) {
          filtered = categoriesData.filter(
            (cat) => cat.schoolId === selectedSchool || 
                    (cat.sectorId === selectedSector && !cat.schoolId)
          );
        } else {
          filtered = categoriesData.filter(
            (cat) => cat.sectorId === selectedSector
          );
        }
        
        setCategories(filtered);
      } catch (error) {
        console.error("Error loading categories:", error);
        toast.error("Failed to load categories");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [selectedSector, selectedSchool]);

  // Fetch columns and data when a category is selected
  useEffect(() => {
    const fetchColumnsAndData = async () => {
      if (!selectedCategory) {
        setColumns([]);
        setData([]);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch columns for the selected category
        const columnsData = await api.columns.getByCategory(selectedCategory);
        setColumns(columnsData);
        
        // Fetch data for the selected category
        const formDataResponse = await api.formData.getAllByCategory(selectedCategory);
        
        // Process data to flatten the structure
        const processedData = formDataResponse.data.map((item) => {
          const result = {
            id: item.id,
            schoolName: item.schoolName || 'Unknown School',
            status: item.status,
            ...item.data
          };
          
          return result;
        });
        
        setData(processedData);
      } catch (error) {
        console.error("Error loading columns and data:", error);
        toast.error("Failed to load report data");
      } finally {
        setLoading(false);
      }
    };

    fetchColumnsAndData();
  }, [selectedCategory]);

  // Function to fetch columns for a specific category
  const fetchCategoryColumns = async (categoryId: string) => {
    try {
      setLoading(true);
      const columnsData = await api.columns.getByCategory(categoryId);
      return columnsData;
    } catch (error) {
      console.error("Error loading columns:", error);
      toast.error("Failed to load columns");
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort data
  const getFilteredAndSortedData = useCallback(() => {
    let result = [...data];

    // Apply filters
    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        result = result.filter((item) =>
          String(item[key])
            .toLowerCase()
            .includes(filters[key].toLowerCase())
        );
      }
    });

    // Apply sorting
    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key] || '';
        const bValue = b[sortConfig.key] || '';
        
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
  }, [data, filters, sortConfig]);

  // Handle filter changes
  const handleFilter = (columnName: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [columnName]: value,
    }));
  };

  // Handle sort
  const handleSort = (columnName: string) => {
    setSortConfig((prev) => ({
      key: columnName,
      direction:
        prev?.key === columnName && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Update filtered sectors based on selected region
  const updateFilteredSectors = (region: any) => {
    const filtered = sectors.filter((sector) => sector.regionId === region);
    setFilteredSectors(filtered);
  };

  // Update filtered schools based on selected sector
  const updateFilteredSchools = (sector: any) => {
    const filtered = schools.filter((school) => school.sectorId === sector);
    setFilteredSchools(filtered);
  };

  // Export to Excel
  const handleExportToExcel = () => {
    try {
      const filteredData = getFilteredAndSortedData();
      
      if (filteredData.length === 0) {
        toast.error("No data to export");
        return;
      }
      
      const worksheet = utils.json_to_sheet(filteredData);
      
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

  return {
    selectedRegion,
    setSelectedRegion,
    selectedSector,
    setSelectedSector,
    selectedSchool,
    setSelectedSchool,
    selectedCategory,
    setSelectedCategory,
    regions,
    sectors,
    schools,
    filteredSectors,
    filteredSchools,
    categories,
    columns,
    data,
    loading,
    filters,
    setFilters,
    sortConfig,
    setSortConfig,
    getFilteredAndSortedData,
    handleFilter,
    handleSort,
    updateFilteredSectors,
    updateFilteredSchools,
    fetchCategoryColumns,
    handleExportToExcel
  };
};
