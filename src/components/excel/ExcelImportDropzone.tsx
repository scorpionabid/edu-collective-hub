
import React, { useState, useCallback } from 'react';
import { FileUp, X, FileSpreadsheet, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useEnhancedExcelImport } from '@/hooks/useEnhancedExcelImport';

interface ExcelImportDropzoneProps<T> {
  onImportComplete?: (data: T[]) => void;
  transformFn?: (row: Record<string, any>, index: number) => T;
  validateFn?: (row: T) => boolean | string;
  tableName: string;
  title?: string;
  description?: string;
  maxRows?: number;
  batchSize?: number;
  withUpsert?: boolean;
  keyField?: string;
}

export function ExcelImportDropzone<T>({
  onImportComplete,
  transformFn,
  validateFn,
  tableName,
  title = 'Import Excel Data',
  description = 'Drag and drop your Excel file here, or click to select a file',
  maxRows = 10000,
  batchSize = 1000,
  withUpsert = false,
  keyField
}: ExcelImportDropzoneProps<T>) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const {
    isImporting,
    progress,
    totalRows,
    processedRows,
    errors,
    processExcelFile,
    cancelImport
  } = useEnhancedExcelImport<T>({
    batchSize,
    maxRows,
    transformFn,
    validateFn,
    tableName,
    onComplete: onImportComplete,
    withUpsert,
    keyField
  });
  
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      handleFile(file);
    }
  }, []);
  
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      handleFile(file);
    }
  }, []);
  
  const handleFile = useCallback((file: File) => {
    // Check file extension
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validExtensions.includes(fileExtension)) {
      toast.error('Invalid file type. Please upload an Excel file (.xlsx, .xls) or CSV file.');
      return;
    }
    
    setSelectedFile(file);
  }, []);
  
  const handleImport = useCallback(() => {
    if (selectedFile) {
      processExcelFile(selectedFile);
    }
  }, [selectedFile, processExcelFile]);
  
  const handleCancel = useCallback(() => {
    if (isImporting) {
      cancelImport();
    }
    setSelectedFile(null);
  }, [isImporting, cancelImport]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragging ? 'border-primary bg-primary/10' : 'border-gray-300'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {!selectedFile && !isImporting ? (
            <>
              <FileUp className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">{description}</p>
              <Button className="mt-4" onClick={() => document.getElementById('file-upload')?.click()}>
                Select File
              </Button>
              <input 
                type="file" 
                id="file-upload" 
                className="hidden"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
              />
            </>
          ) : (
            <>
              {isImporting ? (
                <div className="space-y-4">
                  <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin" />
                  <h3 className="text-lg font-medium">Importing data...</h3>
                  <Progress value={progress} className="h-2 w-full" />
                  <p className="text-sm text-gray-600">
                    Processed {processedRows} of {totalRows} rows ({progress}%)
                  </p>
                  <Button variant="destructive" onClick={handleCancel}>
                    Cancel Import
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <FileSpreadsheet className="mx-auto h-12 w-12 text-primary" />
                  <h3 className="text-lg font-medium">{selectedFile?.name}</h3>
                  <p className="text-sm text-gray-600">
                    {selectedFile?.size ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : ''}
                  </p>
                  <div className="flex space-x-2 justify-center">
                    <Button variant="default" onClick={handleImport}>
                      Start Import
                    </Button>
                    <Button variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        
        {errors.length > 0 && (
          <div className="mt-4">
            <h4 className="text-md font-medium text-red-600 mb-2">Errors ({errors.length})</h4>
            <div className="max-h-60 overflow-auto border rounded-lg p-2">
              {errors.map((error, index) => (
                <div key={index} className="text-sm text-red-600 mb-1">
                  Row {error.row}: {error.message}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t p-4">
        <div className="text-sm text-gray-500">
          <Clock className="inline-block mr-1 h-4 w-4" />
          Maximum {maxRows.toLocaleString()} rows supported
        </div>
        {withUpsert && (
          <Badge variant="outline" className="ml-auto">
            Upsert Mode
          </Badge>
        )}
      </CardFooter>
    </Card>
  );
}
