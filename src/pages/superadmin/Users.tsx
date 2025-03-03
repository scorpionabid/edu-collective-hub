
import React from 'react';
import { AdminList } from '@/components/users/AdminList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Users = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Users Management</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminList />
        </CardContent>
      </Card>
    </div>
  );
};

export default Users;
