
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Pencil, Trash2, Building2 } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface Sector {
  id: string;
  name: string;
  region_id: string;
  regionName?: string;
  schoolsCount?: number;
}

interface Region {
  id: string;
  name: string;
}

const Sectors = () => {
  const { user } = useAuth();
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showAddDialog, setShowAddDialog] = useState<boolean>(false);
  const [showEditDialog, setShowEditDialog] = useState<boolean>(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [currentSector, setCurrentSector] = useState<Sector | null>(null);
  const [newSectorName, setNewSectorName] = useState<string>("");
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [filterRegion, setFilterRegion] = useState<string>("");

  useEffect(() => {
    Promise.all([fetchSectors(), fetchRegions()]).finally(() => {
      setIsLoading(false);
    });
  }, []);

  const fetchSectors = async () => {
    try {
      const allSectors = await api.sectors.getAll();
      
      // Enhance sectors with region names
      const sectorsWithRegionNames = await Promise.all(
        allSectors.map(async (sector) => {
          let regionName = "Not assigned";
          if (sector.region_id) {
            try {
              const region = await api.regions.getById(sector.region_id);
              regionName = region?.name || "Unknown region";
            } catch (error) {
              console.error(`Error fetching region for sector ${sector.id}:`, error);
            }
          }
          return { ...sector, regionName };
        })
      );
      
      setSectors(sectorsWithRegionNames);
    } catch (error) {
      console.error("Error fetching sectors:", error);
      toast.error("Failed to load sectors");
    }
  };

  const fetchRegions = async () => {
    try {
      const allRegions = await api.regions.getAll();
      setRegions(allRegions);
    } catch (error) {
      console.error("Error fetching regions:", error);
      toast.error("Failed to load regions");
    }
  };

  const handleAddSector = async () => {
    if (!newSectorName.trim()) {
      toast.error("Sector name cannot be empty");
      return;
    }

    setIsLoading(true);
    try {
      const newSector = await api.sectors.create({
        name: newSectorName,
        region_id: selectedRegion || undefined
      });

      // Get region name for display
      let regionName = "Not assigned";
      if (newSector.region_id) {
        try {
          const region = await api.regions.getById(newSector.region_id);
          regionName = region?.name || "Unknown region";
        } catch (error) {
          console.error(`Error fetching region for new sector:`, error);
        }
      }

      setSectors([...sectors, { ...newSector, regionName }]);
      
      setShowAddDialog(false);
      setNewSectorName("");
      setSelectedRegion("");
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
        name: newSectorName,
        region_id: selectedRegion || undefined
      });

      // Get region name for display
      let regionName = "Not assigned";
      if (updatedSector.region_id) {
        try {
          const region = await api.regions.getById(updatedSector.region_id);
          regionName = region?.name || "Unknown region";
        } catch (error) {
          console.error(`Error fetching region for updated sector:`, error);
        }
      }

      setSectors(sectors.map(sector => 
        sector.id === currentSector.id 
          ? { ...updatedSector, regionName } 
          : sector
      ));
      
      setShowEditDialog(false);
      setCurrentSector(null);
      setNewSectorName("");
      setSelectedRegion("");
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

  // Get filtered sectors based on selected region
  const filteredSectors = filterRegion 
    ? sectors.filter(sector => sector.region_id === filterRegion)
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
                <h1 className="text-xl font-semibold">Sectors</h1>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowAddDialog(true)}>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add Sector
                </Button>
              </div>
            </div>
          </header>

          <main className="p-6">
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="w-full max-w-xs">
                    <Label htmlFor="region-filter">Filter by Region</Label>
                    <Select
                      value={filterRegion}
                      onValueChange={setFilterRegion}
                    >
                      <SelectTrigger id="region-filter">
                        <SelectValue placeholder="All Regions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Regions</SelectItem>
                        {regions.map((region) => (
                          <SelectItem key={region.id} value={region.id}>
                            {region.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>All Sectors</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center p-4">Loading...</div>
                ) : filteredSectors.length === 0 ? (
                  <div className="text-center p-4">No sectors found</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sector Name</TableHead>
                        <TableHead>Region</TableHead>
                        <TableHead>Schools Count</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSectors.map((sector) => (
                        <TableRow key={sector.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <Building2 className="w-4 h-4 mr-2 text-muted-foreground" />
                              {sector.name}
                            </div>
                          </TableCell>
                          <TableCell>{sector.regionName}</TableCell>
                          <TableCell>{sector.schoolsCount || 0}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => {
                                  setCurrentSector(sector);
                                  setNewSectorName(sector.name);
                                  setSelectedRegion(sector.region_id || "");
                                  setShowEditDialog(true);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => {
                                  setCurrentSector(sector);
                                  setShowDeleteDialog(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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
            <DialogTitle>Add New Sector</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="sector-name">Sector Name</Label>
              <Input
                id="sector-name"
                placeholder="Enter sector name"
                value={newSectorName}
                onChange={(e) => setNewSectorName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sector-region">Region</Label>
              <Select
                value={selectedRegion}
                onValueChange={setSelectedRegion}
              >
                <SelectTrigger id="sector-region">
                  <SelectValue placeholder="Select a region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Region</SelectItem>
                  {regions.map((region) => (
                    <SelectItem key={region.id} value={region.id}>
                      {region.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowAddDialog(false);
              setNewSectorName("");
              setSelectedRegion("");
            }}>
              Cancel
            </Button>
            <Button onClick={handleAddSector} disabled={isLoading || !newSectorName.trim()}>
              {isLoading ? "Adding..." : "Add Sector"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Sector Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Sector</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-sector-name">Sector Name</Label>
              <Input
                id="edit-sector-name"
                placeholder="Enter sector name"
                value={newSectorName}
                onChange={(e) => setNewSectorName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-sector-region">Region</Label>
              <Select
                value={selectedRegion}
                onValueChange={setSelectedRegion}
              >
                <SelectTrigger id="edit-sector-region">
                  <SelectValue placeholder="Select a region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Region</SelectItem>
                  {regions.map((region) => (
                    <SelectItem key={region.id} value={region.id}>
                      {region.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowEditDialog(false);
              setCurrentSector(null);
              setNewSectorName("");
              setSelectedRegion("");
            }}>
              Cancel
            </Button>
            <Button onClick={handleEditSector} disabled={isLoading || !newSectorName.trim()}>
              {isLoading ? "Updating..." : "Update Sector"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Sector Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Sector</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this sector? This action cannot be undone.</p>
            <p className="font-medium mt-2">{currentSector?.name}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteSector} disabled={isLoading}>
              {isLoading ? "Deleting..." : "Delete Sector"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default Sectors;
