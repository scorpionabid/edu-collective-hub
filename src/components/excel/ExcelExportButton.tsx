
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ExcelExportButtonProps {
  label?: string;
  tableId: string;
  disabled?: boolean;
  filters?: object;
  onExportStart?: () => void;
  onExportComplete?: (fileUrl: string) => void;
  onExportError?: (error: string) => void;
}

// Helper functions for excel export
const startExport = async (tableId: string, filters: object = {}) => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    if (!userId) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('export_jobs')
      .insert({
        status: 'waiting',
        table_name: tableId,
        query_params: filters,
        created_by: userId,
        progress: 0,
        processed_rows: 0,
        total_rows: 0,
        file_name: `${tableId}_export_${new Date().toISOString().split('T')[0]}.xlsx`
      })
      .select()
      .single();

    if (error) throw error;
    
    return { 
      success: true, 
      jobId: data.id 
    };
  } catch (error: any) {
    console.error('Failed to start export:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

const checkExportStatus = async (jobId: string) => {
  try {
    const { data, error } = await supabase
      .from('export_jobs')
      .select('*')
      .eq('id', jobId)
      .single();
      
    if (error) throw error;
    
    return {
      success: true,
      status: data.status,
      progress: data.progress,
      fileUrl: data.file_url,
      error: data.error_message
    };
  } catch (error: any) {
    console.error('Failed to check export status:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

const downloadExportedFile = async (fileUrl: string) => {
  try {
    window.open(fileUrl, '_blank');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to download file:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

const ExcelExportButton: React.FC<ExcelExportButtonProps> = ({
  label = 'Export to Excel',
  tableId,
  disabled = false,
  filters = {},
  onExportStart,
  onExportComplete,
  onExportError
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportJobId, setExportJobId] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (exportJobId && isExporting) {
      interval = setInterval(async () => {
        const result = await checkExportStatus(exportJobId);
        
        if (!result.success) {
          clearInterval(interval);
          setIsExporting(false);
          onExportError?.(result.error || 'Export failed');
          toast.error('Export failed', { description: result.error });
          return;
        }
        
        setExportProgress(result.progress || 0);
        
        if (result.status === 'complete' && result.fileUrl) {
          clearInterval(interval);
          setIsExporting(false);
          onExportComplete?.(result.fileUrl);
          await downloadExportedFile(result.fileUrl);
          toast.success('Export complete');
        } else if (result.status === 'error') {
          clearInterval(interval);
          setIsExporting(false);
          onExportError?.(result.error || 'Export failed');
          toast.error('Export failed', { description: result.error });
        }
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [exportJobId, isExporting, onExportComplete, onExportError]);

  const handleExport = async () => {
    setIsExporting(true);
    onExportStart?.();
    
    try {
      const result = await startExport(tableId, filters);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to start export');
      }
      
      setExportJobId(result.jobId);
      toast.info('Export started', { description: 'Your file is being prepared' });
    } catch (error: any) {
      setIsExporting(false);
      onExportError?.(error.message);
      toast.error('Failed to start export', { description: error.message });
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={disabled || isExporting}
    >
      {isExporting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Exporting {exportProgress > 0 ? `(${Math.round(exportProgress)}%)` : ''}
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          {label}
        </>
      )}
    </Button>
  );
};

export default ExcelExportButton;
