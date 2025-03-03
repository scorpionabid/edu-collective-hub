
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import { Sector } from "@/lib/api/types";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { SectorList } from "@/components/sectors/SectorList";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const RegionSectors = () => {
  const { user } = useAuth();
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newSectorName, setNewSectorName] = useState("");
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    fetchSectors();
  }, []);

  const fetchSectors = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const allSectors = await api.sectors.getAll();
      // Filter sectors based on user's region
      const filteredSectors = allSectors.filter(
        sector => sector.region_id === user.regionId
      );
      setSectors(filteredSectors);
    } catch (error) {
      console.error("Error fetching sectors:", error);
      toast.error("Failed to load sectors");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSector = async () => {
    if (!newSectorName.trim() || !user?.regionId) {
      toast.error("Please enter a sector name");
      return;
    }

    try {
      setIsLoading(true);
      await api.sectors.create({
        name: newSectorName,
        region_id: user.regionId
      });
      setNewSectorName("");
      setOpenDialog(false);
      toast.success("Sector created successfully");
      fetchSectors();
    } catch (error) {
      console.error("Error creating sector:", error);
      toast.error("Failed to create sector");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSector = async (sectorId: string) => {
    try {
      setIsLoading(true);
      await api.sectors.delete(sectorId);
      toast.success("Sector deleted successfully");
      fetchSectors();
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
                <h1 className="text-xl font-semibold">Region Sectors</h1>
              </div>
            </div>
          </header>
          <main className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium">Manage Sectors</h2>
              <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Create Sector
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <h2 className="text-xl font-semibold mb-4">Create New Sector</h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="sectorName">Sector Name</Label>
                      <Input
                        id="sectorName"
                        value={newSectorName}
                        onChange={(e) => setNewSectorName(e.target.value)}
                        placeholder="Enter sector name"
                      />
                    </div>
                    <Button
                      onClick={handleCreateSector}
                      disabled={isLoading || !newSectorName.trim()}
                    >
                      {isLoading ? "Creating..." : "Create Sector"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Sectors</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center my-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <SectorList 
                    sectors={sectors} 
                    onDelete={handleDeleteSector}
                    onRefresh={fetchSectors}
                  />
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default RegionSectors;
