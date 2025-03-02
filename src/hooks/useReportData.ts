
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Column, Category } from "@/lib/api/types";
import * as XLSX from 'xlsx';

export const useReportData = () => {
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedSector, setSelectedSector] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [filteredSectors, setFilteredSectors] = useState<any[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [filters, setFilters] = useState<{ [key: string]: string }>({});
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  // Update filtered sectors when region changes
  const updateFilteredSectors = (sectors: any[], regionId: string) => {
    if (regionId) {
      const filtered = sectors.filter(
        (sector) => sector.region_id === regionId
      );
      setFilteredSectors(filtered);
      setSelectedSector("");
      setSelectedCategory("");
    }
  };

  // Fetch category columns
  const fetchCategoryColumns = async (categoryId: string) => {
    if (!categoryId) return;
    
    try {
      const category = await api.categories.getById(categoryId);
      if (category && category.columns) {
        setColumns(category.columns);
      }
    } catch (error) {
      console.error('Error fetching category columns:', error);
      toast.error('Failed to load category columns');
    }
  };

  // Handle filtering
  const handleFilter = (columnName: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [columnName]: value,
    }));
  };

  // Handle sorting
  const handleSort = (columnName: string) => {
    setSortConfig((prev) => ({
      key: columnName,
      direction:
        prev?.key === columnName && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Filter and sort data
  const filteredAndSortedData = () => {
    let result = [...data];

    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        result = result.filter((item) => {
          const value = item.data ? item.data[key] : item[key];
          return String(value)
            .toLowerCase()
            .includes(filters[key].toLowerCase());
        });
      }
    });

    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a.data ? a.data[sortConfig.key] : a[sortConfig.key];
        const bValue = b.data ? b.data[sortConfig.key] : b[sortConfig.key];
        
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

  // Export to Excel
  const handleExportToExcel = () => {
    const exportData = filteredAndSortedData().map(item => {
      const flatItem: Record<string, any> = {};
      columns.forEach(column => {
        flatItem[column.name] = item.data[column.name] || '';
      });
      return flatItem;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    
    XLSX.writeFile(wb, "report.xlsx");
    
    toast.success('Report exported successfully');
  };

  return {
    selectedRegion,
    setSelectedRegion,
    selectedSector,
    setSelectedSector,
    selectedCategory,
    setSelectedCategory,
    filteredSectors,
    setFilteredSectors,
    columns,
    setColumns,
    data,
    setData,
    filters,
    sortConfig,
    updateFilteredSectors,
    fetchCategoryColumns,
    handleFilter,
    handleSort,
    filteredAndSortedData,
    handleExportToExcel
  };
};
