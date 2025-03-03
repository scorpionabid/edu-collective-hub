
import React, { useState } from 'react';
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
import { Button } from "@/components/ui/button";
import { AlertCircle, AlertTriangle, Info, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { format } from 'date-fns';
import { ErrorLog } from '@/lib/monitoring/types';

interface ErrorLogsTableProps {
  errors: ErrorLog[];
  onResolveError?: (id: string, notes: string) => void;
}

const ErrorLogsTable: React.FC<ErrorLogsTableProps> = ({ errors, onResolveError }) => {
  const [selectedError, setSelectedError] = useState<ErrorLog | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const handleResolveError = () => {
    if (selectedError && onResolveError) {
      onResolveError(selectedError.id!, resolutionNotes);
      setSelectedError(null);
      setResolutionNotes('');
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'high':
        return <Badge variant="destructive" className="bg-amber-500">High</Badge>;
      case 'medium':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-500">Medium</Badge>;
      case 'low':
        return <Badge variant="outline" className="border-blue-500 text-blue-500">Low</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Error Logs</CardTitle>
          <CardDescription>Recent application errors and exceptions</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Severity</TableHead>
                  <TableHead className="w-[200px]">Time</TableHead>
                  <TableHead className="w-[300px]">Error</TableHead>
                  <TableHead className="w-[150px]">Component</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {errors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No errors recorded
                    </TableCell>
                  </TableRow>
                ) : (
                  errors.map((error) => (
                    <TableRow key={error.id} className={error.resolved ? 'opacity-60' : ''}>
                      <TableCell className="flex items-center">
                        {getSeverityIcon(error.severity)}
                        <span className="sr-only">{error.severity}</span>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {error.timestamp ? format(new Date(error.timestamp), 'yyyy-MM-dd HH:mm:ss') : 'Unknown'}
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="truncate max-w-[300px]" title={error.errorMessage}>
                          {error.errorMessage}
                        </div>
                      </TableCell>
                      <TableCell>{error.component || 'Unknown'}</TableCell>
                      <TableCell>
                        {error.resolved ? (
                          <Badge variant="outline" className="bg-green-50 border-green-500 text-green-700">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Resolved
                          </Badge>
                        ) : (
                          getSeverityBadge(error.severity)
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setSelectedError(error)}
                            disabled={error.resolved}
                          >
                            Details
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Error details dialog */}
      <Dialog open={!!selectedError} onOpenChange={(open) => !open && setSelectedError(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              {selectedError && getSeverityIcon(selectedError.severity)}
              <span className="ml-2">Error Details</span>
            </DialogTitle>
            <DialogDescription>
              {selectedError && format(new Date(selectedError.timestamp!), 'PPpp')}
            </DialogDescription>
          </DialogHeader>
          
          {selectedError && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">Error Message</h3>
                <p className="mt-1 text-sm">{selectedError.errorMessage}</p>
              </div>

              {selectedError.errorStack && (
                <div>
                  <h3 className="text-sm font-medium">Stack Trace</h3>
                  <pre className="mt-1 text-xs bg-slate-50 p-3 rounded overflow-auto max-h-[200px]">
                    {selectedError.errorStack}
                  </pre>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">Component</h3>
                  <p className="mt-1 text-sm">{selectedError.component || 'Unknown'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Page</h3>
                  <p className="mt-1 text-sm">{selectedError.pagePath || 'Unknown'}</p>
                </div>
              </div>

              {selectedError.errorContext && (
                <div>
                  <h3 className="text-sm font-medium">Context</h3>
                  <pre className="mt-1 text-xs bg-slate-50 p-3 rounded overflow-auto max-h-[150px]">
                    {JSON.stringify(selectedError.errorContext, null, 2)}
                  </pre>
                </div>
              )}

              {!selectedError.resolved && onResolveError && (
                <div>
                  <h3 className="text-sm font-medium">Resolution Notes</h3>
                  <Textarea
                    className="mt-1"
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Enter notes about how this error was resolved..."
                    rows={3}
                  />
                  <Button 
                    onClick={handleResolveError} 
                    className="mt-2"
                    disabled={!resolutionNotes.trim()}
                  >
                    Mark as Resolved
                  </Button>
                </div>
              )}

              {selectedError.resolved && selectedError.resolutionNotes && (
                <div>
                  <h3 className="text-sm font-medium">Resolution Notes</h3>
                  <div className="mt-1 text-sm p-3 bg-green-50 rounded border border-green-200">
                    {selectedError.resolutionNotes}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ErrorLogsTable;
