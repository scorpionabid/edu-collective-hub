
import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DataPaginationProps {
  currentPage: number;
  pageCount: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: number[];
  showPageSizeSelector?: boolean;
  showPageNumbers?: boolean;
  showInfo?: boolean;
  className?: string;
}

export function DataPagination({
  currentPage,
  pageCount,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  showPageSizeSelector = true,
  showPageNumbers = true,
  showInfo = true,
  className = ''
}: DataPaginationProps) {
  // Calculate the start and end items displayed
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(start + pageSize - 1, total);
  
  // Function to generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (pageCount <= maxVisiblePages) {
      // Show all pages if there are less than max visible
      for (let i = 1; i <= pageCount; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      // Calculate middle pages
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(pageCount - 1, currentPage + 1);
      
      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pages.push('ellipsis-start');
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (endPage < pageCount - 1) {
        pages.push('ellipsis-end');
      }
      
      // Always show last page
      pages.push(pageCount);
    }
    
    return pages;
  };
  
  return (
    <div className={`flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center space-y-2 space-y-reverse sm:space-y-0 ${className}`}>
      {/* Info and page size selector */}
      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
        {showInfo && total > 0 && (
          <p className="text-sm text-muted-foreground">
            Showing {start} to {end} of {total} entries
          </p>
        )}
        
        {showPageSizeSelector && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Show</span>
            <Select
              value={String(pageSize)}
              onValueChange={(value) => onPageSizeChange(Number(value))}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={pageSize} />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">entries</span>
          </div>
        )}
      </div>
      
      {/* Pagination buttons */}
      <div className="flex items-center justify-between sm:justify-end space-x-1">
        {/* First page button */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
        >
          <ChevronsLeft className="h-4 w-4" />
          <span className="sr-only">First Page</span>
        </Button>
        
        {/* Previous page button */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous Page</span>
        </Button>
        
        {/* Page numbers */}
        {showPageNumbers &&
          getPageNumbers().map((pageNumber, index) => {
            if (pageNumber === 'ellipsis-start' || pageNumber === 'ellipsis-end') {
              return (
                <Button
                  key={`${pageNumber}-${index}`}
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled
                >
                  <span>...</span>
                </Button>
              );
            }
            
            return (
              <Button
                key={pageNumber}
                variant={currentPage === pageNumber ? "default" : "outline"}
                size="icon"
                className="h-8 w-8"
                onClick={() => onPageChange(pageNumber as number)}
              >
                {pageNumber}
              </Button>
            );
          })}
        
        {/* Next page button */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === pageCount || pageCount === 0}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next Page</span>
        </Button>
        
        {/* Last page button */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(pageCount)}
          disabled={currentPage === pageCount || pageCount === 0}
        >
          <ChevronsRight className="h-4 w-4" />
          <span className="sr-only">Last Page</span>
        </Button>
      </div>
    </div>
  );
}
