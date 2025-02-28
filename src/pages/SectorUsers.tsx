
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2, UserPlus } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface SchoolData {
  id: string;
  name: string;
  adminId?: string;
}

interface SchoolAdmin {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  schoolId: string;
  schoolName: string;
}

const SectorUsers = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [schools, setSchools] = useState<SchoolData[]>([]);
  const [admins, setAdmins] = useState<SchoolAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<SchoolAdmin | null>(null);
  
  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");

  useEffect(() => {
    // Check if user is a sector admin
    if (user && user.role !== 'sectoradmin') {
      navigate('/');
      return;
    }

    // Fetch schools and admins
    // In a real application, these would be API calls
    setTimeout(() => {
      const mockSchools = [
        { id: "1", name: "Məktəb 1", adminId: "1" },
        { id: "2", name: "Məktəb 2", adminId: "2" },
        { id: "3", name: "Məktəb 3" },
      ];
      
      const mockAdmins = [
        { 
          id: "1", 
          firstName: "Əli", 
          lastName: "Əliyev", 
          email: "ali@example.com", 
          phone: "055-123-45-67", 
          schoolId: "1",
          schoolName: "Məktəb 1"
        },
        { 
          id: "2", 
          firstName: "Aysel", 
          lastName: "Məmmədova", 
          email: "aysel@example.com", 
          phone: "050-987-65-43", 
          schoolId: "2",
          schoolName: "Məktəb 2"
        },
      ];
      
      setSchools(mockSchools);
      setAdmins(mockAdmins);
      setLoading(false);
    }, 1000);
  }, [user, navigate]);

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setPassword("");
    setSelectedSchool("");
    setSelectedAdmin(null);
  };

  const handleCreateAdmin = () => {
    if (!firstName || !lastName || !email || !phone || !password || !selectedSchool) {
      toast.error("Bütün xanaları doldurun");
      return;
    }

    const school = schools.find(s => s.id === selectedSchool);
    if (!school) return;

    const newAdmin: SchoolAdmin = {
      id: String(Date.now()),
      firstName,
      lastName,
      email,
      phone,
      schoolId: selectedSchool,
      schoolName: school.name
    };

    setAdmins([...admins, newAdmin]);
    
    // Update school's adminId
    setSchools(schools.map(school => 
      school.id === selectedSchool ? { ...school, adminId: newAdmin.id } : school
    ));

    toast.success("Məktəb admini uğurla əlavə edildi");
    setCreateDialogOpen(false);
    resetForm();
  };

  const handleEditAdmin = () => {
    if (!selectedAdmin) return;
    if (!firstName || !lastName || !email || !phone || !selectedSchool) {
      toast.error("Bütün xanaları doldurun");
      return;
    }

    const school = schools.find(s => s.id === selectedSchool);
    if (!school) return;

    // Check if the admin is being reassigned to a different school
    const isSchoolChanged = selectedAdmin.schoolId !== selectedSchool;

    if (isSchoolChanged) {
      // Remove admin from old school
      setSchools(schools.map(school => 
        school.id === selectedAdmin.schoolId ? { ...school, adminId: undefined } : school
      ));
      
      // Assign admin to new school
      setSchools(schools.map(school => 
        school.id === selectedSchool ? { ...school, adminId: selectedAdmin.id } : school
      ));
    }

    // Update admin
    setAdmins(admins.map(admin => 
      admin.id === selectedAdmin.id ? {
        ...admin,
        firstName,
        lastName,
        email,
        phone,
        schoolId: selectedSchool,
        schoolName: school.name
      } : admin
    ));

    toast.success("Məktəb admini uğurla yeniləndi");
    setEditDialogOpen(false);
    resetForm();
  };

  const handleDeleteAdmin = () => {
    if (!selectedAdmin) return;

    // Remove admin from school
    setSchools(schools.map(school => 
      school.id === selectedAdmin.schoolId ? { ...school, adminId: undefined } : school
    ));

    // Delete admin
    setAdmins(admins.filter(admin => admin.id !== selectedAdmin.id));

    toast.success("Məktəb admini uğurla silindi");
    setDeleteDialogOpen(false);
    resetForm();
  };

  const openEditDialog = (admin: SchoolAdmin) => {
    setSelectedAdmin(admin);
    setFirstName(admin.firstName);
    setLastName(admin.lastName);
    setEmail(admin.email);
    setPhone(admin.phone);
    setSelectedSchool(admin.schoolId);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (admin: SchoolAdmin) => {
    setSelectedAdmin(admin);
    setDeleteDialogOpen(true);
  };

  const availableSchools = schools.filter(school => 
    !school.adminId || (selectedAdmin && school.adminId === selectedAdmin.id)
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1">
          <header className="bg-white shadow">
            <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <h1 className="text-xl font-semibold">Məktəb Adminləri</h1>
              </div>
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Yeni Admin
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Məktəb Admini Əlavə Et</DialogTitle>
                    <DialogDescription>
                      Məktəb üçün yeni admin təyin edin
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Ad</Label>
                        <Input
                          id="firstName"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Soyad</Label>
                        <Input
                          id="lastName"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefon</Label>
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Şifrə</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="school">Məktəb</Label>
                      <Select
                        value={selectedSchool}
                        onValueChange={setSelectedSchool}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Məktəb seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableSchools.map(school => (
                            <SelectItem key={school.id} value={school.id}>
                              {school.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => {
                      setCreateDialogOpen(false);
                      resetForm();
                    }}>
                      Ləğv et
                    </Button>
                    <Button onClick={handleCreateAdmin}>Əlavə et</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </header>

          <main className="p-6">
            <Card>
              <CardHeader>
                <CardTitle>Məktəb Adminləri</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center h-32">
                    <p>Yüklənir...</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ad</TableHead>
                        <TableHead>Soyad</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Telefon</TableHead>
                        <TableHead>Məktəb</TableHead>
                        <TableHead>Əməliyyatlar</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {admins.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center">Heç bir məktəb admini tapılmadı</TableCell>
                        </TableRow>
                      ) : (
                        admins.map(admin => (
                          <TableRow key={admin.id}>
                            <TableCell>{admin.firstName}</TableCell>
                            <TableCell>{admin.lastName}</TableCell>
                            <TableCell>{admin.email}</TableCell>
                            <TableCell>{admin.phone}</TableCell>
                            <TableCell>{admin.schoolName}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openEditDialog(admin)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => openDeleteDialog(admin)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Məktəb Adminini Redaktə Et</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-firstName">Ad</Label>
                <Input
                  id="edit-firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-lastName">Soyad</Label>
                <Input
                  id="edit-lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Telefon</Label>
              <Input
                id="edit-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-school">Məktəb</Label>
              <Select
                value={selectedSchool}
                onValueChange={setSelectedSchool}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Məktəb seçin" />
                </SelectTrigger>
                <SelectContent>
                  {availableSchools.map(school => (
                    <SelectItem key={school.id} value={school.id}>
                      {school.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setEditDialogOpen(false);
              resetForm();
            }}>
              Ləğv et
            </Button>
            <Button onClick={handleEditAdmin}>Yadda saxla</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Məktəb Adminini Sil</DialogTitle>
            <DialogDescription>
              Bu əməliyyat geri qaytarıla bilməz. Adminini silmək istədiyinizə əminsiniz?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setDeleteDialogOpen(false);
              resetForm();
            }}>
              Ləğv et
            </Button>
            <Button variant="destructive" onClick={handleDeleteAdmin}>Sil</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default SectorUsers;
