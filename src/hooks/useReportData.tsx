
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { Category, Column } from '@/lib/api/types';
import { toast } from 'sonner';

export function useReportData() {
  const { user } = useAuth();
  
  // Filter states
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Data states
  const [regions, setRegions] = useState<{ id: string; name: string }[]>([]);
  const [sectors, setSectors] = useState<{ id: string; name: string }[]>([]);
  const [schools, setSchools] = useState<{ id: string; name: string }[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [data, setData] = useState<any[]>([]);
  
  // Filtered states
  const [filteredSectors, setFilteredSectors] = useState<{ id: string; name: string }[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<{ id: string; name: string }[]>([]);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: '', direction: 'asc' });
  
  // Load initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        // Mock data for development - in production these would be API calls
        const regionsData = [
          { id: '1', name: 'Bakı' },
          { id: '2', name: 'Sumqayıt' },
          { id: '3', name: 'Gəncə' },
        ];
        
        const sectorsData = [
          { id: '1', name: 'Sektor 1', regionId: '1' },
          { id: '2', name: 'Sektor 2', regionId: '1' },
          { id: '3', name: 'Sektor 3', regionId: '2' },
        ];
        
        const schoolsData = [
          { id: '1', name: 'Məktəb 1', sectorId: '1' },
          { id: '2', name: 'Məktəb 2', sectorId: '1' },
          { id: '3', name: 'Məktəb 3', sectorId: '2' },
        ];
        
        // Set initial data
        setRegions(regionsData);
        setSectors(sectorsData);
        setSchools(schoolsData);
        
        // Load categories from API
        const categoriesData = await api.categories.getAll();
        setCategories(categoriesData);
        
        // Pre-select based on user role
        if (user) {
          if (user.regionId) {
            setSelectedRegion(user.regionId);
            const userSectors = sectorsData.filter(s => s.regionId === user.regionId);
            setFilteredSectors(userSectors);
          }
          
          if (user.sectorId) {
            setSelectedSector(user.sectorId);
            const userSchools = schoolsData.filter(s => s.sectorId === user.sectorId);
            setFilteredSchools(userSchools);
          }
          
          if (user.schoolId) {
            setSelectedSchool(user.schoolId);
          }
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
        toast.error('Failed to load initial data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, [user]);
  
  // Update filtered sectors when region changes
  useEffect(() => {
    if (selectedRegion) {
      const filtered = sectors.filter(sector => sector.regionId === selectedRegion);
      setFilteredSectors(filtered);
    } else {
      setFilteredSectors([]);
    }
  }, [selectedRegion, sectors]);
  
  // Update filtered schools when sector changes
  useEffect(() => {
    if (selectedSector) {
      const filtered = schools.filter(school => school.sectorId === selectedSector);
      setFilteredSchools(filtered);
    } else {
      setFilteredSchools([]);
    }
  }, [selectedSector, schools]);
  
  // Fetch category columns and data when category changes
  const fetchCategoryColumns = async (categoryId: string) => {
    if (!categoryId) return;
    
    try {
      setLoading(true);
      
      // Get the category details which includes columns
      const category = await api.categories.getById(categoryId);
      
      if (category && Array.isArray(category.columns)) {
        setColumns(category.columns);
        
        // Fetch sample data for this category
        // In a real app, this would use selectedRegion, selectedSector, selectedSchool
        const formData = await api.formData.getAll();
        
        // Filter and transform the data
        const filteredData = formData
          .filter((item: any) => item.categoryId === categoryId)
          .map((item: any) => ({
            ...item.data,
            id: item.id,
            status: item.status || 'draft',
            submittedAt: item.submittedAt || '',
            schoolName: 'School ' + Math.floor(Math.random() * 100) // Mock data
          }));
        
        setData(filteredData);
      }
    } catch (error) {
      console.error('Error fetching category data:', error);
      toast.error('Failed to load category data');
    } finally {
      setLoading(false);
    }
  };
  
  // Function to update filtered sectors
  const updateFilteredSectors = (regionId: string) => {
    if (regionId) {
      const filtered = sectors.filter(sector => sector.regionId === regionId);
      setFilteredSectors(filtered);
    } else {
      setFilteredSectors([]);
    }
  };

  // Handle export to Excel
  const handleExportToExcel = () => {
    console.log('Exporting to Excel:', { columns, data });
    if (columns.length === 0 || data.length === 0) {
      toast.error('No data to export');
      return;
    }
    
    try {
      // In a real app, this would use a proper Excel export library
      // For now, it's just a placeholder
      toast.success('Export started. Your file will be ready shortly.');
    } catch (error) {
      toast.error('Failed to export data');
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
    fetchCategoryColumns,
    handleExportToExcel
  };
}
