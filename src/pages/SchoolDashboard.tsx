
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFormData } from '@/hooks/useFormData';

const SchoolDashboard = () => {
  const { 
    formEntries, 
    loading, 
    fetchFormEntries, 
    submitFormEntry, 
    approveFormEntry, 
    rejectFormEntry 
  } = useFormData();

  useEffect(() => {
    fetchFormEntries();
  }, [fetchFormEntries]);

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">School Dashboard</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Form Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center my-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : formEntries.length === 0 ? (
            <p className="text-center py-8">No form entries found</p>
          ) : (
            <div className="space-y-4">
              {formEntries.map(entry => (
                <div 
                  key={entry.id} 
                  className="p-4 border rounded-md shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">Form ID: {entry.id}</h3>
                      <p className="text-sm text-gray-500">Status: {entry.status}</p>
                      {entry.submittedAt && (
                        <p className="text-xs text-gray-400">Submitted at: {entry.submittedAt}</p>
                      )}
                    </div>
                    <div className="space-x-2">
                      {entry.status === 'draft' && (
                        <button 
                          onClick={() => submitFormEntry(entry.id)}
                          className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                        >
                          Submit
                        </button>
                      )}
                      {entry.status === 'submitted' && (
                        <>
                          <button 
                            onClick={() => approveFormEntry(entry.id)}
                            className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => rejectFormEntry(entry.id, "Rejected by admin")}
                            className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SchoolDashboard;
