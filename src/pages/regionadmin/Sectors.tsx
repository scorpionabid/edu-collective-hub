import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface Sector {
  id: string;
  name: string;
  region_id: string;
}

const RegionSectors = () => {
  const { user } = useAuth();
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showAddDialog, setShowAddDialog] = useState<boolean>(false);
  const [showEditDialog, setShowEditDialog] = useState<boolean>(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [currentSector, setCurrentSector] = useState<Sector | null>(null);
  const [newSectorName, setNewSectorName] = useState<string>("");

  useEffect(() => {
    fetchSectors();
  }, [user]);

  const fetchSectors = async () => {
    if (!user?.regionId) return;
    
    setIsLoading(true);
    try {
      const allSectors = await api.sectors.getAll();
      const regionSectors = allSectors.filter(
        sector => sector.region_id === user.regionId
      );
      
      const formattedSectors = regionSectors.map(sector => ({
        id: sector.id,
        name: sector.name,
        region_id: sector.region_id
      }));
      
      setSectors(formattedSectors);
    } catch (error) {
      console.error("Error fetching sectors:", error);
      toast.error("Failed to load sectors");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSector = async () => {
    if (!newSectorName.trim()) {
      toast.error("Sector name cannot be empty");
      return;
    }

    if (!user?.regionId) {
      toast.error("Region ID is required");
      return;
    }

    setIsLoading(true);
    try {
      const newSector = await api.sectors.create({
        name: newSectorName,
        region_id: user.regionId
      });

      setSectors([...sectors, { 
        id: newSector.id, 
        name: newSector.name,
        region_id: newSector.region_id
      }]);
      
      setShowAddDialog(false);
      setNewSectorName("");
      toast.success("Sector added successfully");
    } catch (error) {
      console.error("Error adding sector:", error);
      toast.error("Failed to add sector");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSector = async () => {
    if (!currentSector) return;
    if (!newSectorName.trim()) {
      toast.error("Sector name cannot be empty");
      return;
    }

    setIsLoading(true);
    try {
      const updatedSector = await api.sectors.update(currentSector.id, {
        name: newSectorName
      });

      setSectors(sectors.map(sector => 
        sector.id === currentSector.id 
          ? { ...sector, name: newSectorName } 
          : sector
      ));
      
      setShowEditDialog(false);
      setCurrentSector(null);
      setNewSectorName("");
      toast.success("Sector updated successfully");
    } catch (error) {
      console.error("Error updating sector:", error);
      toast.error("Failed to update sector");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSector = async () => {
    if (!currentSector) return;

    setIsLoading(true);
    try {
      await api.sectors.delete(currentSector.id);
      setSectors(sectors.filter(sector => sector.id !== currentSector.id));
      setShowDeleteDialog(false);
      setCurrentSector(null);
      toast.success("Sector deleted successfully");
    } catch (error) {
      console.error("Error deleting sector:", error);
      toast.error("Failed to delete sector");
    } finally {
      setIsLoading(false);
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
                <h1 className="text-xl font-semibold">Sektorlar</h1>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowAddDialog(true)}>
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
                                  setCurrentSector(sector);
                                  setShowEditDialog(true);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7"
                                onClick={() => {
                                  setCurrentSector(sector);
                                  setShowDeleteDialog(true);
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
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
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
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Ləğv et
            </Button>
            <Button onClick={handleAddSector} disabled={isLoading}>
              {isLoading ? "Əlavə edilir..." : "Əlavə et"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Sector Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
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
                value={newSectorName}
                onChange={(e) => setNewSectorName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Ləğv et
            </Button>
            <Button onClick={handleEditSector} disabled={isLoading}>
              {isLoading ? "Yenilənir..." : "Yadda saxla"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Sector Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sektoru sil</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Bu sektoru silmək istədiyinizə əminsiniz? Bu əməliyyat geri qaytarıla bilməz.</p>
            <p className="font-medium mt-2">{currentSector?.name}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
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
