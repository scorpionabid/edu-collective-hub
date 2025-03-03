import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle, Building, Pencil, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { sectors } from "@/lib/api/sectors";
import { regions } from "@/lib/api/regions";
import { Region } from "@/lib/api/types";

interface Sector {
  id: string;
  name: string;
  regionId?: string;
}

const SuperadminSectors = () => {
  const { user } = useAuth();
  const [sectorsData, setSectorsData] = useState<Sector[]>([]);
  const [regionsData, setRegionsData] = useState<Region[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingSector, setEditingSector] = useState<Sector | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deletingSector, setDeletingSector] = useState<Sector | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const fetchSectors = async () => {
    const fetchedSectors = await sectors.getAll();
    setSectorsData(fetchedSectors);
  };

  const fetchRegions = async () => {
    const fetchedRegions = await regions.getAll();
    setRegionsData(fetchedRegions);
  };

  useEffect(() => {
    fetchSectors();
    fetchRegions();
  }, []);

  const handleAddSector = async (data: { name: string, region_id: string }) => {
    try {
      // Using create with name and regionId parameters
      await sectors.create(data.name, data.region_id);
      toast.success('Sector created successfully');
      fetchSectors();
      setAddDialogOpen(false);
    } catch (error) {
      toast.error('Failed to create sector');
    }
  };

  const handleUpdateSector = async (data: { name: string }) => {
    if (!editingSector) return;
    
    try {
      // Using update with id and name parameters
      await sectors.update(editingSector.id, data.name);
      toast.success('Sector updated successfully');
      fetchSectors();
      setEditDialogOpen(false);
      setEditingSector(null);
    } catch (error) {
      toast.error('Failed to update sector');
    }
  };

  const handleDeleteSector = async () => {
    if (!deletingSector) return;

    try {
      await sectors.delete(deletingSector.id);
      toast.success("Sektor uğurla silindi");
      fetchSectors();
      setDeleteDialogOpen(false);
      setDeletingSector(null);
    } catch (error) {
      toast.error("Sektoru silərkən xəta baş verdi");
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Sectors</CardTitle>
          <CardDescription>Manage sectors here.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Button onClick={() => setAddDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Sector
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Region</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sectorsData.map((sector) => (
                <TableRow key={sector.id}>
                  <TableCell>{sector.name}</TableCell>
                  <TableCell>
                    {regionsData.find((region) => region.id === sector.regionId)?.name || "N/A"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditingSector(sector);
                          setEditDialogOpen(true);
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          setDeletingSector(sector);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <h2 className="text-lg font-medium">Add Sector</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              handleAddSector({
                name: formData.get("name") as string,
                region_id: formData.get("region_id") as string,
              });
            }}
            className="grid gap-4 py-4"
          >
            <div className="grid gap-2">
              <label htmlFor="name" className="text-right text-sm font-medium leading-none">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:text-muted-foreground file:h-10 file:px-2 file:select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="region_id" className="text-right text-sm font-medium leading-none">
                Region
              </label>
              <select
                id="region_id"
                name="region_id"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:text-muted-foreground file:h-10 file:px-2 file:select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select Region</option>
                {regionsData.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.name}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit">Add Sector</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <h2 className="text-lg font-medium">Edit Sector</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              handleUpdateSector({
                name: formData.get("name") as string,
              });
            }}
            className="grid gap-4 py-4"
          >
            <div className="grid gap-2">
              <label htmlFor="name" className="text-right text-sm font-medium leading-none">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                defaultValue={editingSector?.name}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:text-muted-foreground file:h-10 file:px-2 file:select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <Button type="submit">Update Sector</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <h2 className="text-lg font-medium">Delete Sector</h2>
          <p className="mb-5">Are you sure you want to delete this sector?</p>
          <div className="flex justify-end space-x-2">
            <Button variant="secondary" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteSector}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SuperadminSectors;
