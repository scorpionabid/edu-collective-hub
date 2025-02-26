
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserPlus, Info, Shield } from "lucide-react";
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

interface Entity {
  id: number;
  name: string;
  adminId?: number;
  adminName?: string;
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
  const [selectedEntity, setSelectedEntity] = useState<{ type: AdminType; entity: Entity } | null>(null);

  // Mock data for regions, sectors, and schools
  const regions: Entity[] = [
    { id: 1, name: "Bakı" },
    { id: 2, name: "Sumqayıt" },
    { id: 3, name: "Gəncə" },
  ];

  const sectors: Entity[] = [
    { id: 1, name: "Sektor 1", adminId: 1, adminName: "Admin 1" },
    { id: 2, name: "Sektor 2" },
    { id: 3, name: "Sektor 3" },
  ];

  const schools: Entity[] = [
    { id: 1, name: "Məktəb 1" },
    { id: 2, name: "Məktəb 2", adminId: 2, adminName: "Admin 2" },
    { id: 3, name: "Məktəb 3" },
  ];

  const handleAddAdmin = () => {
    if (validateAdminData(newAdmin)) {
      const entityName = getEntityName(newAdmin.type, parseInt(newAdmin.entityId));
      
      const newAdminUser: AdminUser = {
        id: Date.now(),
        ...newAdmin,
        entityId: parseInt(newAdmin.entityId),
        entityName,
      };

      setAdmins([...admins, newAdminUser]);
      
      // Update the admin assignment in the corresponding entity list
      if (selectedEntity) {
        const entityList = selectedEntity.type === 'regionadmin' ? regions :
                         selectedEntity.type === 'sectoradmin' ? sectors : schools;
        
        const entity = entityList.find(e => e.id === parseInt(newAdmin.entityId));
        if (entity) {
          entity.adminId = newAdminUser.id;
          entity.adminName = `${newAdminUser.firstName} ${newAdminUser.lastName}`;
        }
      }

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
      setSelectedEntity(null);
      toast.success("Administrator uğurla əlavə edildi");
    }
  };

  const validateAdminData = (data: NewAdmin): boolean => {
    if (!data.firstName.trim()) {
      toast.error("Ad daxil edilməlidir");
      return false;
    }
    if (!data.lastName.trim()) {
      toast.error("Soyad daxil edilməlidir");
      return false;
    }
    if (!data.email.trim() || !data.email.includes("@")) {
      toast.error("Düzgün email daxil edilməlidir");
      return false;
    }
    if (!data.utisCode.trim()) {
      toast.error("UTIS kodu daxil edilməlidir");
      return false;
    }
    if (!data.password.trim() || data.password.length < 6) {
      toast.error("Şifrə ən az 6 simvol olmalıdır");
      return false;
    }
    if (!data.phone.trim()) {
      toast.error("Telefon nömrəsi daxil edilməlidir");
      return false;
    }
    if (!data.entityId) {
      toast.error("Təyin ediləcək qurum seçilməlidir");
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
      toast.success("Administrator uğurla yeniləndi");
    }
  };

  const handleDeleteAdmin = () => {
    if (deletingAdmin) {
      setAdmins(admins.filter(admin => admin.id !== deletingAdmin.id));
      setDeletingAdmin(null);
      toast.success("Administrator uğurla silindi");
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
                <h1 className="text-xl font-semibold">İstifadəçilər</h1>
              </div>
            </div>
          </header>
          <main className="p-6 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Regionlar</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Region</TableHead>
                      <TableHead>Admin</TableHead>
                      <TableHead className="w-[100px]">Əməliyyatlar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {regions.map((region) => (
                      <TableRow key={region.id}>
                        <TableCell className="font-medium">{region.name}</TableCell>
                        <TableCell>{region.adminName || "Təyin edilməyib"}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {!region.adminId && (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedEntity({
                                      type: "regionadmin",
                                      entity: region
                                    })}
                                  >
                                    <Shield className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <AdminForm
                                    admin={{
                                      ...newAdmin,
                                      type: "regionadmin",
                                      entityId: region.id.toString()
                                    }}
                                    onAdminChange={setNewAdmin}
                                    onSubmit={handleAddAdmin}
                                    submitLabel="Admin təyin et"
                                    entityType="regionadmin"
                                    entityName={region.name}
                                    regions={regions}
                                    sectors={sectors}
                                    schools={schools}
                                  />
                                </DialogContent>
                              </Dialog>
                            )}
                            <Button variant="ghost" size="sm">
                              <Info className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Sektorlar</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sektor</TableHead>
                      <TableHead>Admin</TableHead>
                      <TableHead className="w-[100px]">Əməliyyatlar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sectors.map((sector) => (
                      <TableRow key={sector.id}>
                        <TableCell className="font-medium">{sector.name}</TableCell>
                        <TableCell>{sector.adminName || "Təyin edilməyib"}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {!sector.adminId && (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedEntity({
                                      type: "sectoradmin",
                                      entity: sector
                                    })}
                                  >
                                    <Shield className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <AdminForm
                                    admin={{
                                      ...newAdmin,
                                      type: "sectoradmin",
                                      entityId: sector.id.toString()
                                    }}
                                    onAdminChange={setNewAdmin}
                                    onSubmit={handleAddAdmin}
                                    submitLabel="Admin təyin et"
                                    entityType="sectoradmin"
                                    entityName={sector.name}
                                    regions={regions}
                                    sectors={sectors}
                                    schools={schools}
                                  />
                                </DialogContent>
                              </Dialog>
                            )}
                            <Button variant="ghost" size="sm">
                              <Info className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Məktəblər</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Məktəb</TableHead>
                      <TableHead>Admin</TableHead>
                      <TableHead className="w-[100px]">Əməliyyatlar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schools.map((school) => (
                      <TableRow key={school.id}>
                        <TableCell className="font-medium">{school.name}</TableCell>
                        <TableCell>{school.adminName || "Təyin edilməyib"}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {!school.adminId && (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedEntity({
                                      type: "schooladmin",
                                      entity: school
                                    })}
                                  >
                                    <Shield className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <AdminForm
                                    admin={{
                                      ...newAdmin,
                                      type: "schooladmin",
                                      entityId: school.id.toString()
                                    }}
                                    onAdminChange={setNewAdmin}
                                    onSubmit={handleAddAdmin}
                                    submitLabel="Admin təyin et"
                                    entityType="schooladmin"
                                    entityName={school.name}
                                    regions={regions}
                                    sectors={sectors}
                                    schools={schools}
                                  />
                                </DialogContent>
                              </Dialog>
                            )}
                            <Button variant="ghost" size="sm">
                              <Info className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>İstifadəçilərin idarə edilməsi</CardTitle>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Administrator əlavə et
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <AdminForm
                      admin={newAdmin}
                      onAdminChange={setNewAdmin}
                      onSubmit={handleAddAdmin}
                      submitLabel="Administrator əlavə et"
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
