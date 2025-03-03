
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface Column {
  id: number;
  name: string;
  type: string;
  options?: string[];
}

export interface Category {
  id: number;
  name: string;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
  columns: Column[];
}

export function useTableManagement() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingColumn, setEditingColumn] = useState<Column | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [deletingColumn, setDeletingColumn] = useState<Column | null>(null);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);

  // Load categories from localStorage on mount
  useEffect(() => {
    const storedCategories = localStorage.getItem('categories');
    if (storedCategories) {
      setCategories(JSON.parse(storedCategories));
    }
  }, []);

  // Save categories to localStorage when they change
  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);

  // Filter categories based on user role and entity
  useEffect(() => {
    if (!user) {
      setFilteredCategories([]);
      return;
    }

    // Filter based on the user's role and entity assignment
    const filtered = categories.filter(category => {
      if (user.role === 'regionadmin' && user.regionId) {
        return category.regionId === user.regionId ||
               !category.regionId && !category.sectorId && !category.schoolId;
      }
      return false;
    });

    setFilteredCategories(filtered);
  }, [categories, user]);

  const handleAddCategory = (data: { 
    name: string; 
    regionId?: string; 
    sectorId?: string; 
    schoolId?: string; 
  }) => {
    const newCategory: Category = {
      id: Date.now(),
      name: data.name,
      regionId: data.regionId || user?.regionId,
      sectorId: data.sectorId,
      schoolId: data.schoolId,
      columns: []
    };
    
    setCategories([...categories, newCategory]);
    toast.success("Kateqoriya uğurla əlavə edildi");
  };

  const handleAddColumn = (column: { name: string; type: string }) => {
    if (selectedCategory) {
      const updatedCategories = categories.map(category => {
        if (category.id === selectedCategory.id) {
          return {
            ...category,
            columns: [
              ...category.columns,
              { id: Date.now(), ...column }
            ]
          };
        }
        return category;
      });
      setCategories(updatedCategories);
      toast.success("Sütun uğurla əlavə edildi");
    }
  };

  const handleUpdateCategory = () => {
    if (editingCategory) {
      setCategories(categories.map(cat => 
        cat.id === editingCategory.id ? editingCategory : cat
      ));
      setEditingCategory(null);
      toast.success("Kateqoriya uğurla yeniləndi");
    }
  };

  const handleUpdateColumn = () => {
    if (selectedCategory && editingColumn) {
      const updatedCategories = categories.map(category => {
        if (category.id === selectedCategory.id) {
          return {
            ...category,
            columns: category.columns.map(col => 
              col.id === editingColumn.id ? editingColumn : col
            )
          };
        }
        return category;
      });
      setCategories(updatedCategories);
      setEditingColumn(null);
      toast.success("Sütun uğurla yeniləndi");
    }
  };

  const handleDeleteCategory = () => {
    if (deletingCategory) {
      setCategories(categories.filter(cat => cat.id !== deletingCategory.id));
      setDeletingCategory(null);
      toast.success("Kateqoriya uğurla silindi");
    }
  };

  const handleDeleteColumn = () => {
    if (selectedCategory && deletingColumn) {
      const updatedCategories = categories.map(category => {
        if (category.id === selectedCategory.id) {
          return {
            ...category,
            columns: category.columns.filter(col => col.id !== deletingColumn.id)
          };
        }
        return category;
      });
      setCategories(updatedCategories);
      setDeletingColumn(null);
      toast.success("Sütun uğurla silindi");
    }
  };

  const getCategoryVisibilityText = (category: Category) => {
    if (category.schoolId) {
      return "Məktəb səviyyəsi";
    } else if (category.sectorId) {
      return "Sektor səviyyəsi";
    } else if (category.regionId) {
      return "Region səviyyəsi";
    } else {
      return "Bütün səviyyələr";
    }
  };

  return {
    categories,
    filteredCategories,
    selectedCategory,
    editingCategory,
    editingColumn,
    deletingCategory,
    deletingColumn,
    setSelectedCategory,
    setEditingCategory,
    setEditingColumn,
    setDeletingCategory,
    setDeletingColumn,
    handleAddCategory,
    handleAddColumn,
    handleUpdateCategory,
    handleUpdateColumn,
    handleDeleteCategory,
    handleDeleteColumn,
    getCategoryVisibilityText
  };
}
