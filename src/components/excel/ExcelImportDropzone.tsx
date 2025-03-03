import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ExcelImportDropzoneProps {
  onUpload: () => Promise<any>;
  onUploadComplete?: (data: any) => void;
  accept?: { [key: string]: string[] };
}

const ExcelImportDropzone: React.FC<ExcelImportDropzoneProps> = ({ onUpload, onUploadComplete, accept }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    setFile(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept });

  const handleUpload = async () => {
    if (!file || isUploading) return;
    
    setIsUploading(true);
    
    try {
      // Fix the calling signature by removing the argument
      const data = await onUpload();
      toast.success('File uploaded successfully');
      
      if (onUploadComplete) {
        onUploadComplete(data);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Error uploading file: ' + (error as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-md">
      <div {...getRootProps()} className="w-full text-center">
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the file here ...</p>
        ) : (
          <p>
            Drag 'n' drop an Excel file here, or click to select a file
          </p>
        )}
      </div>
      {file && (
        <div className="mt-4">
          <p>Selected file: {file.name}</p>
          <Button onClick={handleUpload} disabled={isUploading}>
            {isUploading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ExcelImportDropzone;
