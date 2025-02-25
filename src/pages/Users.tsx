
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users as UsersIcon, UserPlus, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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

  const getEntityOptions = () => {
    switch (newAdmin.type) {
      case "regionadmin":
        return regions.map(region => (
          <SelectItem key={region.id} value={String(region.id)}>
            {region.name}
          </SelectItem>
        ));
      case "sectoradmin":
        return sectors.map(sector => (
          <SelectItem key={sector.id} value={String(sector.id)}>
            {sector.name}
          </SelectItem>
        ));
      case "schooladmin":
        return schools.map(school => (
          <SelectItem key={school.id} value={String(school.id)}>
            {school.name}
          </SelectItem>
        ));
      default:
        return [];
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
                    <DialogHeader>
                      <DialogTitle>Add New Administrator</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={newAdmin.firstName}
                          onChange={(e) => setNewAdmin({ ...newAdmin, firstName: e.target.value })}
                          placeholder="Enter first name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={newAdmin.lastName}
                          onChange={(e) => setNewAdmin({ ...newAdmin, lastName: e.target.value })}
                          placeholder="Enter last name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newAdmin.email}
                          onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                          placeholder="Enter email"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="utisCode">UTIS Code</Label>
                        <Input
                          id="utisCode"
                          value={newAdmin.utisCode}
                          onChange={(e) => setNewAdmin({ ...newAdmin, utisCode: e.target.value })}
                          placeholder="Enter UTIS code"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          value={newAdmin.password}
                          onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                          placeholder="Enter password"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={newAdmin.phone}
                          onChange={(e) => setNewAdmin({ ...newAdmin, phone: e.target.value })}
                          placeholder="Enter phone number"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="type">Administrator Type</Label>
                        <Select
                          value={newAdmin.type}
                          onValueChange={(value: AdminType) => {
                            setNewAdmin({ ...newAdmin, type: value, entityId: "" });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="regionadmin">Region Admin</SelectItem>
                            <SelectItem value="sectoradmin">Sector Admin</SelectItem>
                            <SelectItem value="schooladmin">School Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="entity">Select {newAdmin.type.replace('admin', '')}</Label>
                        <Select
                          value={newAdmin.entityId}
                          onValueChange={(value) => setNewAdmin({ ...newAdmin, entityId: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={`Select ${newAdmin.type.replace('admin', '')}`} />
                          </SelectTrigger>
                          <SelectContent>
                            {getEntityOptions()}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button className="col-span-2" onClick={handleAddAdmin}>
                        Add Administrator
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>UTIS Code</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Entity</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {admins.map((admin) => (
                      <TableRow key={admin.id}>
                        <TableCell>{admin.firstName} {admin.lastName}</TableCell>
                        <TableCell>{admin.email}</TableCell>
                        <TableCell>{admin.utisCode}</TableCell>
                        <TableCell>{admin.phone}</TableCell>
                        <TableCell>{admin.type.replace('admin', ' Admin')}</TableCell>
                        <TableCell>{admin.entityName}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setEditingAdmin(admin)}
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Edit Administrator</DialogTitle>
                                </DialogHeader>
                                {/* Add edit form here similar to add form */}
                              </DialogContent>
                            </Dialog>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => setDeletingAdmin(admin)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Delete Administrator</DialogTitle>
                                  <DialogDescription>
                                    Are you sure you want to delete this administrator? This action cannot be undone.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    onClick={() => setDeletingAdmin(null)}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    onClick={handleDeleteAdmin}
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Users;
