
import React, { useState, useEffect } from 'react';
import { FileDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { exportToExcel } from '@/utils/enhancedExcelExport';
import { Column } from '@/lib/api/types';

interface ExcelExportButtonProps {
  data: any[];
  columns: Column[] | string[];
  fileName: string;
  isLoading?: boolean;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  onExportStart?: () => void;
  onExportComplete?: () => void;
}

export function ExcelExportButton({
  data,
  columns,
  fileName,
  isLoading = false,
  variant = 'default',
  size = 'default',
  className = '',
  onExportStart,
  onExportComplete
}: ExcelExportButtonProps) {
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [jobId, setJobId] = useState<string | null>(null);
  
  // Listen for export job status updates
  useEffect(() => {
    if (!jobId) return;
    
    const channel = supabase
      .channel(`export-job-${jobId}`)
      .on('postgres_changes', 
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'export_jobs',
          filter: `id=eq.${jobId}`
        }, 
        (payload) => {
          const status = payload.new as any;
          
          if (status.status === 'processing') {
            setProgress(status.progress);
          } else if (status.status === 'complete') {
            setExporting(false);
            setProgress(100);
            
            if (onExportComplete) {
              onExportComplete();
            }
            
            // If there's a download URL, open it
            if (status.download_url) {
              window.location.href = status.download_url;
            }
          } else if (status.status === 'error') {
            setExporting(false);
            toast.error(`Export failed: ${status.errors?.[0]?.message || 'Unknown error'}`);
          }
        })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [jobId, onExportComplete]);
  
  const handleExport = async () => {
    if (exporting || isLoading || !data.length) return;
    
    try {
      setExporting(true);
      
      if (onExportStart) {
        onExportStart();
      }
      
      const result = await exportToExcel(data, columns, fileName);
      
      if (result.jobId) {
        setJobId(result.jobId);
        toast.success('Export started. You will be notified when it completes.');
      } else if (result.success) {
        setExporting(false);
        
        if (onExportComplete) {
          onExportComplete();
        }
      } else {
        setExporting(false);
        toast.error(`Export failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      setExporting(false);
      console.error('Error in export handler:', error);
      toast.error(`Export failed: ${error.message}`);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleExport}
      disabled={exporting || isLoading || !data.length}
    >
      {exporting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {progress > 0 ? `Exporting ${progress}%` : 'Starting Export...'}
        </>
      ) : (
        <>
          <FileDown className="mr-2 h-4 w-4" />
          Export Excel
        </>
      )}
    </Button>
  );
}
