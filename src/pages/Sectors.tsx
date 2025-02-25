
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
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Region {
  id: number;
  name: string;
}

interface Sector {
  id: number;
  name: string;
  email: string;
  phone: string;
  regionId: number;
  regionName: string;
  adminName: string | null;
}

interface NewSector {
  name: string;
  email: string;
  phone: string;
  regionId: string;
}

const Sectors = () => {
  const { user } = useAuth();
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [newSector, setNewSector] = useState<NewSector>({
    name: "",
    email: "",
    phone: "",
    regionId: "",
  });
  const [editingSector, setEditingSector] = useState<Sector | null>(null);
  const [deletingSector, setDeletingSector] = useState<Sector | null>(null);

  // Mock regions data
  const regions: Region[] = [
    { id: 1, name: "Region 1" },
    { id: 2, name: "Region 2" },
  ];

  const handleAddSector = () => {
    if (validateSectorData(newSector)) {
      const region = regions.find(r => r.id === parseInt(newSector.regionId));
      setSectors([
        ...sectors,
        {
          id: Date.now(),
          ...newSector,
          regionId: parseInt(newSector.regionId),
          regionName: region?.name || "",
          adminName: null,
        },
      ]);
      setNewSector({
        name: "",
        email: "",
        phone: "",
        regionId: "",
      });
      toast.success("Sector added successfully");
    }
  };

  const validateSectorData = (data: NewSector): boolean => {
    if (!data.name.trim()) {
      toast.error("Name is required");
      return false;
    }
    if (!data.email.trim() || !data.email.includes("@")) {
      toast.error("Valid email is required");
      return false;
    }
    if (!data.phone.trim()) {
      toast.error("Phone number is required");
      return false;
    }
    if (!data.regionId) {
      toast.error("Please select a region");
      return false;
    }
    return true;
  };

  const handleUpdateSector = () => {
    if (editingSector) {
      setSectors(sectors.map(sector => 
        sector.id === editingSector.id ? editingSector : sector
      ));
      setEditingSector(null);
      toast.success("Sector updated successfully");
    }
  };

  const handleDeleteSector = () => {
    if (deletingSector) {
      setSectors(sectors.filter(sector => sector.id !== deletingSector.id));
      setDeletingSector(null);
      toast.success("Sector deleted successfully");
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
                <h1 className="text-xl font-semibold">Sectors</h1>
              </div>
            </div>
          </header>
          <main className="p-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Sector Management</CardTitle>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Add Sector
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Sector</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="region">Region</Label>
                        <Select
                          value={newSector.regionId}
                          onValueChange={(value) => setNewSector({ ...newSector, regionId: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Region" />
                          </SelectTrigger>
                          <SelectContent>
                            {regions.map(region => (
                              <SelectItem key={region.id} value={String(region.id)}>
                                {region.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="name">Sector Name</Label>
                        <Input
                          id="name"
                          value={newSector.name}
                          onChange={(e) => setNewSector({ ...newSector, name: e.target.value })}
                          placeholder="Enter sector name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newSector.email}
                          onChange={(e) => setNewSector({ ...newSector, email: e.target.value })}
                          placeholder="Enter email"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={newSector.phone}
                          onChange={(e) => setNewSector({ ...newSector, phone: e.target.value })}
                          placeholder="Enter phone number"
                        />
                      </div>
                      <Button onClick={handleAddSector}>Add Sector</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Region</TableHead>
                      <TableHead>Administrator</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sectors.map((sector) => (
                      <TableRow key={sector.id}>
                        <TableCell>{sector.name}</TableCell>
                        <TableCell>{sector.email}</TableCell>
                        <TableCell>{sector.phone}</TableCell>
                        <TableCell>{sector.regionName}</TableCell>
                        <TableCell>{sector.adminName || "No admin assigned"}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setEditingSector(sector)}
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Edit Sector</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-region">Region</Label>
                                    <Select
                                      value={String(editingSector?.regionId)}
                                      onValueChange={(value) => 
                                        setEditingSector(prev => prev ? {
                                          ...prev,
                                          regionId: parseInt(value),
                                          regionName: regions.find(r => r.id === parseInt(value))?.name || ""
                                        } : null)
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select Region" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {regions.map(region => (
                                          <SelectItem key={region.id} value={String(region.id)}>
                                            {region.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-name">Sector Name</Label>
                                    <Input
                                      id="edit-name"
                                      value={editingSector?.name}
                                      onChange={(e) => 
                                        setEditingSector(prev => prev ? {
                                          ...prev,
                                          name: e.target.value
                                        } : null)
                                      }
                                      placeholder="Enter sector name"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-email">Email</Label>
                                    <Input
                                      id="edit-email"
                                      type="email"
                                      value={editingSector?.email}
                                      onChange={(e) => 
                                        setEditingSector(prev => prev ? {
                                          ...prev,
                                          email: e.target.value
                                        } : null)
                                      }
                                      placeholder="Enter email"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-phone">Phone Number</Label>
                                    <Input
                                      id="edit-phone"
                                      value={editingSector?.phone}
                                      onChange={(e) => 
                                        setEditingSector(prev => prev ? {
                                          ...prev,
                                          phone: e.target.value
                                        } : null)
                                      }
                                      placeholder="Enter phone number"
                                    />
                                  </div>
                                  <Button onClick={handleUpdateSector}>Update Sector</Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => setDeletingSector(sector)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Delete Sector</DialogTitle>
                                  <DialogDescription>
                                    Are you sure you want to delete this sector? This action cannot be undone.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    onClick={() => setDeletingSector(null)}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    onClick={handleDeleteSector}
                                  >
                                    Delete
                                  </Button>
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
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Sectors;
