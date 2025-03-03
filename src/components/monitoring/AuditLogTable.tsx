
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { 
  ArrowDownUp, 
  Check, 
  Info, 
  Search, 
  X 
} from "lucide-react";
import { format } from 'date-fns';
import { Input } from "@/components/ui/input";
import { AuditLogEntry } from '@/lib/monitoring/types';

interface AuditLogTableProps {
  logs: AuditLogEntry[];
}

const AuditLogTable: React.FC<AuditLogTableProps> = ({ logs }) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [sortBy, setSortBy] = React.useState<keyof AuditLogEntry>('action');
  const [sortDesc, setSortDesc] = React.useState(false);

  const sortedAndFilteredLogs = React.useMemo(() => {
    let filtered = logs;
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = logs.filter(log => 
        log.action?.toLowerCase().includes(query) ||
        log.tableName?.toLowerCase().includes(query) ||
        log.component?.toLowerCase().includes(query) ||
        log.recordId?.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    return [...filtered].sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDesc 
          ? bValue.localeCompare(aValue) 
          : aValue.localeCompare(bValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDesc ? bValue - aValue : aValue - bValue;
      }
      
      if (aValue instanceof Date && bValue instanceof Date) {
        return sortDesc 
          ? bValue.getTime() - aValue.getTime() 
          : aValue.getTime() - bValue.getTime();
      }
      
      return 0;
    });
  }, [logs, searchQuery, sortBy, sortDesc]);

  const handleSort = (column: keyof AuditLogEntry) => {
    if (sortBy === column) {
      setSortDesc(!sortDesc);
    } else {
      setSortBy(column);
      setSortDesc(false);
    }
  };

  const renderSortIcon = (column: keyof AuditLogEntry) => {
    if (sortBy !== column) return <ArrowDownUp className="ml-1 h-3 w-3 opacity-30" />;
    return (
      <ArrowDownUp 
        className={`ml-1 h-3 w-3 ${sortDesc ? 'rotate-180' : ''}`} 
      />
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Audit Logs</CardTitle>
        <CardDescription>Recent user activities and system changes</CardDescription>
        <div className="mt-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-7 w-7 p-0"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Clear</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]" onClick={() => handleSort('action')}>
                  <div className="flex items-center cursor-pointer">
                    Action {renderSortIcon('action')}
                  </div>
                </TableHead>
                <TableHead className="w-[120px]" onClick={() => handleSort('tableName')}>
                  <div className="flex items-center cursor-pointer">
                    Table {renderSortIcon('tableName')}
                  </div>
                </TableHead>
                <TableHead onClick={() => handleSort('recordId')}>
                  <div className="flex items-center cursor-pointer">
                    Record ID {renderSortIcon('recordId')}
                  </div>
                </TableHead>
                <TableHead className="w-[180px]">User</TableHead>
                <TableHead className="w-[120px]">Status</TableHead>
                <TableHead className="w-[180px]" onClick={() => handleSort('timestamp')}>
                  <div className="flex items-center cursor-pointer">
                    Timestamp {renderSortIcon('timestamp')}
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAndFilteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No audit logs found
                  </TableCell>
                </TableRow>
              ) : (
                sortedAndFilteredLogs.map((log, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Badge variant={
                        log.action === 'INSERT' ? 'default' :
                        log.action === 'UPDATE' ? 'outline' :
                        log.action === 'DELETE' ? 'destructive' : 'secondary'
                      }>
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{log.tableName}</TableCell>
                    <TableCell className="font-mono text-xs truncate max-w-[200px]">
                      {log.recordId || 'N/A'}
                    </TableCell>
                    <TableCell>{log.userId || 'System'}</TableCell>
                    <TableCell>
                      {log.success !== undefined ? (
                        log.success ? (
                          <div className="flex items-center text-green-600">
                            <Check className="mr-1 h-4 w-4" />
                            Success
                          </div>
                        ) : (
                          <div className="flex items-center text-red-600">
                            <X className="mr-1 h-4 w-4" />
                            Failed
                          </div>
                        )
                      ) : (
                        <div className="flex items-center text-blue-600">
                          <Info className="mr-1 h-4 w-4" />
                          Info
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {log.timestamp ? format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss') : 'Unknown'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default AuditLogTable;
