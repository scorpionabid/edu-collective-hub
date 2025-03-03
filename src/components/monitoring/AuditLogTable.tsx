import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Eye,
  ArrowUpDown,
  ArrowDown,
  ArrowUp,
  Clock,
  FileJson
} from "lucide-react";
import { format } from 'date-fns';
import { AuditLogEntry } from '@/lib/monitoring/types';

interface AuditLogTableProps {
  logs: AuditLogEntry[];
}

const AuditLogTable: React.FC<AuditLogTableProps> = ({ logs }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<keyof AuditLogEntry>('timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'diff' | 'old' | 'new'>('diff');
  
  const itemsPerPage = 10;
  const totalPages = Math.ceil(logs.length / itemsPerPage);
  
  // Handle sorting
  const handleSort = (column: keyof AuditLogEntry) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };
  
  // Apply sorting and pagination
  const sortedLogs = [...logs].sort((a, b) => {
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];
    
    if (aValue === undefined || bValue === undefined) {
      return 0;
    }
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue);
    }
    
    const aNum = Number(aValue);
    const bNum = Number(bValue);
    
    if (!isNaN(aNum) && !isNaN(bNum)) {
      return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
    }
    
    return 0;
  });
  
  const paginatedLogs = sortedLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Handle view log details
  const handleViewLog = (log: AuditLogEntry) => {
    setSelectedLog(log);
    setIsDialogOpen(true);
  };
  
  // Get color by action type
  const getActionColor = (action: string) => {
    switch (action.toUpperCase()) {
      case 'INSERT':
        return 'bg-green-100 text-green-800';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Format JSON diff for display
  const formatJsonDiff = (oldData: any, newData: any) => {
    if (!oldData && !newData) return null;
    
    if (viewMode === 'old' && oldData) {
      return <pre className="text-xs overflow-auto max-h-96 p-4 bg-gray-50 rounded">{JSON.stringify(oldData, null, 2)}</pre>;
    }
    
    if (viewMode === 'new' && newData) {
      return <pre className="text-xs overflow-auto max-h-96 p-4 bg-gray-50 rounded">{JSON.stringify(newData, null, 2)}</pre>;
    }
    
    // Simple diff view
    if (oldData && newData) {
      const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);
      return (
        <div className="text-xs overflow-auto max-h-96 p-4 bg-gray-50 rounded">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left font-semibold p-1">Field</th>
                <th className="text-left font-semibold p-1">Old Value</th>
                <th className="text-left font-semibold p-1">New Value</th>
              </tr>
            </thead>
            <tbody>
              {Array.from(allKeys).map(key => {
                const oldVal = oldData[key];
                const newVal = newData[key];
                const isChanged = JSON.stringify(oldVal) !== JSON.stringify(newVal);
                
                return (
                  <tr key={key} className={isChanged ? "bg-yellow-50" : ""}>
                    <td className="p-1 border-t border-gray-200">{key}</td>
                    <td className={`p-1 border-t border-gray-200 ${isChanged ? "line-through text-red-600" : ""}`}>
                      {typeof oldVal === 'object' 
                        ? JSON.stringify(oldVal) 
                        : String(oldVal !== undefined ? oldVal : '')}
                    </td>
                    <td className={`p-1 border-t border-gray-200 ${isChanged ? "text-green-600" : ""}`}>
                      {typeof newVal === 'object' 
                        ? JSON.stringify(newVal) 
                        : String(newVal !== undefined ? newVal : '')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }
    
    // Only old data (DELETE)
    if (oldData) {
      return <pre className="text-xs overflow-auto max-h-96 p-4 bg-gray-50 rounded text-red-600">{JSON.stringify(oldData, null, 2)}</pre>;
    }
    
    // Only new data (INSERT)
    if (newData) {
      return <pre className="text-xs overflow-auto max-h-96 p-4 bg-gray-50 rounded text-green-600">{JSON.stringify(newData, null, 2)}</pre>;
    }
    
    return null;
  };
  
  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableCaption>Audit trail of system activities</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => handleSort('action')} className="cursor-pointer w-[100px]">
                <div className="flex items-center">
                  Action
                  {sortColumn === 'action' && (
                    sortDirection === 'asc' ? <ArrowUp className="ml-1 h-4 w-4" /> : <ArrowDown className="ml-1 h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead onClick={() => handleSort('tableName')} className="cursor-pointer">
                <div className="flex items-center">
                  Table
                  {sortColumn === 'tableName' && (
                    sortDirection === 'asc' ? <ArrowUp className="ml-1 h-4 w-4" /> : <ArrowDown className="ml-1 h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead>Record ID</TableHead>
              <TableHead onClick={() => handleSort('timestamp')} className="cursor-pointer">
                <div className="flex items-center whitespace-nowrap">
                  <Clock className="mr-1 h-4 w-4" /> Timestamp
                  {sortColumn === 'timestamp' && (
                    sortDirection === 'asc' ? <ArrowUp className="ml-1 h-4 w-4" /> : <ArrowDown className="ml-1 h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead>User</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No audit logs found
                </TableCell>
              </TableRow>
            ) : (
              paginatedLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <Badge variant="outline" className={getActionColor(log.action)}>
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell>{log.tableName}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {log.recordId ? log.recordId.substring(0, 8) + '...' : '-'}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {log.timestamp ? format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss') : 'N/A'}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {log.userId ? log.userId.substring(0, 8) + '...' : 'System'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleViewLog(log)}
                      disabled={!log.oldData && !log.newData}
                    >
                      <Eye className="h-4 w-4 mr-1" /> View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex justify-end items-center mt-4 space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
      
      {/* Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Audit Log Detail</DialogTitle>
            <DialogDescription>
              {selectedLog?.action} operation on table <span className="font-semibold">{selectedLog?.tableName}</span>{" "}
              at {selectedLog?.timestamp ? format(new Date(selectedLog.timestamp), 'yyyy-MM-dd HH:mm:ss') : '-'}
            </DialogDescription>
          </DialogHeader>
          
          {/* View mode selector */}
          {(selectedLog?.oldData || selectedLog?.newData) && (
            <div className="flex gap-2 mb-4">
              <Button 
                variant={viewMode === 'diff' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setViewMode('diff')}
              >
                <FileJson className="h-4 w-4 mr-1" /> Diff View
              </Button>
              {selectedLog?.oldData && (
                <Button 
                  variant={viewMode === 'old' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setViewMode('old')}
                >
                  <FileJson className="h-4 w-4 mr-1" /> Old Data
                </Button>
              )}
              {selectedLog?.newData && (
                <Button 
                  variant={viewMode === 'new' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setViewMode('new')}
                >
                  <FileJson className="h-4 w-4 mr-1" /> New Data
                </Button>
              )}
            </div>
          )}
          
          {/* Data diff */}
          {selectedLog && formatJsonDiff(selectedLog.oldData, selectedLog.newData)}
          
          {/* Metadata */}
          {selectedLog?.metadata && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold mb-2">Additional Metadata</h3>
              <pre className="text-xs overflow-auto max-h-40 p-4 bg-gray-50 rounded">
                {JSON.stringify(selectedLog.metadata, null, 2)}
              </pre>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AuditLogTable;
