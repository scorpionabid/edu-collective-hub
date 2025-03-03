
import React from "react";
import { useReportData } from "@/hooks/useReportData";
import { ReportTable } from "@/components/reports/ReportTable";
import { ReportFilters } from "@/components/reports/ReportFilters";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileDown } from "lucide-react";

const Reports = () => {
  const {
    selectedRegion,
    setSelectedRegion,
    selectedSector,
    setSelectedSector,
    selectedCategory,
    setSelectedCategory,
    filteredSectors,
    columns,
    data,
    setData,
    filters,
    setFilters,
    sortConfig,
    setSortConfig,
    updateFilteredSectors,
    fetchCategoryColumns,
    handleFilter,
    handleSort,
    filteredAndSortedData,
    handleExportToExcel
  } = useReportData();

  // Component content
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Hesabatlar</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Hesabat Filtrlər</CardTitle>
        </CardHeader>
        <CardContent>
          <ReportFilters 
            selectedRegion={selectedRegion}
            setSelectedRegion={setSelectedRegion}
            selectedSector={selectedSector}
            setSelectedSector={setSelectedSector}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            filteredSectors={filteredSectors}
            updateFilteredSectors={updateFilteredSectors}
            fetchCategoryColumns={fetchCategoryColumns}
          />
        </CardContent>
      </Card>
      
      {columns.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Hesabat Nəticələri</CardTitle>
            <Button variant="outline" onClick={handleExportToExcel}>
              <FileDown className="mr-2 h-4 w-4" />
              Excel-ə İxrac Et
            </Button>
          </CardHeader>
          <CardContent>
            <ReportTable
              columns={columns}
              data={filteredAndSortedData()}
              filters={filters}
              onFilterChange={handleFilter}
              sortConfig={sortConfig}
              handleSort={handleSort}
              filteredAndSortedData={filteredAndSortedData}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Reports;
