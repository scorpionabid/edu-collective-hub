
import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { FormData, Category, Column, PaginatedResponse } from '@/lib/api/types';
import { usePaginatedData } from './usePaginatedData';

interface ReportFilters {
  categoryId?: string;
  schoolId?: string;
  regionId?: string;
  sectorId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  [key: string]: any;
}

export const useReportData = (initialFilters: ReportFilters = {}) => {
  const [filters, setFilters] = useState<ReportFilters>(initialFilters);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryColumns, setCategoryColumns] = useState<Column[]>([]);
  const [formData, setFormData] = useState<FormData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch form data based on filters
  const fetchReportData = usePaginatedData({
    queryKey: ['report-data', filters],
    fetchFn: async ({ pagination, sort }) => {
      try {
        setIsLoading(true);
        let result: FormData[] = [];
        
        // Fetch data based on filters
        if (filters.categoryId) {
          result = await api.formData.getAllByCategory(filters.categoryId);
          
          // Apply additional filters
          if (filters.schoolId) {
            result = result.filter(item => item.schoolId === filters.schoolId);
          }
          
          if (filters.status) {
            result = result.filter(item => item.status === filters.status);
          }
          
          // Apply date filters if provided
          if (filters.startDate) {
            const startDate = new Date(filters.startDate);
            result = result.filter(item => new Date(item.createdAt) >= startDate);
          }
          
          if (filters.endDate) {
            const endDate = new Date(filters.endDate);
            result = result.filter(item => new Date(item.createdAt) <= endDate);
          }
        } else if (filters.regionId) {
          // Fetch schools in this region
          const schools = await api.schools.getByRegionId(filters.regionId);
          
          // Fetch data for all schools
          let allFormData: FormData[] = [];
          for (const school of schools) {
            const schoolData = await api.formData.getAllFormData();
            const filteredData = schoolData.filter(item => item.schoolId === school.id);
            allFormData = [...allFormData, ...filteredData];
          }
          
          result = allFormData;
        }
        
        // Manual pagination
        const totalCount = result.length;
        const pageSize = pagination.pageSize;
        const start = (pagination.page - 1) * pageSize;
        const end = start + pageSize;
        const paginatedData = result.slice(start, end);
        
        // Convert to PaginatedResponse format
        const response: PaginatedResponse<FormData> = {
          data: paginatedData,
          metadata: {
            total: totalCount,
            page: pagination.page,
            pageSize,
            pageCount: Math.ceil(totalCount / pageSize)
          }
        };
        
        setFormData(result);
        return response;
      } catch (error: any) {
        console.error('Error fetching report data:', error);
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    initialPagination: {
      page: 1,
      pageSize: 10
    },
    initialSort: {
      column: 'createdAt',
      direction: 'desc'
    }
  });

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await api.categories.getAll();
      setCategories(data);
      return data;
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      setError(error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch columns for a category
  const fetchCategoryColumns = useCallback(async (categoryId: string) => {
    try {
      setIsLoading(true);
      const data = await api.categories.getCategoryColumns(categoryId);
      setCategoryColumns(data);
      return data;
    } catch (error: any) {
      console.error('Error fetching category columns:', error);
      setError(error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Extract column values from form data
  const extractColumnValues = useCallback((columnName: string): string[] => {
    const values = new Set<string>();
    
    formData.forEach(item => {
      if (item.data && item.data[columnName]) {
        values.add(String(item.data[columnName]));
      }
    });
    
    return Array.from(values);
  }, [formData]);

  // Initialize
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Update selected category
  useEffect(() => {
    if (filters.categoryId && categories.length > 0) {
      const category = categories.find(cat => cat.id === filters.categoryId);
      setSelectedCategory(category || null);
      
      if (category) {
        fetchCategoryColumns(category.id);
      }
    } else {
      setSelectedCategory(null);
      setCategoryColumns([]);
    }
  }, [filters.categoryId, categories, fetchCategoryColumns]);

  return {
    ...fetchReportData,
    formData,
    categories,
    selectedCategory,
    categoryColumns,
    filters,
    setFilters,
    isLoading,
    error,
    fetchCategories,
    fetchCategoryColumns,
    extractColumnValues
  };
};
