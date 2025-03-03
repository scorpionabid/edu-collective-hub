
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { InfoIcon, Upload } from 'lucide-react';
import { ExcelImportDropzone } from '@/components/excel/ExcelImportDropzone';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { ImportJob } from '@/lib/api/types';

const SchoolImport = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('upload');
  const [recentImports, setRecentImports] = useState<ImportJob[]>([]);
  
  // Fetch recent imports when active tab changes to history
  React.useEffect(() => {
    if (activeTab === 'history') {
      fetchRecentImports();
    }
  }, [activeTab]);
  
  // Subscribe to real-time updates for import jobs
  React.useEffect(() => {
    if (!user?.id) return;
    
    const channel = supabase
      .channel('import-updates')
      .on('postgres_changes', 
        {
          event: '*',
          schema: 'public',
          table: 'import_jobs',
          filter: `created_by=eq.${user.id}`
        }, 
        () => {
          if (activeTab === 'history') {
            fetchRecentImports();
          }
        })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, activeTab]);
  
  const fetchRecentImports = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('import_jobs')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (error) {
        console.error('Error fetching recent imports:', error);
        toast.error('Failed to load import history');
        return;
      }
      
      setRecentImports(data as ImportJob[]);
    } catch (error) {
      console.error('Error in fetchRecentImports:', error);
      toast.error('Failed to load import history');
    }
  };
  
  const handleImportComplete = (data: any[]) => {
    toast.success(`Successfully imported ${data.length} rows of data`);
    setActiveTab('history');
  };
  
  const transformRow = (row: Record<string, any>, index: number) => {
    // Transform Excel row data to match your database structure
    return {
      ...row,
      school_id: user?.schoolId,
      created_at: new Date().toISOString(),
      created_by: user?.id
    };
  };
  
  const validateRow = (row: any) => {
    // Add validation logic here
    if (!row.name && typeof row.name === 'string') {
      return 'Name is required';
    }
    
    return true;
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Import Data</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="upload">Upload File</TabsTrigger>
          <TabsTrigger value="history">Import History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload">
          <Alert className="mb-6">
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>Import Information</AlertTitle>
            <AlertDescription>
              You can import Excel files with up to 10,000 rows. The system will process the data in batches and show you real-time progress.
            </AlertDescription>
          </Alert>
          
          <ExcelImportDropzone
            tableName="student_data"
            title="Import Student Data"
            description="Drag and drop your Excel file here, or click to select a file"
            onImportComplete={handleImportComplete}
            transformFn={transformRow}
            validateFn={validateRow}
            maxRows={10000}
            batchSize={1000}
            withUpsert={true}
            keyField="student_id"
          />
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Recent Imports</CardTitle>
            </CardHeader>
            <CardContent>
              {recentImports.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No imports found</p>
              ) : (
                <div className="space-y-4">
                  {recentImports.map((importJob) => (
                    <div key={importJob.id} className="border rounded-lg p-4">
                      <div className="flex justify-between mb-2">
                        <h3 className="font-medium">{importJob.file_name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          importJob.status === 'complete' ? 'bg-green-100 text-green-800' :
                          importJob.status === 'error' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {importJob.status.charAt(0).toUpperCase() + importJob.status.slice(1)}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-500 mb-2">
                        {new Date(importJob.created_at).toLocaleString()}
                      </div>
                      
                      <Progress 
                        value={importJob.progress} 
                        className="h-2 mb-2" 
                      />
                      
                      <div className="text-sm">
                        {importJob.processed_rows} of {importJob.total_rows} rows processed
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SchoolImport;
