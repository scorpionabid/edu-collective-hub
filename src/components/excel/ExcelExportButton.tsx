
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { startExcelExport, checkExportStatus, downloadExportedFile } from '@/utils/excelExport';
import { Column } from '@/lib/api/types';
import { Progress } from '@/components/ui/progress';

interface ExcelExportButtonProps {
  data: any[] | null;
  columns: Column[];
  totalCount: number;
  fetchData: (page: number, pageSize: number) => Promise<any[]>;
  fileName?: string;
  disabled?: boolean;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showProgress?: boolean;
}

export const ExcelExportButton: React.FC<ExcelExportButtonProps> = ({
  data,
  columns,
  totalCount,
  fetchData,
  fileName = 'export',
  disabled = false,
  variant = 'outline',
  size = 'sm',
  showProgress = true
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [jobId, setJobId] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  // Poll for export status when we have a job ID
  useEffect(() => {
    if (!jobId || !isExporting) return;

    const intervalId = setInterval(async () => {
      try {
        setIsChecking(true);
        const result = await checkExportStatus(jobId);
        
        if (!result.success) {
          toast.error('Failed to check export status');
          setIsExporting(false);
          setIsChecking(false);
          return;
        }
        
        setProgress(result.progress);
        
        if (result.status === 'complete') {
          setIsExporting(false);
          toast.success('Export completed successfully');
          
          // Auto download the file
          await downloadExportedFile(jobId);
          setJobId(null);
        } else if (result.status === 'error') {
          setIsExporting(false);
          toast.error('Export failed');
          setJobId(null);
        }
      } catch (error) {
        console.error('Error checking export status:', error);
        toast.error('Failed to check export status');
        setIsExporting(false);
      } finally {
        setIsChecking(false);
      }
    }, 2000);
    
    return () => clearInterval(intervalId);
  }, [jobId, isExporting]);

  const handleExport = async () => {
    if (!data || data.length === 0) {
      toast.error('No data to export');
      return;
    }
    
    if (isExporting) {
      toast.info('Export is already in progress');
      return;
    }
    
    setIsExporting(true);
    setProgress(0);
    
    try {
      // If totalCount is smaller than initial data, just export directly
      if (totalCount <= data.length) {
        const directExport = await startExcelExport(
          () => Promise.resolve(data),
          columns,
          data.length,
          fileName,
          data.length
        );
        
        if (directExport.success) {
          // Direct export might not have a jobId, handle both cases
          if (directExport.jobId) {
            setJobId(directExport.jobId);
          } else {
            setIsExporting(false);
            toast.success('Export completed successfully');
          }
        } else {
          setIsExporting(false);
          toast.error('Export failed');
        }
        return;
      }
      
      // For larger data sets, start background export
      const result = await startExcelExport(
        fetchData,
        columns,
        totalCount,
        fileName,
        1000
      );
      
      if (result.success) {
        if (result.jobId) {
          setJobId(result.jobId);
          toast.success('Export started');
        } else {
          // If we got success but no jobId, the export was handled directly
          setIsExporting(false);
          toast.success('Export completed successfully');
        }
      } else {
        setIsExporting(false);
        toast.error('Failed to start export');
      }
    } catch (error) {
      console.error('Error starting export:', error);
      setIsExporting(false);
      toast.error('Failed to start export');
    }
  };

  return (
    <div className="space-y-2">
      <Button
        variant={variant}
        size={size}
        onClick={handleExport}
        disabled={disabled || isExporting || !data || data.length === 0}
      >
        {isExporting ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Download className="w-4 h-4 mr-2" />
        )}
        {isExporting ? 'Exporting...' : 'Export to Excel'}
      </Button>
      
      {isExporting && showProgress && (
        <div className="space-y-1">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-gray-500">{progress}% complete</p>
        </div>
      )}
    </div>
  );
};
