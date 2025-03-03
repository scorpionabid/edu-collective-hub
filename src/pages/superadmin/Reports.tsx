
import { useEffect } from "react";
import { useReportData } from "@/hooks/useReportData";
import { ReportFilters } from "@/components/reports/ReportFilters";
import { ReportTable } from "@/components/reports/ReportTable";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { exportToExcel } from "@/utils/excelExport";
import { PermissionGuard } from "@/components/shared/PermissionGuard";
import { AccessDenied } from "@/components/shared/AccessDenied";

const Reports = () => {
  const reportData = useReportData();
  
  const {
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
    fetchCategoryColumns
  } = reportData;

  const handleFilter = (columnName: string, value: string) => {
    setFilters({ ...filters, [columnName]: value });
  };

  const handleSort = (columnName: string) => {
    setSortConfig(prev => ({
      key: columnName,
      direction: prev.key === columnName && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const filteredAndSortedData = () => {
    // Filter data based on the filters
    let filteredData = [...data];
    Object.keys(filters).forEach(column => {
      const value = filters[column].toLowerCase();
      if (value) {
        filteredData = filteredData.filter(row => {
          if (row[column] === null || row[column] === undefined) return false;
          return String(row[column]).toLowerCase().includes(value);
        });
      }
    });

    // Sort data based on the sortConfig
    if (sortConfig.key) {
      filteredData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filteredData;
  };

  const handleExportToExcel = () => {
    exportToExcel(filteredAndSortedData(), columns, 'report_data');
  };

  useEffect(() => {
    if (selectedCategory) {
      fetchCategoryColumns(selectedCategory);
    }
  }, [selectedCategory]);

  return (
    <div className="container mx-auto py-8">
      <PermissionGuard 
        action="access_reports"
        fallback={<AccessDenied message="Bu hesabatları görmək üçün icazəniz yoxdur" />}
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Hesabatlar</h1>
          <Button onClick={handleExportToExcel} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Excel-ə ixrac et
          </Button>
        </div>

        <ReportFilters
          selectedRegion={selectedRegion}
          setSelectedRegion={setSelectedRegion}
          selectedSector={selectedSector}
          setSelectedSector={setSelectedSector}
          selectedSchool={selectedSchool}
          setSelectedSchool={setSelectedSchool}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          regions={regions}
          filteredSectors={filteredSectors}
          filteredSchools={filteredSchools}
          categories={categories}
          fetchCategoryColumns={fetchCategoryColumns}
          updateFilteredSectors={(region) => {
            // This is where you'd implement the logic to update sectors based on region
            console.log("Updating sectors for region:", region);
          }}
        />
        
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <ReportTable 
            columns={columns} 
            data={data}
            filters={filters}
            handleFilter={handleFilter}
            sortConfig={sortConfig}
            handleSort={handleSort}
            filteredAndSortedData={filteredAndSortedData}
          />
        )}
      </PermissionGuard>
    </div>
  );
};

export default Reports;
