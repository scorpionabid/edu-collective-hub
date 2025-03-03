
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { FormData, Category, Column, QueryOptions, PaginatedResponse, Region, School, Sector } from '@/lib/api/types';

export interface ReportFilters {
  region?: string;
  sector?: string;
  school?: string;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  [key: string]: any;
}

export const useReportData = (initialFilters: ReportFilters = {}) => {
  const [formData, setFormData] = useState<FormData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryColumns, setCategoryColumns] = useState<Column[]>([]);
  const [filters, setFilters] = useState<ReportFilters>(initialFilters);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0
  });
  const [sortConfig, setSortConfig] = useState({
    column: 'createdAt',
    direction: 'desc' as 'asc' | 'desc'
  });
  
  // Fetch form data with filters
  const fetchFormData = async () => {
    try {
      setLoading(true);
      let data: FormData[] = [];
      
      // Check if we have a category filter
      if (filters.category) {
        data = await api.formData.getAllByCategory(filters.category);
        
        // Apply additional filters
        if (filters.school) {
          data = data.filter(item => item.schoolId === filters.school);
        }
        
        if (filters.status) {
          data = data.filter(item => item.status === filters.status);
        }
        
        // Add date range filtering
        if (filters.dateFrom || filters.dateTo) {
          data = data.filter(item => {
            const createdDate = new Date(item.createdAt);
            
            if (filters.dateFrom && new Date(filters.dateFrom) > createdDate) {
              return false;
            }
            
            if (filters.dateTo && new Date(filters.dateTo) < createdDate) {
              return false;
            }
            
            return true;
          });
        }
      } else {
        // If no category is selected, fetch all form data
        data = await api.formData.getAllFormData();
      }
      
      // Apply school filtering
      if (filters.school) {
        // For school filtering, get all schools in the sector
        const schools = await api.schools.getBySector(filters.sector || '');
        const schoolIds = schools.map(school => school.id);
        data = data.filter(item => schoolIds.includes(item.schoolId));
      }
      
      setFormData(data);
      setPagination(prev => ({ ...prev, total: data.length }));
    } catch (err) {
      console.error('Error fetching form data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch form data'));
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch categories
  const fetchCategories = async () => {
    try {
      const data = await api.categories.getAll();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };
  
  // Fetch columns for a category
  const fetchCategoryColumns = async (categoryId: string) => {
    try {
      if (!categoryId) return;
      
      const data = await api.columns.getAll(categoryId);
      setCategoryColumns(data);
      
      // Find and set the selected category
      const category = categories.find(cat => cat.id === categoryId);
      if (category) {
        setSelectedCategory(category);
      }
    } catch (err) {
      console.error('Error fetching category columns:', err);
    }
  };
  
  // Apply filters
  const applyFilters = (newFilters: ReportFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };
  
  // Handle filter change
  const handleFilterChange = (newFilters: ReportFilters) => {
    applyFilters(newFilters);
  };
  
  // Handle sort change
  const handleSortChange = (column: string) => {
    setSortConfig(prev => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };
  
  // Handle pagination change
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };
  
  // Handle page size change
  const handlePageSizeChange = (pageSize: number) => {
    setPagination(prev => ({ ...prev, pageSize, page: 1 }));
  };
  
  // Export data to Excel
  const handleExportToExcel = () => {
    // Implementation for Excel export
    console.log('Exporting to Excel:', formData, categoryColumns);
  };
  
  // Apply sorting to data
  const getSortedData = () => {
    return [...formData].sort((a, b) => {
      // Handle special case for nested data properties
      if (sortConfig.column.includes('.')) {
        const parts = sortConfig.column.split('.');
        const aValue = parts.reduce((obj, key) => obj && obj[key] !== undefined ? obj[key] : null, a);
        const bValue = parts.reduce((obj, key) => obj && obj[key] !== undefined ? obj[key] : null, b);
        
        if (aValue === bValue) return 0;
        
        const direction = sortConfig.direction === 'asc' ? 1 : -1;
        return aValue < bValue ? -1 * direction : 1 * direction;
      }
      
      // Handle direct properties
      const aValue = a[sortConfig.column as keyof FormData];
      const bValue = b[sortConfig.column as keyof FormData];
      
      if (aValue === bValue) return 0;
      
      const direction = sortConfig.direction === 'asc' ? 1 : -1;
      return aValue < bValue ? -1 * direction : 1 * direction;
    });
  };
  
  // Get paginated data
  const getPaginatedData = () => {
    const sorted = getSortedData();
    const startIndex = (pagination.page - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    return sorted.slice(startIndex, endIndex);
  };
  
  // Fetch data on mount and when filters change
  useEffect(() => {
    fetchCategories();
  }, []);
  
  useEffect(() => {
    fetchFormData();
  }, [filters, sortConfig.column, sortConfig.direction]);
  
  useEffect(() => {
    if (filters.category) {
      fetchCategoryColumns(filters.category);
    }
  }, [filters.category, categories]);
  
  return {
    formData,
    categories,
    selectedCategory,
    categoryColumns,
    filters,
    setFilters,
    pagination,
    setPagination,
    sortConfig,
    setSortConfig,
    loading,
    error,
    fetchFormData,
    fetchCategories,
    fetchCategoryColumns,
    handleFilterChange,
    handleSortChange,
    handlePageChange,
    handlePageSizeChange,
    handleExportToExcel,
    getSortedData,
    getPaginatedData,
    applyFilters
  };
};
