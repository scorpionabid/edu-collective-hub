import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminList } from '@/components/users/AdminList';
import { AdminForm } from '@/components/users/AdminForm';
import { ImportDialog } from '@/components/users/ImportDialog';
import RegionList from '@/components/users/RegionList';
import SchoolList from '@/components/users/SchoolList';
import SectorList from '@/components/users/SectorList';
import { exportToExcel } from '@/utils/excelExport';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
}

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const fetchedUsers = await api.auth.getAllUsers();
        setUsers(fetchedUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to fetch users');
      }
    };

    fetchUsers();
  }, []);

  const handleCreate = () => {
    setSelectedUser(null);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
  };

  const handleDelete = async (id: string) => {
    try {
      await api.auth.deleteUser(id);
      setUsers(users.filter(user => user.id !== id));
      toast.success('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const handleSave = async (userData: User) => {
    try {
      if (userData.id) {
        await api.auth.updateUser(userData.id, userData);
        setUsers(users.map(user => (user.id === userData.id ? userData : user)));
        toast.success('User updated successfully');
      } else {
        const newUser = await api.auth.createUser(userData);
        setUsers([...users, newUser]);
        toast.success('User created successfully');
      }
      setSelectedUser(null);
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error('Failed to save user');
    }
  };

  const handleImport = async (data: any[]) => {
    try {
      // Process the imported data and create/update users
      for (const item of data) {
        const { id, firstName, lastName, email, role, regionId, sectorId, schoolId } = item;
        const userData: User = {
          id: id || null,
          firstName,
          lastName,
          email,
          role,
          regionId: regionId || null,
          sectorId: sectorId || null,
          schoolId: schoolId || null,
        };

        if (id) {
          await api.auth.updateUser(id, userData);
          setUsers(users.map(user => (user.id === id ? userData : user)));
        } else {
          const newUser = await api.auth.createUser(userData);
          setUsers([...users, newUser]);
        }
      }
      toast.success('Users imported successfully');
      setIsImportOpen(false);
    } catch (error) {
      console.error('Error importing users:', error);
      toast.error('Failed to import users');
    }
  };

  const handleExport = () => {
    const headers = [
      { key: 'id', title: 'ID' },
      { key: 'firstName', title: 'First Name' },
      { key: 'lastName', title: 'Last Name' },
      { key: 'email', title: 'Email' },
      { key: 'role', title: 'Role' },
      { key: 'regionId', title: 'Region ID' },
      { key: 'sectorId', title: 'Sector ID' },
      { key: 'schoolId', title: 'School ID' },
    ];
    exportToExcel(users, headers, 'users');
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex justify-between items-center">
            <div>
              <Button onClick={handleCreate}>Create User</Button>
              <Button variant="secondary" onClick={() => setIsImportOpen(true)}>
                Import
              </Button>
              <Button variant="secondary" onClick={handleExport}>
                Export
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1">
              <AdminList
                users={users}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>
            <div className="md:col-span-3">
              {selectedUser ? (
                <AdminForm
                  user={selectedUser}
                  onSave={handleSave}
                  onCancel={() => setSelectedUser(null)}
                />
              ) : (
                <AdminForm onSave={handleSave} onCancel={() => {}} />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <ImportDialog
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImport={handleImport}
      />
    </div>
  );
};

export default Users;
