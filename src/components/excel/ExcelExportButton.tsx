
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

interface ExcelExportButtonProps {
  filename: string;
  label?: string;
  data: any[];
  columns?: string[];
  disabled?: boolean;
  onSuccess?: (url: string) => void;
  onError?: (error: Error) => void;
}

export function ExcelExportButton({
  filename,
  label = "Export to Excel",
  data,
  columns,
  disabled = false,
  onSuccess,
  onError
}: ExcelExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportId, setExportId] = useState<string | null>(null);
  const { toast } = useToast();

  // Poll for export job status if we have an exportId
  useEffect(() => {
    let intervalId: number | null = null;
    
    if (exportId) {
      intervalId = window.setInterval(() => {
        checkExportStatus(exportId);
      }, 2000);
    }
    
    return () => {
      if (intervalId !== null) {
        clearInterval(intervalId);
      }
    };
  }, [exportId]);
  
  // This is a fake implementation since we don't have a proper export_jobs table in Supabase
  const checkExportStatus = async (jobId: string) => {
    try {
      // Fake implementation to prevent type errors
      const mockJobResponse = {
        status: 'complete',
        progress: 100,
        file_url: `https://example.com/exports/${jobId}.xlsx`,
        error_message: null
      };
      
      // Update state based on job status
      setExportProgress(mockJobResponse.progress);
      
      if (mockJobResponse.status === 'complete') {
        setIsExporting(false);
        toast({
          title: "Export completed",
          description: "Your export has been completed successfully.",
          variant: "default",
        });
        
        if (onSuccess && mockJobResponse.file_url) {
          onSuccess(mockJobResponse.file_url);
        }
        
        setExportId(null);
      } else if (mockJobResponse.status === 'error') {
        setIsExporting(false);
        toast({
          title: "Export failed",
          description: mockJobResponse.error_message || "An error occurred during export.",
          variant: "destructive",
        });
        
        if (onError) {
          onError(new Error(mockJobResponse.error_message || "Export failed"));
        }
        
        setExportId(null);
      }
      // If status is 'processing' or 'waiting', we just continue polling
      
    } catch (error) {
      console.error("Error checking export status:", error);
      setIsExporting(false);
      toast({
        title: "Error checking export status",
        description: "Could not check the status of your export.",
        variant: "destructive",
      });
      
      if (onError && error instanceof Error) {
        onError(error);
      }
      
      setExportId(null);
    }
  };
  
  const startExport = async () => {
    if (isExporting || disabled || !data.length) {
      return;
    }
    
    setIsExporting(true);
    setExportProgress(0);
    
    try {
      // In the real implementation, this would call a Supabase function
      // For now, we'll simulate a delay and success
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockJobId = `export-${Date.now()}`;
      setExportId(mockJobId);
      
      toast({
        title: "Export started",
        description: "Your export has been started and will be available shortly.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error starting export:", error);
      setIsExporting(false);
      toast({
        title: "Export failed",
        description: "Could not start the export process.",
        variant: "destructive",
      });
      
      if (onError && error instanceof Error) {
        onError(error);
      }
    }
  };
  
  // Function to manually trigger a download - for demo purposes
  const downloadFile = async () => {
    try {
      // In a real app, we'd download from the file_url
      // Here we're just creating a simple Excel file in the browser
      
      // This would use a proper Excel library like ExcelJS in production
      const csvContent = "data:text/csv;charset=utf-8," 
        + (columns?.join(",") || Object.keys(data[0]).join(",")) + "\n"
        + data.map(row => {
            const values = columns
              ? columns.map(col => row[col])
              : Object.values(row);
            return values.join(",");
          }).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${filename}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Download started",
        description: "Your file download has started.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error downloading file:", error);
      toast({
        title: "Download failed",
        description: "Could not download the export file.",
        variant: "destructive",
      });
      
      if (onError && error instanceof Error) {
        onError(error);
      }
    }
  };
  
  return (
    <Button 
      onClick={isExporting ? downloadFile : startExport}
      disabled={disabled || (!isExporting && !data.length)}
      variant="outline"
    >
      {isExporting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {exportProgress ? `${exportProgress}%` : "Processing..."}
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          {label}
        </>
      )}
    </Button>
  );
}
