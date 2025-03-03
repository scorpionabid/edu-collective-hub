
import React, { useState, useEffect } from 'react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import AdminForm from '@/components/users/AdminForm';
import ImportDialog from '@/components/users/ImportDialog';
import { AdminList } from '@/components/users/AdminList';  // Fix import
import { RegionList } from '@/components/users/RegionList'; // Fix import
import { SchoolList } from '@/components/users/SchoolList'; // Fix import
import { SectorList } from '@/components/users/SectorList';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

// Since we don't have actual API endpoints for these user operations yet,
// we'll use placeholder implementations that will be completed later
const Users = () => {
  const [activeTab, setActiveTab] = useState('admins');
  const [users, setUsers] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [sectors, setSectors] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isAdminFormOpen, setIsAdminFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const { user } = useAuth();

  useEffect(() => {
    // For admins, we'd fetch actual user data here.
    // Since the API isn't implemented yet, we'll use mock data
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        // These functions would be implemented in the API
        // For now, they're placeholders
        // const adminUsers = await api.auth.getAllUsers([user?.role || 'user']);
        const adminUsers = []; // Mock empty users array
        setUsers(adminUsers);
        
        const regionsData = await api.regions.getAll();
        setRegions(regionsData);
        
        const sectorsData = await api.sectors.getAll();
        setSectors(sectorsData);
        
        const schoolsData = await api.schools.getAll();
        setSchools(schoolsData);
      } catch (error) {
        console.error('Error loading users data:', error);
        toast.error('Failed to load users data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user]);

  const handleDeleteUser = async (id: string) => {
    try {
      setIsLoading(true);
      // Replace with actual API call when implemented
      // await api.auth.deleteUser(id);
      setUsers(users.filter(user => user.id !== id));
      toast.success('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveUser = async (userData: any) => {
    try {
      setIsLoading(true);
      if (selectedUser) {
        // Replace with actual API call when implemented
        // const updatedUser = await api.auth.updateUser(selectedUser.id, userData);
        const updatedUser = { ...selectedUser, ...userData };
        setUsers(users.map(u => u.id === selectedUser.id ? updatedUser : u));
        toast.success('User updated successfully');
      } else {
        // Replace with actual API call when implemented
        // const newUser = await api.auth.createUser(userData);
        const newUser = { id: Date.now().toString(), ...userData };
        setUsers([...users, newUser]);
        toast.success('User created successfully');
      }
      setIsAdminFormOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error('Failed to save user');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setIsAdminFormOpen(true);
  };
  
  const handleAddUser = () => {
    setSelectedUser(null);
    setIsAdminFormOpen(true);
  };
  
  const handleImportUsers = async (data: any[]) => {
    try {
      setIsLoading(true);
      // This would be an actual API call
      // For now, just add the imported users to our state
      setUsers([...users, ...data]);
      setIsImportDialogOpen(false);
      toast.success(`Successfully imported ${data.length} users`);
    } catch (error) {
      console.error('Error importing users:', error);
      toast.error('Failed to import users');
    } finally {
      setIsLoading(false);
    }
  };

  const tabOptions = [
    { key: 'admins', title: 'Administrators' },
    { key: 'regions', title: 'Regions' },
    { key: 'sectors', title: 'Sectors' },
    { key: 'schools', title: 'Schools' },
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <div className="flex gap-2">
          <Button onClick={handleAddUser}>Add User</Button>
          <Button variant="outline" onClick={() => setIsImportDialogOpen(true)}>
            Import Users
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="admins" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-6">
          {tabOptions.map(tab => (
            <TabsTrigger key={tab.key} value={tab.key}>
              {tab.title}
            </TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value="admins">
          <AdminList 
            admins={users} 
            isLoading={isLoading} 
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
          />
        </TabsContent>
        
        <TabsContent value="regions">
          {/* Replace with actual props once available */}
          <RegionList />
        </TabsContent>
        
        <TabsContent value="sectors">
          <SectorList 
            sectors={sectors || []} 
            regions={regions || []} 
            onAdd={() => {}} 
            onEdit={() => {}} 
            onDelete={() => {}} 
          />
        </TabsContent>
        
        <TabsContent value="schools">
          {/* Replace with actual props once available */}
          <SchoolList />
        </TabsContent>
      </Tabs>
      
      {isAdminFormOpen && (
        selectedUser ? (
          <AdminForm
            initialData={selectedUser}
            onSave={handleSaveUser}
            onCancel={() => setIsAdminFormOpen(false)}
          />
        ) : (
          <AdminForm
            onSave={handleSaveUser}
            onCancel={() => setIsAdminFormOpen(false)}
          />
        )
      )}
      
      <ImportDialog
        open={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
        onImport={handleImportUsers}
      />
    </div>
  );
};

export default Users;
