
import { useTableManagement } from "@/hooks/useTableManagement";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { CategoryList } from "@/components/tables/CategoryList";

const RegionTables = () => {
  const {
    filteredCategories,
    selectedCategory,
    editingColumn,
    deletingColumn,
    setSelectedCategory,
    handleAddCategory,
    handleAddColumn,
    handleUpdateColumn,
    handleDeleteColumn,
    getCategoryVisibilityText,
    setEditingColumn,
    setDeletingColumn
  } = useTableManagement();

  return (
    <AdminLayout title="Region Tables">
      <CategoryList
        categories={filteredCategories}
        selectedCategory={selectedCategory}
        editingColumn={editingColumn}
        deletingColumn={deletingColumn}
        onSelectCategory={setSelectedCategory}
        onAddCategory={handleAddCategory}
        onAddColumn={handleAddColumn}
        onUpdateColumn={handleUpdateColumn}
        onDeleteColumn={handleDeleteColumn}
        getCategoryVisibilityText={getCategoryVisibilityText}
        setEditingColumn={setEditingColumn}
        setDeletingColumn={setDeletingColumn}
      />
    </AdminLayout>
  );
};

export default RegionTables;
