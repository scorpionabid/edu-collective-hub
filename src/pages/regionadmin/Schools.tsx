
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  PlusCircle, 
  School,
  Edit, 
  Trash2,
  FileDown,
  Search
} from "lucide-react";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface School {
  id: string;
  name: string;
  sectorId: string;
  regionId: string;
  address?: string;
  phone?: string;
  email?: string;
}

interface Sector {
  id: string;
  name: string;
  regionId: string;
}

const RegionSchools = () => {
  const { user } = useAuth();
  const [schools, setSchools] = useState<School[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSectorFilter, setSelectedSectorFilter] = useState<string>("");
  
  const [newSchool, setNewSchool] = useState<Omit<School, "id">>({
    name: "",
    sectorId: "",
    regionId: user?.regionId || "",
    address: "",
    phone: "",
    email: ""
  });
  
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [deletingSchool, setDeletingSchool] = useState<School | null>(null);

  useEffect(() => {
    // Load sectors for this region
    const storedSectors = localStorage.getItem("sectors");
    if (storedSectors && user?.regionId) {
      const allSectors = JSON.parse(storedSectors);
      const filteredSectors = allSectors.filter((sector: Sector) => sector.regionId === user.regionId);
      setSectors(filteredSectors);
    }

    // Load schools for this region
    const storedSchools = localStorage.getItem("schools");
    if (storedSchools && user?.regionId) {
      const allSchools = JSON.parse(storedSchools);
      const filteredSchools = allSchools.filter((school: School) => school.regionId === user.regionId);
      setSchools(filteredSchools);
    } else {
      // Mock data if no stored data
      const mockSchools: School[] = [
        { 
          id: "1", 
          name: "Məktəb 1", 
          sectorId: "1", 
          regionId: user?.regionId || "1",
          address: "Bakı şəhəri, Nəsimi rayonu",
          phone: "+994 12 345 67 89",
          email: "mekteb1@example.com"
        },
        { 
          id: "2", 
          name: "Məktəb 2", 
          sectorId: "2", 
          regionId: user?.regionId || "1",
          address: "Bakı şəhəri, Yasamal rayonu",
          phone: "+994 12 345 67 90",
          email: "mekteb2@example.com"
        },
      ];
      setSchools(mockSchools);
      localStorage.setItem("schools", JSON.stringify(mockSchools));
    }
  }, [user]);

  const handleAddSchool = () => {
    if (!newSchool.name.trim()) {
      toast.error("Məktəb adı daxil edin");
      return;
    }

    if (!newSchool.sectorId) {
      toast.error("Sektor seçin");
      return;
    }

    const schoolToAdd: School = {
      id: Date.now().toString(),
      ...newSchool,
      regionId: user?.regionId || "1"
    };

    // Get all schools and add the new one
    const storedSchools = localStorage.getItem("schools");
    let allSchools = storedSchools ? JSON.parse(storedSchools) : [];
    allSchools.push(schoolToAdd);
    localStorage.setItem("schools", JSON.stringify(allSchools));

    // Update sector's schoolsCount
    const storedSectors = localStorage.getItem("sectors");
    if (storedSectors) {
      let allSectors = JSON.parse(storedSectors);
      const sectorIndex = allSectors.findIndex((s: Sector) => s.id === schoolToAdd.sectorId);
      if (sectorIndex !== -1) {
        const sectorSchools = allSchools.filter((s: School) => s.sectorId === schoolToAdd.sectorId);
        allSectors[sectorIndex].schoolsCount = sectorSchools.length;
        localStorage.setItem("sectors", JSON.stringify(allSectors));
        
        // Update local sectors state
        setSectors(prevSectors => 
          prevSectors.map(sector => 
            sector.id === schoolToAdd.sectorId 
              ? { ...sector, schoolsCount: sectorSchools.length } 
              : sector
          )
        );
      }
    }

    // Update state
    setSchools([...schools, schoolToAdd]);
    setNewSchool({
      name: "",
      sectorId: "",
      regionId: user?.regionId || "",
      address: "",
      phone: "",
      email: ""
    });
    setIsAddDialogOpen(false);
    toast.success("Məktəb uğurla əlavə edildi");
  };

  const handleEditSchool = () => {
    if (!editingSchool || !editingSchool.name.trim()) {
      toast.error("Məktəb adı daxil edin");
      return;
    }

    if (!editingSchool.sectorId) {
      toast.error("Sektor seçin");
      return;
    }

    // Get original school to check if sector changed
    const originalSchool = schools.find(s => s.id === editingSchool.id);
    const sectorChanged = originalSchool && originalSchool.sectorId !== editingSchool.sectorId;

    // Update in localStorage
    const storedSchools = localStorage.getItem("schools");
    if (storedSchools) {
      let allSchools = JSON.parse(storedSchools);
      const index = allSchools.findIndex((s: School) => s.id === editingSchool.id);
      if (index !== -1) {
        allSchools[index] = editingSchool;
        localStorage.setItem("schools", JSON.stringify(allSchools));
      }

      // If sector changed, update both sectors' schoolsCount
      if (sectorChanged && originalSchool) {
        const storedSectors = localStorage.getItem("sectors");
        if (storedSectors) {
          let allSectors = JSON.parse(storedSectors);
          
          // Update old sector count
          const oldSectorIndex = allSectors.findIndex((s: Sector) => s.id === originalSchool.sectorId);
          if (oldSectorIndex !== -1) {
            const oldSectorSchools = allSchools.filter((s: School) => s.sectorId === originalSchool.sectorId);
            allSectors[oldSectorIndex].schoolsCount = oldSectorSchools.length;
          }
          
          // Update new sector count
          const newSectorIndex = allSectors.findIndex((s: Sector) => s.id === editingSchool.sectorId);
          if (newSectorIndex !== -1) {
            const newSectorSchools = allSchools.filter((s: School) => s.sectorId === editingSchool.sectorId);
            allSectors[newSectorIndex].schoolsCount = newSectorSchools.length;
          }
          
          localStorage.setItem("sectors", JSON.stringify(allSectors));
          
          // Update local sectors state
          setSectors(allSectors.filter((sector: Sector) => sector.regionId === user?.regionId));
        }
      }
    }

    // Update state
    setSchools(schools.map(school => 
      school.id === editingSchool.id ? editingSchool : school
    ));
    setEditingSchool(null);
    setIsEditDialogOpen(false);
    toast.success("Məktəb uğurla yeniləndi");
  };

  const handleDeleteSchool = () => {
    if (!deletingSchool) return;

    // Update in localStorage
    const storedSchools = localStorage.getItem("schools");
    if (storedSchools) {
      let allSchools = JSON.parse(storedSchools);
      allSchools = allSchools.filter((s: School) => s.id !== deletingSchool.id);
      localStorage.setItem("schools", JSON.stringify(allSchools));

      // Update sector's schoolsCount
      const storedSectors = localStorage.getItem("sectors");
      if (storedSectors) {
        let allSectors = JSON.parse(storedSectors);
        const sectorIndex = allSectors.findIndex((s: Sector) => s.id === deletingSchool.sectorId);
        if (sectorIndex !== -1) {
          const sectorSchools = allSchools.filter((s: School) => s.sectorId === deletingSchool.sectorId);
          allSectors[sectorIndex].schoolsCount = sectorSchools.length;
          localStorage.setItem("sectors", JSON.stringify(allSectors));
          
          // Update local sectors state
          setSectors(prevSectors => 
            prevSectors.map(sector => 
              sector.id === deletingSchool.sectorId 
                ? { ...sector, schoolsCount: sectorSchools.length } 
                : sector
            )
          );
        }
      }
    }

    // Update state
    setSchools(schools.filter(school => school.id !== deletingSchool.id));
    setDeletingSchool(null);
    setIsDeleteDialogOpen(false);
    toast.success("Məktəb uğurla silindi");
  };

  const handleExportSchools = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "ID,Name,Sector,Address,Phone,Email\n" + 
      schools.map(school => {
        const sector = sectors.find(s => s.id === school.sectorId);
        return `${school.id},${school.name},${sector?.name || ''},${school.address || ''},${school.phone || ''},${school.email || ''}`;
      }).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "schools.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Məktəblər uğurla export edildi");
  };

  // Filter schools based on search and sector filter
  const filteredSchools = schools.filter(school => {
    const matchesSearch = school.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = selectedSectorFilter ? school.sectorId === selectedSectorFilter : true;
    return matchesSearch && matchesSector;
  });

  // Get sector name by ID
  const getSectorName = (sectorId: string) => {
    const sector = sectors.find(s => s.id === sectorId);
    return sector ? sector.name : "Unknown Sector";
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
                <h1 className="text-xl font-semibold">Məktəblər</h1>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleExportSchools}>
                  <FileDown className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Yeni Məktəb
                </Button>
              </div>
            </div>
          </header>

          <main className="p-6">
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Məktəb axtar..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select
                    value={selectedSectorFilter}
                    onValueChange={setSelectedSectorFilter}
                  >
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <SelectValue placeholder="Sektor seç" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Bütün sektorlar</SelectItem>
                      {sectors.map((sector) => (
                        <SelectItem key={sector.id} value={sector.id}>
                          {sector.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Region Məktəbləri</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="py-3 px-4 text-left">Məktəb adı</th>
                        <th className="py-3 px-4 text-left">Sektor</th>
                        <th className="py-3 px-4 text-left">Ünvan</th>
                        <th className="py-3 px-4 text-left">Əlaqə</th>
                        <th className="py-3 px-4 text-right">Əməliyyatlar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSchools.length > 0 ? (
                        filteredSchools.map((school) => (
                          <tr key={school.id} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <School className="h-4 w-4 text-muted-foreground" />
                                {school.name}
                              </div>
                            </td>
                            <td className="py-3 px-4">{getSectorName(school.sectorId)}</td>
                            <td className="py-3 px-4">{school.address || '-'}</td>
                            <td className="py-3 px-4">
                              <div>
                                {school.phone && <div>{school.phone}</div>}
                                {school.email && <div className="text-sm text-muted-foreground">{school.email}</div>}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8"
                                  onClick={() => {
                                    setEditingSchool(school);
                                    setIsEditDialogOpen(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8"
                                  onClick={() => {
                                    setDeletingSchool(school);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-muted-foreground">
                            Məktəb tapılmadı
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>

      {/* Add School Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Yeni Məktəb əlavə et</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="school-name">Məktəb adı</Label>
              <Input
                id="school-name"
                placeholder="Məktəb adını daxil edin"
                value={newSchool.name}
                onChange={(e) => setNewSchool({...newSchool, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="school-sector">Sektor</Label>
              <Select
                value={newSchool.sectorId}
                onValueChange={(value) => setNewSchool({...newSchool, sectorId: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sektor seçin" />
                </SelectTrigger>
                <SelectContent>
                  {sectors.map((sector) => (
                    <SelectItem key={sector.id} value={sector.id}>
                      {sector.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="school-address">Ünvan</Label>
              <Input
                id="school-address"
                placeholder="Məktəbin ünvanını daxil edin"
                value={newSchool.address || ""}
                onChange={(e) => setNewSchool({...newSchool, address: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="school-phone">Telefon</Label>
              <Input
                id="school-phone"
                placeholder="Məktəbin telefon nömrəsini daxil edin"
                value={newSchool.phone || ""}
                onChange={(e) => setNewSchool({...newSchool, phone: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="school-email">Email</Label>
              <Input
                id="school-email"
                placeholder="Məktəbin email ünvanını daxil edin"
                value={newSchool.email || ""}
                onChange={(e) => setNewSchool({...newSchool, email: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Ləğv et
            </Button>
            <Button onClick={handleAddSchool}>
              Əlavə et
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit School Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Məktəbi redaktə et</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-school-name">Məktəb adı</Label>
              <Input
                id="edit-school-name"
                placeholder="Məktəb adını daxil edin"
                value={editingSchool?.name || ""}
                onChange={(e) => setEditingSchool(editingSchool ? {...editingSchool, name: e.target.value} : null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-school-sector">Sektor</Label>
              <Select
                value={editingSchool?.sectorId || ""}
                onValueChange={(value) => setEditingSchool(editingSchool ? {...editingSchool, sectorId: value} : null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sektor seçin" />
                </SelectTrigger>
                <SelectContent>
                  {sectors.map((sector) => (
                    <SelectItem key={sector.id} value={sector.id}>
                      {sector.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-school-address">Ünvan</Label>
              <Input
                id="edit-school-address"
                placeholder="Məktəbin ünvanını daxil edin"
                value={editingSchool?.address || ""}
                onChange={(e) => setEditingSchool(editingSchool ? {...editingSchool, address: e.target.value} : null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-school-phone">Telefon</Label>
              <Input
                id="edit-school-phone"
                placeholder="Məktəbin telefon nömrəsini daxil edin"
                value={editingSchool?.phone || ""}
                onChange={(e) => setEditingSchool(editingSchool ? {...editingSchool, phone: e.target.value} : null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-school-email">Email</Label>
              <Input
                id="edit-school-email"
                placeholder="Məktəbin email ünvanını daxil edin"
                value={editingSchool?.email || ""}
                onChange={(e) => setEditingSchool(editingSchool ? {...editingSchool, email: e.target.value} : null)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Ləğv et
            </Button>
            <Button onClick={handleEditSchool}>
              Yadda saxla
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete School Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Məktəbi sil</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Bu məktəbi silmək istədiyinizə əminsiniz? Bu əməliyyat geri qaytarıla bilməz.</p>
            <p className="font-medium mt-2">{deletingSchool?.name}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Ləğv et
            </Button>
            <Button variant="destructive" onClick={handleDeleteSchool}>
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default RegionSchools;
