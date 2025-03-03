
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Filter, SortAsc, SortDesc } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Column } from "@/lib/api/types";

export interface ReportTableProps {
  columns: Column[];
  data: any[];
  filters: { [key: string]: string };
  sortConfig: { key: string; direction: 'asc' | 'desc' } | null;
  handleFilter: (columnName: string, value: string) => void;
  handleSort: (columnName: string) => void;
  filteredAndSortedData: () => any[];
}

export const ReportTable: React.FC<ReportTableProps> = ({
  columns,
  data,
  filters,
  sortConfig,
  handleFilter,
  handleSort,
  filteredAndSortedData,
}) => {
  return (
    <div className="overflow-x-auto mt-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>School</TableHead>
            <TableHead>Status</TableHead>
            {columns.map((column) => (
              <TableHead key={column.id}>
                <div className="flex items-center gap-2">
                  {column.name}
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
                            handleFilter(column.name, e.target.value)
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
          {filteredAndSortedData().length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length + 2}
                className="text-center py-8"
              >
                No data available
              </TableCell>
            </TableRow>
          ) : (
            filteredAndSortedData().map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.schoolName || 'Unknown School'}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      row.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : row.status === "submitted"
                        ? "bg-blue-100 text-blue-800"
                        : row.status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {row.status === "approved"
                      ? "Approved"
                      : row.status === "submitted"
                      ? "Submitted"
                      : row.status === "rejected"
                      ? "Rejected"
                      : "Draft"}
                  </span>
                </TableCell>
                {columns.map((column) => (
                  <TableCell key={column.id}>
                    {row.data && row.data[column.name] !== undefined
                      ? row.data[column.name]
                      : "-"}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ReportTable;
