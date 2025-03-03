
import React, { useState } from 'react';
import { AdminList } from '@/components/users/AdminList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminUser } from '@/components/users/types';
import { toast } from 'sonner';

const Users = () => {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [deletingAdmin, setDeletingAdmin] = useState<AdminUser | null>(null);

  // Mock functions for now
  const handleEdit = (admin: AdminUser) => {
    toast.info(`Edit admin: ${admin.firstName} ${admin.lastName}`);
  };

  const handleDelete = (adminId: number) => {
    setAdmins(admins.filter(admin => admin.id !== adminId));
    toast.success("Admin deleted successfully");
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Users Management</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminList 
            admins={admins} 
            onEdit={handleEdit} 
            onDelete={handleDelete}
            setDeletingAdmin={setDeletingAdmin}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Users;
