
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { AdminLayout } from '@/components/layouts/AdminLayout';

const SectorTables = () => {
  const { user } = useAuth();
  
  return (
    <AdminLayout title="Sector Tables">
      <Card>
        <CardHeader>
          <CardTitle>Tables for Sector Admin</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Sector ID: {user?.sectorId || 'Not assigned'}</p>
          <p className="mt-4">Table management interface will be implemented here</p>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default SectorTables;
