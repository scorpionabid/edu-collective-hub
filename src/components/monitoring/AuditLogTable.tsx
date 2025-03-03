import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { AuditLogEntry } from '@/lib/monitoring/types';
import { Checkbox } from "@/components/ui/checkbox";
import { DownloadCloud, Eye, RefreshCw } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AuditLogTableProps {
  logs: AuditLogEntry[];
}

const AuditLogTable: React.FC<AuditLogTableProps> = ({ logs }) => {
  const [selectedLogs, setSelectedLogs] = useState<string[]>([]);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedLogDetails, setSelectedLogDetails] = useState<AuditLogEntry | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<'action' | 'table' | 'user' | 'timestamp'>('timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [actionFilter, setActionFilter] = useState<string>('');

  const getTimestamp = (log: AuditLogEntry) => {
    return log.timestamp || log.created_at || '';
  };

  const filteredLogs = logs.filter(log => {
    const term = searchTerm.toLowerCase();
    const action = log.action.toLowerCase();
    const table = (log.tableName || log.table_name || '').toLowerCase();
    const user = (log.userId || log.user_id || '').toLowerCase();
    
    const matchesSearch = term
      ? action.includes(term) || table.includes(term) || user.includes(term)
      : true;
    
    const matchesAction = actionFilter ? log.action === actionFilter : true;
    
    return matchesSearch && matchesAction;
  });

  const sortedLogs = [...filteredLogs].sort((a, b) => {
    const aValue = (log: AuditLogEntry) => {
      switch (sortColumn) {
        case 'action': return log.action;
        case 'table': return log.tableName || log.table_name || '';
        case 'user': return log.userId || log.user_id || '';
        case 'timestamp': return getTimestamp(log);
        default: return '';
      }
    };

    const aVal = aValue(a);
    const bVal = aValue(b);

    if (aVal < bVal) {
      return sortDirection === 'asc' ? -1 : 1;
    }
    if (aVal > bVal) {
      return sortDirection === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const toggleLogSelection = (logId: string, checked: boolean) => {
    setSelectedLogs(prev => {
      if (checked) {
        return [...prev, logId];
      } else {
        return prev.filter(id => id !== logId);
      }
    });
  };

  const toggleAllSelection = (checked: boolean) => {
    if (checked) {
      setSelectedLogs(filteredLogs.map(log => log.id as string));
    } else {
      setSelectedLogs([]);
    }
  };

  const openDetailsDialog = (log: AuditLogEntry) => {
    setSelectedLogDetails(log);
    setDetailsDialogOpen(true);
  };

  const closeDetailsDialog = () => {
    setDetailsDialogOpen(false);
    setSelectedLogDetails(null);
  };

  const handleDownload = () => {
    alert('Download functionality not implemented yet.');
  };

  const getActionVariant = (action: string) => {
    switch (action) {
      case 'create': return 'success';
      case 'update': return 'warning';
      case 'delete': return 'destructive';
      default: return 'default';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Audit Logs</CardTitle>
          <CardDescription>
            System activity and user actions
          </CardDescription>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <DownloadCloud className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button variant="outline" size="sm" onClick={() => alert('Refresh not implemented')}>
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col-reverse sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-2">
              <Label htmlFor="search">Search:</Label>
              <Input
                id="search"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-xs"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="action-filter">Filter by Action:</Label>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Actions</SelectItem>
                  {[...new Set(logs.map(log => log.action))].map(action => (
                    <SelectItem key={action} value={action}>{action}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedLogs.length === filteredLogs.length && filteredLogs.length > 0}
                      onCheckedChange={toggleAllSelection}
                    />
                  </TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Table</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead className="text-right">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No audit logs found.
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedLogs.includes(log.id as string)}
                          onCheckedChange={(checked) => toggleLogSelection(log.id as string, !!checked)}
                        />
                      </TableCell>
                      <TableCell>
                        <Badge variant={getActionVariant(log.action)}>
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell>{log.tableName || log.table_name}</TableCell>
                      <TableCell>{log.userId || log.user_id || 'N/A'}</TableCell>
                      <TableCell>{getTimestamp(log) ? format(new Date(getTimestamp(log)), 'MMM d, yyyy HH:mm:ss') : 'N/A'}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDetailsDialog(log)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>

      <Dialog open={detailsDialogOpen} onOpenChange={closeDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Audit Log Details</DialogTitle>
            <DialogDescription>
              Details for the selected audit log entry.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[400px] w-full">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="action" className="text-right">Action:</Label>
                <Input id="action" value={selectedLogDetails?.action || 'N/A'} readOnly className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="table" className="text-right">Table:</Label>
                <Input id="table" value={selectedLogDetails?.tableName || selectedLogDetails?.table_name || 'N/A'} readOnly className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="user" className="text-right">User ID:</Label>
                <Input id="user" value={selectedLogDetails?.userId || selectedLogDetails?.user_id || 'N/A'} readOnly className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="timestamp" className="text-right">Timestamp:</Label>
                <Input
                  id="timestamp"
                  value={getTimestamp(selectedLogDetails) ? format(new Date(getTimestamp(selectedLogDetails)), 'MMM d, yyyy HH:mm:ss') : 'N/A'}
                  readOnly
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="old-data" className="text-right mt-2">Old Data:</Label>
                <div className="col-span-3">
                  <pre className="rounded-md bg-muted p-4 font-mono text-sm">
                    {selectedLogDetails?.oldData ? JSON.stringify(selectedLogDetails.oldData, null, 2) : 'N/A'}
                  </pre>
                </div>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="new-data" className="text-right mt-2">New Data:</Label>
                <div className="col-span-3">
                  <pre className="rounded-md bg-muted p-4 font-mono text-sm">
                    {selectedLogDetails?.newData ? JSON.stringify(selectedLogDetails.newData, null, 2) : 'N/A'}
                  </pre>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="ip-address" className="text-right">IP Address:</Label>
                <Input id="ip-address" value={selectedLogDetails?.ipAddress || selectedLogDetails?.ip_address || 'N/A'} readOnly className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="user-agent" className="text-right">User Agent:</Label>
                <Input id="user-agent" value={selectedLogDetails?.userAgent || selectedLogDetails?.user_agent || 'N/A'} readOnly className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="component" className="text-right">Component:</Label>
                <Input id="component" value={selectedLogDetails?.component || 'N/A'} readOnly className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="duration" className="text-right">Duration (ms):</Label>
                <Input id="duration" value={selectedLogDetails?.durationMs?.toString() || selectedLogDetails?.duration_ms?.toString() || 'N/A'} readOnly className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="success" className="text-right">Success:</Label>
                <Input id="success" value={selectedLogDetails?.success ? 'Yes' : 'No'} readOnly className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="metadata" className="text-right mt-2">Metadata:</Label>
                <div className="col-span-3">
                  <pre className="rounded-md bg-muted p-4 font-mono text-sm">
                    {selectedLogDetails?.metadata ? JSON.stringify(selectedLogDetails.metadata, null, 2) : 'N/A'}
                  </pre>
                </div>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AuditLogTable;
