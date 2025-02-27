
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { UserPlus, FileInput, Download, UploadCloud } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AdminForm } from "@/components/users/AdminForm";
import { AdminList } from "@/components/users/AdminList";
import { RegionList } from "@/components/users/RegionList";
import { SectorList } from "@/components/users/SectorList";
import { SchoolList } from "@/components/users/SchoolList";
import { AdminType, AdminUser, NewAdmin, Entity } from "@/components/users/types";
import { ImportDialog } from "@/components/users/ImportDialog";
import { ImportedSchool, ImportedAdmin } from "@/utils/excelImport";

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
  
  // Import functionality states
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importType, setImportType] = useState<'schools' | 'admins'>('schools');

  // Mock data for regions, sectors, and schools
  const [regions, setRegions] = useState<Entity[]>([
    { id: 1, name: "Bakı" },
    { id: 2, name: "Sumqayıt" },
    { id: 3, name: "Gəncə" },
  ]);

  const [sectors, setSectors] = useState<Entity[]>([
    { id: 1, name: "Sektor 1", adminId: 1, adminName: "Admin 1" },
    { id: 2, name: "Sektor 2" },
    { id: 3, name: "Sektor 3" },
  ]);

  const [schools, setSchools] = useState<Entity[]>([
    { id: 1, name: "Məktəb 1" },
    { id: 2, name: "Məktəb 2", adminId: 2, adminName: "Admin 2" },
    { id: 3, name: "Məktəb 3" },
  ]);

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
  
  // Handle imported schools
  const handleImportedSchools = (importedSchools: ImportedSchool[]) => {
    const newSchools: Entity[] = importedSchools.map((school, index) => ({
      id: schools.length + index + 1,
      name: school.name
    }));
    
    setSchools([...schools, ...newSchools]);
  };
  
  // Handle imported admins
  const handleImportedAdmins = (importedAdmins: ImportedAdmin[]) => {
    const newAdminUsers: AdminUser[] = [];
    
    importedAdmins.forEach((admin) => {
      let entityId = 0;
      let entityType: AdminType = 'schooladmin';
      
      // Determine admin type and find corresponding entity
      if (admin.type.includes('region')) {
        entityType = 'regionadmin';
        const region = regions.find(r => r.name === admin.entityName);
        if (region) entityId = region.id;
      } else if (admin.type.includes('sector')) {
        entityType = 'sectoradmin';
        const sector = sectors.find(s => s.name === admin.entityName);
        if (sector) entityId = sector.id;
      } else {
        entityType = 'schooladmin';
        const school = schools.find(s => s.name === admin.entityName);
        if (school) entityId = school.id;
      }
      
      if (entityId) {
        const newAdmin: AdminUser = {
          id: Date.now() + newAdminUsers.length,
          firstName: admin.firstName,
          lastName: admin.lastName,
          email: admin.email,
          utisCode: admin.utisCode,
          phone: admin.phone,
          type: entityType,
          entityId,
          entityName: admin.entityName
        };
        
        newAdminUsers.push(newAdmin);
      }
    });
    
    if (newAdminUsers.length > 0) {
      setAdmins([...admins, ...newAdminUsers]);
    } else {
      toast.error("Uyğun entity tapılmadı. Əvvəlcə məktəb/sektor/region əlavə etməlisiniz.");
    }
  };
  
  // Handle import based on type
  const handleImport = (data: ImportedSchool[] | ImportedAdmin[]) => {
    if (importType === 'schools') {
      handleImportedSchools(data as ImportedSchool[]);
    } else {
      handleImportedAdmins(data as ImportedAdmin[]);
    }
  };
  
  // Open import dialog with specific type
  const openImportDialog = (type: 'schools' | 'admins') => {
    setImportType(type);
    setImportDialogOpen(true);
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
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => openImportDialog('schools')}>
                  <UploadCloud className="w-4 h-4 mr-2" />
                  Məktəb import et
                </Button>
                <Button variant="outline" onClick={() => openImportDialog('admins')}>
                  <UploadCloud className="w-4 h-4 mr-2" />
                  Admin import et
                </Button>
              </div>
            </div>
          </header>
          <main className="p-6 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Regionlar</CardTitle>
              </CardHeader>
              <CardContent>
                <RegionList
                  regions={regions}
                  newAdmin={newAdmin}
                  setNewAdmin={setNewAdmin}
                  handleAddAdmin={handleAddAdmin}
                  setSelectedEntity={setSelectedEntity}
                  allRegions={regions}
                  sectors={sectors}
                  schools={schools}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Sektorlar</CardTitle>
              </CardHeader>
              <CardContent>
                <SectorList
                  sectors={sectors}
                  newAdmin={newAdmin}
                  setNewAdmin={setNewAdmin}
                  handleAddAdmin={handleAddAdmin}
                  setSelectedEntity={setSelectedEntity}
                  regions={regions}
                  allSectors={sectors}
                  schools={schools}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Məktəblər</CardTitle>
              </CardHeader>
              <CardContent>
                <SchoolList
                  schools={schools}
                  newAdmin={newAdmin}
                  setNewAdmin={setNewAdmin}
                  handleAddAdmin={handleAddAdmin}
                  setSelectedEntity={setSelectedEntity}
                  regions={regions}
                  sectors={sectors}
                  allSchools={schools}
                />
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
      
      {/* Import Dialog */}
      <ImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        type={importType}
        onImport={handleImport}
      />
    </SidebarProvider>
  );
};

export default Users;
