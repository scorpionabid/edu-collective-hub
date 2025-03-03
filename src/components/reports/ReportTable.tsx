
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Filter, SortAsc, SortDesc } from "lucide-react";
import { Column } from "@/lib/api/types";

interface ReportTableProps {
  columns: Column[];
  data: any[];
  filters: { [key: string]: string };
  sortConfig: { key: string; direction: 'asc' | 'desc' } | null;
  onFilterChange: (columnName: string, value: string) => void;
  handleSort: (columnName: string) => void;
  filteredAndSortedData: () => any[];
}

export const ReportTable = ({
  columns,
  data,
  filters,
  sortConfig,
  onFilterChange,
  handleSort,
  filteredAndSortedData,
}: ReportTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead key={column.id}>
              <div className="flex items-center gap-2">
                {column.name}
                <div className="flex flex-col">
                  <button
                    onClick={() => handleSort(column.name)}
                    className="hover:text-primary"
                  >
                    {sortConfig?.key === column.name ? (
                      sortConfig.direction === "asc" ? (
                        <SortAsc className="w-4 h-4" />
                      ) : (
                        <SortDesc className="w-4 h-4" />
                      )
                    ) : (
                      <Filter className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Filter className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <div className="p-2">
                      <Input
                        placeholder="Filter..."
                        value={filters[column.name] || ""}
                        onChange={(e) =>
                          onFilterChange(column.name, e.target.value)
                        }
                      />
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length > 0 ? (
          data.map((row, index) => (
            <TableRow key={index}>
              {columns.map((column) => (
                <TableCell key={column.id}>
                  {row.data && row.data[column.name] ? row.data[column.name] : ''}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length} className="text-center py-4">
              No data available
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
