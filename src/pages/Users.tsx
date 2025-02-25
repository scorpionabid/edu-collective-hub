
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AdminForm } from "@/components/users/AdminForm";
import { AdminList } from "@/components/users/AdminList";

type AdminType = 'regionadmin' | 'sectoradmin' | 'schooladmin';

interface AdminUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  utisCode: string;
  phone: string;
  type: AdminType;
  entityId: number;
  entityName: string;
}

interface NewAdmin {
  firstName: string;
  lastName: string;
  email: string;
  utisCode: string;
  password: string;
  phone: string;
  type: AdminType;
  entityId: string;
}

const Users = () => {
  const { user } = useAuth();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [newAdmin, setNewAdmin] = useState<NewAdmin>({
    firstName: "",
    lastName: "",
    email: "",
    utisCode: "",
    password: "",
    phone: "",
    type: "regionadmin",
    entityId: "",
  });
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [deletingAdmin, setDeletingAdmin] = useState<AdminUser | null>(null);

  // Mock data for regions, sectors, and schools
  const regions = [
    { id: 1, name: "Region 1" },
    { id: 2, name: "Region 2" },
  ];

  const sectors = [
    { id: 1, name: "Sector 1", regionId: 1 },
    { id: 2, name: "Sector 2", regionId: 1 },
    { id: 3, name: "Sector 3", regionId: 2 },
  ];

  const schools = [
    { id: 1, name: "School 1", sectorId: 1 },
    { id: 2, name: "School 2", sectorId: 1 },
    { id: 3, name: "School 3", sectorId: 2 },
  ];

  const handleAddAdmin = () => {
    if (validateAdminData(newAdmin)) {
      const entityName = getEntityName(newAdmin.type, parseInt(newAdmin.entityId));
      setAdmins([
        ...admins,
        {
          id: Date.now(),
          ...newAdmin,
          entityId: parseInt(newAdmin.entityId),
          entityName,
        },
      ]);
      setNewAdmin({
        firstName: "",
        lastName: "",
        email: "",
        utisCode: "",
        password: "",
        phone: "",
        type: "regionadmin",
        entityId: "",
      });
      toast.success("Admin added successfully");
    }
  };

  const validateAdminData = (data: NewAdmin): boolean => {
    if (!data.firstName.trim()) {
      toast.error("First name is required");
      return false;
    }
    if (!data.lastName.trim()) {
      toast.error("Last name is required");
      return false;
    }
    if (!data.email.trim() || !data.email.includes("@")) {
      toast.error("Valid email is required");
      return false;
    }
    if (!data.utisCode.trim()) {
      toast.error("UTIS code is required");
      return false;
    }
    if (!data.password.trim() || data.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }
    if (!data.phone.trim()) {
      toast.error("Phone number is required");
      return false;
    }
    if (!data.entityId) {
      toast.error("Please select an entity");
      return false;
    }
    return true;
  };

  const getEntityName = (type: AdminType, entityId: number): string => {
    switch (type) {
      case "regionadmin":
        return regions.find(r => r.id === entityId)?.name || "";
      case "sectoradmin":
        return sectors.find(s => s.id === entityId)?.name || "";
      case "schooladmin":
        return schools.find(s => s.id === entityId)?.name || "";
    }
  };

  const handleUpdateAdmin = () => {
    if (editingAdmin) {
      setAdmins(admins.map(admin => 
        admin.id === editingAdmin.id ? editingAdmin : admin
      ));
      setEditingAdmin(null);
      toast.success("Admin updated successfully");
    }
  };

  const handleDeleteAdmin = () => {
    if (deletingAdmin) {
      setAdmins(admins.filter(admin => admin.id !== deletingAdmin.id));
      setDeletingAdmin(null);
      toast.success("Admin deleted successfully");
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1">
          <header className="bg-white shadow">
            <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <h1 className="text-xl font-semibold">Users</h1>
              </div>
            </div>
          </header>
          <main className="p-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>User Management</CardTitle>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add Administrator
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <AdminForm
                      admin={newAdmin}
                      onAdminChange={setNewAdmin}
                      onSubmit={handleAddAdmin}
                      submitLabel="Add Administrator"
                      regions={regions}
                      sectors={sectors}
                      schools={schools}
                    />
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <AdminList
                  admins={admins}
                  onEdit={setEditingAdmin}
                  onDelete={handleDeleteAdmin}
                  setDeletingAdmin={setDeletingAdmin}
                />
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Users;
