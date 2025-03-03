import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
// Import correct icons (replace Office with a valid icon like Building)
import { PlusCircle, Building, Pencil, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { sectors } from "@/lib/api/sectors";
import { regions } from "@/lib/api/regions";
import { Input } from "@/components/ui/input";

interface Sector {
  id: string;
  name: string;
  regionId?: string;
}

const RegionSectors = () => {
  const { user } = useAuth();
  const [sectorsData, setSectors] = useState<Sector[]>([]);
  const [regionsData, setRegions] = useState([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingSector, setEditingSector] = useState<Sector | null>(null);
  const [deletingSector, setDeletingSector] = useState<Sector | null>(null);

  // Fetch sectors and regions on component mount
  useEffect(() => {
    fetchSectors();
    fetchRegions();
  }, [user]);

  // Fetch sectors for the current region
  const fetchSectors = async () => {
    const fetchedSectors = await sectors.getAll(user?.regionId);
    // Transform the returned data to match the Sector type
    setSectors(fetchedSectors.map(sector => ({
      id: sector.id,
      name: sector.name,
      regionId: sector.region_id
    })));
  };

  // Fetch all regions
  const fetchRegions = async () => {
    const fetchedRegions = await regions.getAll();
    setRegions(fetchedRegions);
  };

  // Handle adding a new sector
  const handleAddSector = async (name: string) => {
    await sectors.create(name, user?.regionId);
    fetchSectors();
  };

  // Handle updating an existing sector
  const handleUpdateSector = async (id: string, name: string) => {
    await sectors.update(id, name);
    fetchSectors();
  };

  // Handle deleting a sector
  const handleDeleteSector = async (id: string) => {
    await sectors.delete(id);
    fetchSectors();
  };

  const handleAction = (sector: any) => {
    toast.info(`Clicked action for sector: ${sector.name}`);
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
                <h1 className="text-xl font-semibold">Region Sectors</h1>
              </div>
            </div>
          </header>
          <main className="p-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Sectors</CardTitle>
                  <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Add Sector
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Add New Sector</h3>
                        <Input
                          placeholder="Sector Name"
                          onKeyDown={async (e) => {
                            if (e.key === "Enter") {
                              await handleAddSector(e.currentTarget.value);
                              setAddDialogOpen(false);
                            }
                          }}
                        />
                        <Button onClick={() => setAddDialogOpen(false)}>
                          Cancel
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
                        <TableHead>Region</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sectorsData.map((sector) => (
                        <TableRow key={sector.id}>
                          <TableCell>{sector.name}</TableCell>
                          <TableCell>
                            {regionsData.find((region: any) => region.id === sector.regionId)?.name || "N/A"}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="default" onClick={() => handleAction(sector)}>
                                Action
                              </Button>
                              <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setEditingSector(sector);
                                      setEditDialogOpen(true);
                                    }}
                                  >
                                    <Pencil className="w-4 h-4 mr-2" />
                                    Edit
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  {editingSector && (
                                    <div className="space-y-4">
                                      <h3 className="text-lg font-medium">Edit Sector</h3>
                                      <Input
                                        defaultValue={editingSector.name}
                                        onKeyDown={async (e) => {
                                          if (e.key === "Enter") {
                                            await handleUpdateSector(editingSector.id, e.currentTarget.value);
                                            setEditDialogOpen(false);
                                          }
                                        }}
                                      />
                                      <Button onClick={() => setEditDialogOpen(false)}>
                                        Cancel
                                      </Button>
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="destructive"
                                    onClick={() => setDeletingSector(sector)}
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <div className="space-y-4">
                                    <h3 className="text-lg font-medium">Confirm Deletion</h3>
                                    <p>Are you sure you want to delete {deletingSector?.name}?</p>
                                    <div className="flex justify-end gap-2">
                                      <Button onClick={() => setDeletingSector(null)}>
                                        Cancel
                                      </Button>
                                      <Button
                                        variant="destructive"
                                        onClick={async () => {
                                          if (deletingSector) {
                                            await handleDeleteSector(deletingSector.id);
                                            setDeletingSector(null);
                                          }
                                        }}
                                      >
                                        Delete
                                      </Button>
                                    </div>
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
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default RegionSectors;
