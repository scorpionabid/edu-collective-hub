
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

const SchoolImport = () => {
  const { user } = useAuth();
  
  const handleFileUpload = () => {
    // This will be implemented later
    console.log("File upload functionality will be implemented here");
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Import Data</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Data Import Tool</CardTitle>
        </CardHeader>
        <CardContent>
          <p>School ID: {user?.schoolId || 'Not assigned'}</p>
          <div className="mt-4 p-6 border-2 border-dashed rounded-lg text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">Drag and drop your Excel file here, or click to select a file</p>
            <Button className="mt-4" onClick={handleFileUpload}>
              Select File
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SchoolImport;
