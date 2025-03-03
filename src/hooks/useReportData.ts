
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Column, Category, PaginationParams, SortParams, FilterParams } from "@/lib/api/types";
import { usePaginatedData } from "./usePaginatedData";
import { useQuery } from "@tanstack/react-query";
import { exportToExcel } from "@/utils/excelExport";

export const useReportData = () => {
  // Basic state
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedSector, setSelectedSector] = useState<string>("");
  const [selectedSchool, setSelectedSchool] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  
  // Data states
  const [filteredSectors, setFilteredSectors] = useState<any[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<any[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Loading state 
  const [loading, setLoading] = useState<boolean>(false);
  
  // Use the enhanced pagination hook for data
  const {
    data,
    metadata,
    isLoading: dataLoading,
    filters,
    sort,
    pagination,
    handleFilterChange,
    handleSortChange,
    handlePageChange,
    handlePageSizeChange,
    refetch
  } = usePaginatedData({
    queryKey: ['reports', selectedCategory],
    queryFn: (options) => {
      // Add the category filter
      if (selectedCategory) {
        options.filters = {
          ...options.filters,
          category_id: selectedCategory
        };
      }
      
      // Add school filter if selected
      if (selectedSchool) {
        options.filters = {
          ...options.filters,
          school_id: selectedSchool
        };
      }
      
      return api.formData.getAllByCategory(selectedCategory, options);
    },
    enabled: !!selectedCategory,
    initialPagination: { page: 1, pageSize: 50 },
    initialSort: { column: 'created_at', direction: 'desc' }
  });
  
  // Fetch regions
  const { data: regions = [] } = useQuery({
    queryKey: ['regions'],
    queryFn: api.regions.getAll,
    staleTime: 1000 * 60 * 15 // 15 minutes
  });
  
  // Update filtered sectors when region changes
  const updateFilteredSectors = useCallback(async (regionId: string) => {
    if (regionId) {
      setLoading(true);
      try {
        const sectors = await api.sectors.getByRegion(regionId);
        setFilteredSectors(sectors);
        // Clear selections
        setSelectedSector("");
        setSelectedSchool("");
        setSelectedCategory("");
      } catch (error) {
        console.error('Failed to fetch sectors:', error);
        toast.error('Failed to load sectors');
      } finally {
        setLoading(false);
      }
    } else {
      setFilteredSectors([]);
    }
  }, []);
  
  // Update filtered schools when sector changes
  const updateFilteredSchools = useCallback(async (sectorId: string) => {
    if (sectorId) {
      setLoading(true);
      try {
        const schools = await api.schools.getBySector(sectorId);
        setFilteredSchools(schools);
        // Clear selections
        setSelectedSchool("");
        setSelectedCategory("");
      } catch (error) {
        console.error('Failed to fetch schools:', error);
        toast.error('Failed to load schools');
      } finally {
        setLoading(false);
      }
    } else {
      setFilteredSchools([]);
    }
  }, []);
  
  // Fetch categories
  const fetchCategories = useCallback(async (sectorId: string) => {
    if (!sectorId) return;
    
    setLoading(true);
    try {
      // Fetch categories for the selected sector
      const categoriesData = await api.categories.getAll();
      // Filter categories by sector
      const filteredCategories = categoriesData.filter(
        (category) => category.sectorId === sectorId
      );
      setCategories(filteredCategories);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Fetch category columns
  const fetchCategoryColumns = useCallback(async (categoryId: string) => {
    if (!categoryId) return;
    
    setLoading(true);
    try {
      const category = await api.categories.getById(categoryId);
      if (category && category.columns) {
        // Ensure we get an array of valid Column objects
        const validColumns = Array.isArray(category.columns) 
          ? category.columns.filter(col => col && typeof col === 'object' && 'id' in col)
          : [];
        setColumns(validColumns as Column[]);
      }
    } catch (error) {
      console.error('Error fetching category columns:', error);
      toast.error('Failed to load category columns');
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Filtered and sorted data handled by usePaginatedData hook
  const filteredAndSortedData = data;
  
  // Export to Excel with batching for large datasets
  const handleExportToExcel = () => {
    if (!columns.length) {
      toast.error('No columns selected for export');
      return;
    }
    
    if (!filteredAndSortedData.length) {
      toast.error('No data available for export');
      return;
    }
    
    // Get the category name for the filename
    const categoryName = categories.find(c => c.id === selectedCategory)?.name || 'report';
    
    try {
      exportToExcel(filteredAndSortedData, columns, categoryName);
      toast.success('Export initiated - file will download shortly');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    }
  };
  
  // Effects
  useEffect(() => {
    if (selectedRegion) {
      updateFilteredSectors(selectedRegion);
    }
  }, [selectedRegion, updateFilteredSectors]);
  
  useEffect(() => {
    if (selectedSector) {
      updateFilteredSchools(selectedSector);
      fetchCategories(selectedSector);
    }
  }, [selectedSector, updateFilteredSchools, fetchCategories]);
  
  useEffect(() => {
    if (selectedCategory) {
      fetchCategoryColumns(selectedCategory);
    }
  }, [selectedCategory, fetchCategoryColumns]);
  
  return {
    // Selections
    selectedRegion,
    setSelectedRegion,
    selectedSector,
    setSelectedSector,
    selectedSchool,
    setSelectedSchool,
    selectedCategory,
    setSelectedCategory,
    
    // Data sources
    regions,
    filteredSectors,
    filteredSchools,
    categories,
    columns,
    
    // State
    loading: loading || dataLoading,
    
    // Filtering, sorting and pagination
    filters,
    sort,
    pagination,
    handleFilterChange,
    handleSortChange,
    handlePageChange,
    handlePageSizeChange,
    
    // Data and utilities
    data: filteredAndSortedData,
    metadata,
    refetch,
    updateFilteredSectors,
    updateFilteredSchools,
    fetchCategories,
    fetchCategoryColumns,
    handleExportToExcel
  };
};
