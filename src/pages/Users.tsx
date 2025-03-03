
import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { AdminForm } from '@/components/users/AdminForm';
import { ImportDialog } from '@/components/users/ImportDialog';
import { RegionList } from '@/components/users/RegionList';
import { SchoolList } from '@/components/users/SchoolList';
import { SectorList } from '@/components/users/SectorList';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';

// Define AdminUser type
interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
}

const Users = () => {
  const [activeTab, setActiveTab] = useState('admins');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editData, setEditData] = useState<AdminUser | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const { user } = useAuth();
  
  // Fetch admins on component mount
  useEffect(() => {
    fetchAdmins();
  }, []);
  
  // Fetch admin users
  const fetchAdmins = async () => {
    try {
      const data = await api.auth.getAdmins();
      setAdmins(data);
    } catch (error) {
      console.error('Error fetching admins:', error);
      toast.error('Failed to load admin users');
    }
  };
  
  // Handle adding a new admin
  const handleAddAdmin = async (userData: any) => {
    try {
      await api.auth.createAdmin(userData);
      toast.success('Admin user created successfully');
      setShowAddForm(false);
      fetchAdmins();
    } catch (error) {
      console.error('Error adding admin:', error);
      toast.error('Failed to create admin user');
    }
  };
  
  // Handle editing an admin
  const handleEditAdmin = async (userData: any) => {
    try {
      if (editData) {
        await api.auth.updateAdmin(editData.id, userData);
        toast.success('Admin user updated successfully');
        setShowEditForm(false);
        setEditData(null);
        fetchAdmins();
      }
    } catch (error) {
      console.error('Error updating admin:', error);
      toast.error('Failed to update admin user');
    }
  };
  
  // Handle deleting an admin
  const handleDeleteAdmin = async (adminId: string) => {
    try {
      await api.auth.deleteAdmin(adminId);
      toast.success('Admin user deleted successfully');
      fetchAdmins();
    } catch (error) {
      console.error('Error deleting admin:', error);
      toast.error('Failed to delete admin user');
    }
  };
  
  // Handle importing users
  const handleImport = async (data: any[]) => {
    try {
      await api.auth.importUsers(data);
      toast.success('Users imported successfully');
      setIsImportOpen(false);
      fetchAdmins();
    } catch (error) {
      console.error('Error importing users:', error);
      toast.error('Failed to import users');
    }
  };
  
  return (
    <AdminLayout title="User Management">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">User Management</h1>
          <div className="flex gap-3">
            <Button onClick={() => setShowAddForm(true)}>
              <PlusIcon className="mr-2 h-4 w-4" /> Add User
            </Button>
            <Button variant="outline" onClick={() => setIsImportOpen(true)}>
              Import Users
            </Button>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="admins">Administrators</TabsTrigger>
            <TabsTrigger value="regions">Region Admins</TabsTrigger>
            <TabsTrigger value="sectors">Sector Admins</TabsTrigger>
            <TabsTrigger value="schools">School Admins</TabsTrigger>
          </TabsList>
          
          <TabsContent value="admins">
            <Card>
              <CardHeader>
                <CardTitle>System Administrators</CardTitle>
              </CardHeader>
              <CardContent>
                <AdminList 
                  admins={admins.filter(a => a.role === 'superadmin')}
                  onEdit={(admin) => {
                    setEditData(admin);
                    setShowEditForm(true);
                  }}
                  onDelete={(id) => handleDeleteAdmin(id)}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="regions">
            <Card>
              <CardHeader>
                <CardTitle>Region Administrators</CardTitle>
              </CardHeader>
              <CardContent>
                <RegionList 
                  admins={admins.filter(a => a.role === 'regionadmin')}
                  onAddAdmin={() => {}}
                  onEditAdmin={() => {}}
                  onDeleteAdmin={() => {}}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="sectors">
            <Card>
              <CardHeader>
                <CardTitle>Sector Administrators</CardTitle>
              </CardHeader>
              <CardContent>
                <SectorList />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="schools">
            <Card>
              <CardHeader>
                <CardTitle>School Administrators</CardTitle>
              </CardHeader>
              <CardContent>
                <SchoolList 
                  admins={admins.filter(a => a.role === 'schooladmin')}
                  onAddAdmin={() => {}}
                  onEditAdmin={() => {}}
                  onDeleteAdmin={() => {}}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {showAddForm && (
          <AdminForm
            onSave={handleAddAdmin}
            onCancel={() => setShowAddForm(false)}
          />
        )}
        
        {showEditForm && editData && (
          <AdminForm
            initialData={editData}
            onSave={handleEditAdmin}
            onCancel={() => {
              setShowEditForm(false);
              setEditData(null);
            }}
          />
        )}
        
        <ImportDialog
          open={isImportOpen}
          onClose={() => setIsImportOpen(false)}
          onImport={handleImport}
        />
      </div>
    </AdminLayout>
  );
};

export default Users;
