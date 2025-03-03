
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, PlusCircle, Pencil, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";

const Regions = () => {
  const { user } = useAuth();
  const [regions, setRegions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentRegion, setCurrentRegion] = useState(null);
  const [newRegionName, setNewRegionName] = useState("");

  useEffect(() => {
    fetchRegions();
  }, []);

  const fetchRegions = async () => {
    setIsLoading(true);
    try {
      const data = await api.regions.getAll();
      setRegions(data);
    } catch (error) {
      console.error("Error fetching regions:", error);
      toast.error("Failed to load regions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRegion = async () => {
    if (!newRegionName.trim()) {
      toast.error("Region name cannot be empty");
      return;
    }

    setIsLoading(true);
    try {
      const newRegion = await api.regions.create({
        name: newRegionName
      });

      setRegions([...regions, newRegion]);
      setShowAddDialog(false);
      setNewRegionName("");
      toast.success("Region added successfully");
    } catch (error) {
      console.error("Error adding region:", error);
      toast.error("Failed to add region");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditRegion = async () => {
    if (!currentRegion) return;
    if (!newRegionName.trim()) {
      toast.error("Region name cannot be empty");
      return;
    }

    setIsLoading(true);
    try {
      const updatedRegion = await api.regions.update(currentRegion.id, {
        name: newRegionName
      });

      setRegions(regions.map(region => 
        region.id === currentRegion.id 
          ? { ...region, name: newRegionName } 
          : region
      ));
      
      setShowEditDialog(false);
      setCurrentRegion(null);
      setNewRegionName("");
      toast.success("Region updated successfully");
    } catch (error) {
      console.error("Error updating region:", error);
      toast.error("Failed to update region");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRegion = async () => {
    if (!currentRegion) return;

    setIsLoading(true);
    try {
      await api.regions.delete(currentRegion.id);
      setRegions(regions.filter(region => region.id !== currentRegion.id));
      setShowDeleteDialog(false);
      setCurrentRegion(null);
      toast.success("Region deleted successfully");
    } catch (error) {
      console.error("Error deleting region:", error);
      toast.error("Failed to delete region");
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
                <h1 className="text-xl font-semibold">Regions</h1>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowAddDialog(true)}>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add Region
                </Button>
              </div>
            </div>
          </header>

          <main className="p-6">
            <Card>
              <CardHeader>
                <CardTitle>All Regions</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center p-4">Loading...</div>
                ) : regions.length === 0 ? (
                  <div className="text-center p-4">No regions found</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Region Name</TableHead>
                        <TableHead>Sectors Count</TableHead>
                        <TableHead>Schools Count</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {regions.map((region) => (
                        <TableRow key={region.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                              {region.name}
                            </div>
                          </TableCell>
                          <TableCell>{region.sectorsCount || 0}</TableCell>
                          <TableCell>{region.schoolsCount || 0}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => {
                                  setCurrentRegion(region);
                                  setNewRegionName(region.name);
                                  setShowEditDialog(true);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => {
                                  setCurrentRegion(region);
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

      {/* Add Region Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Region</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="region-name">Region Name</Label>
              <Input
                id="region-name"
                placeholder="Enter region name"
                value={newRegionName}
                onChange={(e) => setNewRegionName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddRegion} disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Region"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Region Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Region</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-region-name">Region Name</Label>
              <Input
                id="edit-region-name"
                placeholder="Enter region name"
                value={newRegionName}
                onChange={(e) => setNewRegionName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditRegion} disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Region"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Region Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Region</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this region? This action cannot be undone.</p>
            <p className="font-medium mt-2">{currentRegion?.name}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteRegion} disabled={isLoading}>
              {isLoading ? "Deleting..." : "Delete Region"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default Regions;
