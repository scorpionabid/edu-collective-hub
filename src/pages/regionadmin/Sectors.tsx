
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  PlusCircle, 
  Building,
  Edit, 
  Trash2,
  FileDown
} from "lucide-react";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface Sector {
  id: string;
  name: string;
  region_id: string;
}

const RegionSectors = () => {
  const { user } = useAuth();
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newSectorName, setNewSectorName] = useState("");
  const [editingSector, setEditingSector] = useState<Sector | null>(null);
  const [deletingSector, setDeletingSector] = useState<Sector | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadSectors = async () => {
    if (user?.regionId) {
      try {
        setIsLoading(true);
        const data = await api.sectors.getAll(user.regionId);
        setSectors(data);
      } catch (error) {
        console.error("Error loading sectors:", error);
        toast.error("Sektorları yükləmək mümkün olmadı");
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    loadSectors();
  }, [user]);

  const handleAddSector = async () => {
    if (!newSectorName.trim()) {
      toast.error("Sektor adı daxil edin");
      return;
    }

    try {
      setIsLoading(true);
      if (user?.regionId) {
        const newSector = await api.sectors.create(newSectorName, user.regionId);
        setSectors([...sectors, newSector]);
        setNewSectorName("");
        setIsAddDialogOpen(false);
        toast.success("Sektor uğurla əlavə edildi");
      } else {
        toast.error("Region ID tapılmadı");
      }
    } catch (error) {
      console.error("Error adding sector:", error);
      toast.error("Sektor əlavə etmək mümkün olmadı");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSector = async () => {
    if (!editingSector || !editingSector.name.trim()) {
      toast.error("Sektor adı daxil edin");
      return;
    }

    try {
      setIsLoading(true);
      const updatedSector = await api.sectors.update(editingSector.id, editingSector.name);
      setSectors(sectors.map(sector => 
        sector.id === updatedSector.id ? updatedSector : sector
      ));
      setEditingSector(null);
      setIsEditDialogOpen(false);
      toast.success("Sektor uğurla yeniləndi");
    } catch (error) {
      console.error("Error updating sector:", error);
      toast.error("Sektoru yeniləmək mümkün olmadı");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSector = async () => {
    if (!deletingSector) return;

    try {
      setIsLoading(true);
      await api.sectors.delete(deletingSector.id);
      setSectors(sectors.filter(sector => sector.id !== deletingSector.id));
      setDeletingSector(null);
      setIsDeleteDialogOpen(false);
      toast.success("Sektor uğurla silindi");
    } catch (error) {
      console.error("Error deleting sector:", error);
      toast.error("Sektoru silmək mümkün olmadı");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportSectors = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "ID,Name,Region ID\n" + 
      sectors.map(sector => `${sector.id},${sector.name},${sector.region_id}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "sectors.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Sektorlar uğurla export edildi");
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
                <h1 className="text-xl font-semibold">Sektorlar</h1>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleExportSectors}>
                  <FileDown className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Yeni Sektor
                </Button>
              </div>
            </div>
          </header>

          <main className="p-6">
            <Card>
              <CardHeader>
                <CardTitle>Regionun Sektorları</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center p-4">Yüklənir...</div>
                ) : sectors.length === 0 ? (
                  <div className="text-center p-4">Heç bir sektor tapılmadı</div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {sectors.map((sector) => (
                      <Card key={sector.id} className="overflow-hidden">
                        <CardHeader className="bg-primary/5 pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-base flex items-center">
                              <Building className="w-4 h-4 mr-2" />
                              {sector.name}
                            </CardTitle>
                            <div className="flex space-x-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7"
                                onClick={() => {
                                  setEditingSector(sector);
                                  setIsEditDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7"
                                onClick={() => {
                                  setDeletingSector(sector);
                                  setIsDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <div className="mt-4">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full"
                              onClick={() => {
                                /* Handle view sector details */
                              }}
                            >
                              Ətraflı bax
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>

      {/* Add Sector Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Sektor əlavə et</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="sector-name">Sektor adı</Label>
              <Input
                id="sector-name"
                placeholder="Sektor adını daxil edin"
                value={newSectorName}
                onChange={(e) => setNewSectorName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Ləğv et
            </Button>
            <Button onClick={handleAddSector} disabled={isLoading}>
              {isLoading ? "Əlavə edilir..." : "Əlavə et"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Sector Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sektoru redaktə et</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-sector-name">Sektor adı</Label>
              <Input
                id="edit-sector-name"
                placeholder="Sektor adını daxil edin"
                value={editingSector?.name || ""}
                onChange={(e) => setEditingSector(editingSector ? {...editingSector, name: e.target.value} : null)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Ləğv et
            </Button>
            <Button onClick={handleEditSector} disabled={isLoading}>
              {isLoading ? "Yenilənir..." : "Yadda saxla"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Sector Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sektoru sil</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Bu sektoru silmək istədiyinizə əminsiniz? Bu əməliyyat geri qaytarıla bilməz.</p>
            <p className="font-medium mt-2">{deletingSector?.name}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Ləğv et
            </Button>
            <Button variant="destructive" onClick={handleDeleteSector} disabled={isLoading}>
              {isLoading ? "Silinir..." : "Sil"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default RegionSectors;
