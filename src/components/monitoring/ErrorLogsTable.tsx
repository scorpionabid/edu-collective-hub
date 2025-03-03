
import { useState } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ErrorLog } from "@/lib/monitoring/types";
import { formatDistanceToNow } from "date-fns";

interface ErrorLogsTableProps {
  data: ErrorLog[];
}

export function ErrorLogsTable({ data }: ErrorLogsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "timestamp", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const columns: ColumnDef<ErrorLog>[] = [
    {
      accessorKey: "errorMessage",
      header: "Error",
      cell: ({ row }) => (
        <div className="max-w-md">
          <div className="font-medium">{row.getValue("errorMessage")}</div>
          <div className="text-xs text-muted-foreground truncate">
            {row.original.errorStack?.split('\n')[0]}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "component",
      header: "Component",
      cell: ({ row }) => <span className="whitespace-nowrap">{row.getValue("component") || "-"}</span>,
    },
    {
      accessorKey: "pagePath",
      header: "Page",
      cell: ({ row }) => <span className="whitespace-nowrap">{row.getValue("pagePath") || "-"}</span>,
    },
    {
      accessorKey: "severity",
      header: "Severity",
      cell: ({ row }) => {
        const severity = row.getValue("severity") as string;
        let variant: "default" | "destructive" | "outline" | "secondary" = "default";
        
        switch(severity) {
          case "low":
            variant = "outline";
            break;
          case "medium":
            variant = "secondary";
            break;
          case "high":
            variant = "default";
            break;
          case "critical":
            variant = "destructive";
            break;
        }
        
        return <Badge variant={variant}>{severity}</Badge>;
      },
    },
    {
      accessorKey: "timestamp",
      header: "Time",
      cell: ({ row }) => {
        const timestamp = row.getValue("timestamp") as string;
        return (
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(timestamp), { addSuffix: true })}</span>
            <span className="text-xs text-muted-foreground">{new Date(timestamp).toLocaleString()}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "resolved",
      header: "Status",
      cell: ({ row }) => {
        const resolved = row.getValue("resolved") as boolean;
        return resolved ? 
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Resolved</Badge> : 
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Open</Badge>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const error = row.original;
        
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              console.log("Error details:", error);
              alert(`Error Details:\n\nMessage: ${error.errorMessage}\n\nStack: ${error.errorStack}\n\nContext: ${JSON.stringify(error.errorContext, null, 2)}`);
            }}
          >
            Details
          </Button>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Filter by error message..."
          value={(table.getColumn("errorMessage")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("errorMessage")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        
        <Input
          placeholder="Filter by component..."
          value={(table.getColumn("component")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("component")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No error logs found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

