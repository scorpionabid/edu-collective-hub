
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
import { PlusCircle, Pencil, Trash2, BuildingIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface Sector {
  id: number;
  name: string;
  code: string;
  regionId: number;
  schoolsCount: number;
}

interface Region {
  id: number;
  name: string;
}

const Sectors = () => {
  const { user } = useAuth();
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<number | null>(null);
  const [newSector, setNewSector] = useState({ name: "", code: "", regionId: "" });
  const [editingSector, setEditingSector] = useState<Sector | null>(null);
  const [deletingSector, setDeletingSector] = useState<Sector | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch regions and sectors on component mount
  useEffect(() => {
    fetchRegions();
    fetchSectors();
  }, []);

  const fetchRegions = async () => {
    try {
      // In a real app, we'd use the API to fetch regions from the database
      // For now, let's set up a storage system using localStorage
      const storedRegions = localStorage.getItem('regions');
      if (storedRegions) {
        setRegions(JSON.parse(storedRegions));
      } else {
        setRegions([]);
      }
    } catch (error) {
      console.error("Error fetching regions:", error);
      toast.error("Regionlar yüklənərkən xəta baş verdi");
    }
  };

  const fetchSectors = async () => {
    try {
      // In a real app, we'd use the API to fetch sectors from the database
      // For now, let's set up a storage system using localStorage
      const storedSectors = localStorage.getItem('sectors');
      if (storedSectors) {
        setSectors(JSON.parse(storedSectors));
      } else {
        setSectors([]);
      }
    } catch (error) {
      console.error("Error fetching sectors:", error);
      toast.error("Sektorlar yüklənərkən xəta baş verdi");
    }
  };

  const handleAddSector = () => {
    if (newSector.name.trim() && newSector.code.trim() && newSector.regionId) {
      const regionId = parseInt(newSector.regionId);
      const newSectorObj: Sector = {
        id: Date.now(),
        name: newSector.name,
        code: newSector.code,
        regionId: regionId,
        schoolsCount: 0
      };
      
      const updatedSectors = [...sectors, newSectorObj];
      setSectors(updatedSectors);
      localStorage.setItem('sectors', JSON.stringify(updatedSectors));
      
      setNewSector({ name: "", code: "", regionId: "" });
      toast.success("Sektor uğurla əlavə edildi");
      setCreateDialogOpen(false);
    } else {
      toast.error("Sektorun adı, kodu və regionu daxil edilməlidir");
    }
  };

  const handleUpdateSector = () => {
    if (editingSector && editingSector.name.trim() && editingSector.code.trim()) {
      const updatedSectors = sectors.map(sector =>
        sector.id === editingSector.id ? editingSector : sector
      );
      
      setSectors(updatedSectors);
      localStorage.setItem('sectors', JSON.stringify(updatedSectors));
      
      setEditingSector(null);
      toast.success("Sektor uğurla yeniləndi");
      setEditDialogOpen(false);
    } else {
      toast.error("Sektorun adı və kodu daxil edilməlidir");
    }
  };

  const handleDeleteSector = () => {
    if (deletingSector) {
      const updatedSectors = sectors.filter(sector => sector.id !== deletingSector.id);
      setSectors(updatedSectors);
      localStorage.setItem('sectors', JSON.stringify(updatedSectors));
      
      setDeletingSector(null);
      toast.success("Sektor uğurla silindi");
      setDeleteDialogOpen(false);
    }
  };

  const openEditDialog = (sector: Sector) => {
    setEditingSector(sector);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (sector: Sector) => {
    setDeletingSector(sector);
    setDeleteDialogOpen(true);
  };

  const filteredSectors = selectedRegion
    ? sectors.filter(sector => sector.regionId === selectedRegion)
    : sectors;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1">
          <header className="bg-white shadow">
            <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <h1 className="text-xl font-semibold">Sektorlar</h1>
              </div>
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Sektor əlavə et
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Yeni sektor əlavə et</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="sector-name">Sektorun adı</Label>
                      <Input
                        id="sector-name"
                        value={newSector.name}
                        onChange={(e) => setNewSector({ ...newSector, name: e.target.value })}
                        placeholder="Sektorun adını daxil edin"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sector-code">Sektorun kodu</Label>
                      <Input
                        id="sector-code"
                        value={newSector.code}
                        onChange={(e) => setNewSector({ ...newSector, code: e.target.value })}
                        placeholder="Sektorun kodunu daxil edin"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sector-region">Region</Label>
                      <Select 
                        value={newSector.regionId} 
                        onValueChange={(value) => setNewSector({ ...newSector, regionId: value })}
                      >
                        <SelectTrigger id="sector-region">
                          <SelectValue placeholder="Region seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          {regions.length === 0 ? (
                            <SelectItem disabled value="no-regions">
                              Region tapılmadı
                            </SelectItem>
                          ) : (
                            regions.map((region) => (
                              <SelectItem key={region.id} value={region.id.toString()}>
                                {region.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleAddSector}>Əlavə et</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </header>
          <main className="p-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Sektorların idarə edilməsi</CardTitle>
                <div className="flex items-center gap-4">
                  <Select
                    value={selectedRegion?.toString()}
                    onValueChange={(value) => setSelectedRegion(value ? Number(value) : null)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Region seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Bütün regionlar</SelectItem>
                      {regions.map((region) => (
                        <SelectItem key={region.id} value={region.id.toString()}>
                          {region.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sektorun adı</TableHead>
                      <TableHead>Kod</TableHead>
                      <TableHead>Region</TableHead>
                      <TableHead>Məktəblər</TableHead>
                      <TableHead>Əməliyyatlar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSectors.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          Sektor tapılmadı. Zəhmət olmasa yeni sektor əlavə edin.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSectors.map((sector) => {
                        const regionName = regions.find(r => r.id === sector.regionId)?.name || "N/A";
                        return (
                          <TableRow key={sector.id}>
                            <TableCell>{sector.name}</TableCell>
                            <TableCell>{sector.code}</TableCell>
                            <TableCell>{regionName}</TableCell>
                            <TableCell>{sector.schoolsCount} məktəb</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => openEditDialog(sector)}
                                    >
                                      <Pencil className="w-4 h-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Sektoru redaktə et</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div className="space-y-2">
                                        <Label htmlFor="edit-sector-name">Sektorun adı</Label>
                                        <Input
                                          id="edit-sector-name"
                                          value={editingSector?.name || ""}
                                          onChange={(e) => setEditingSector(editingSector ? {
                                            ...editingSector,
                                            name: e.target.value
                                          } : null)}
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="edit-sector-code">Sektorun kodu</Label>
                                        <Input
                                          id="edit-sector-code"
                                          value={editingSector?.code || ""}
                                          onChange={(e) => setEditingSector(editingSector ? {
                                            ...editingSector,
                                            code: e.target.value
                                          } : null)}
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="edit-sector-region">Region</Label>
                                        <Select 
                                          value={editingSector?.regionId.toString()} 
                                          onValueChange={(value) => setEditingSector(editingSector ? {
                                            ...editingSector,
                                            regionId: parseInt(value)
                                          } : null)}
                                        >
                                          <SelectTrigger id="edit-sector-region">
                                            <SelectValue placeholder="Region seçin" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {regions.map((region) => (
                                              <SelectItem key={region.id} value={region.id.toString()}>
                                                {region.name}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div className="flex justify-end gap-2">
                                        <Button
                                          variant="outline"
                                          onClick={() => setEditDialogOpen(false)}
                                        >
                                          Ləğv et
                                        </Button>
                                        <Button onClick={handleUpdateSector}>
                                          Yadda saxla
                                        </Button>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => openDeleteDialog(sector)}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Sektoru sil</DialogTitle>
                                      <DialogDescription>
                                        Bu sektoru silmək istədiyinizə əminsiniz? Bu əməliyyat geri qaytarıla bilməz.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="flex justify-end gap-2">
                                      <Button
                                        variant="outline"
                                        onClick={() => setDeleteDialogOpen(false)}
                                      >
                                        Ləğv et
                                      </Button>
                                      <Button
                                        variant="destructive"
                                        onClick={handleDeleteSector}
                                      >
                                        Sil
                                      </Button>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
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

export default Sectors;
