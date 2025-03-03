
// Fix props mismatch for ReportTable component
<ReportTable 
  data={filteredData} 
  columns={columns}
  filters={filters}
  onFilterChange={(columnName, value) => {
    setFilters(prev => ({ ...prev, [columnName]: value }));
  }}
  sortConfig={sortConfig}
  onSortChange={(columnName) => {
    setSortConfig(prev => ({
      key: columnName,
      direction: prev.key === columnName && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }}
/>
