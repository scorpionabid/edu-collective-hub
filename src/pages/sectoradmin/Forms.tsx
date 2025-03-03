
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

const SectorForms = () => {
  const { user } = useAuth();
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Form View</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Data Entry Forms</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Sector ID: {user?.sectorId || 'Not assigned'}</p>
          <p className="mt-4">Form management and viewing interface will be implemented here</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SectorForms;
