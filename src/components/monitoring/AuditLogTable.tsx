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
import { AuditLogEntry } from "@/lib/monitoring/types";
import { formatDistanceToNow } from "date-fns";

interface AuditLogTableProps {
  data: AuditLogEntry[];
}

export function AuditLogTable({ data }: AuditLogTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "timestamp", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const columns: ColumnDef<AuditLogEntry>[] = [
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => {
        const action = row.getValue("action") as string;
        let variant: "default" | "destructive" | "outline" | "secondary" = "default";
        
        switch(action.toLowerCase()) {
          case "insert":
            variant = "default";
            break;
          case "update":
            variant = "secondary";
            break;
          case "delete":
            variant = "destructive";
            break;
          default:
            variant = "outline";
        }
        
        return <Badge variant={variant}>{action}</Badge>;
      },
    },
    {
      accessorKey: "tableName",
      header: "Table",
      cell: ({ row }) => <span className="font-medium">{row.getValue("tableName")}</span>,
    },
    {
      accessorKey: "recordId",
      header: "Record ID",
      cell: ({ row }) => {
        const id = row.getValue("recordId") as string;
        return id ? <code className="bg-muted p-1 rounded text-xs">{id}</code> : <span className="text-gray-400">-</span>;
      },
    },
    {
      accessorKey: "userId",
      header: "User",
      cell: ({ row }) => {
        const userId = row.getValue("userId") as string;
        return userId ? <code className="bg-muted p-1 rounded text-xs">{userId.substring(0, 8)}...</code> : "System";
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
      accessorKey: "success",
      header: "Status",
      cell: ({ row }) => {
        const success = row.getValue("success") as boolean;
        return success ? 
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Success</Badge> : 
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Failed</Badge>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const entry = row.original;
        
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              console.log("Audit log details:", entry);
              alert(`Changes: ${JSON.stringify({
                old: entry.oldData,
                new: entry.newData,
              }, null, 2)}`);
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
          placeholder="Filter tables..."
          value={(table.getColumn("tableName")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("tableName")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        
        <Input
          placeholder="Filter actions..."
          value={(table.getColumn("action")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("action")?.setFilterValue(event.target.value)
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
                  No audit logs found
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
