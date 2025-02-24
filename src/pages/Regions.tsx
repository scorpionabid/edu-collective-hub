
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { PlusCircle, Pencil, Trash2, BuildingIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Region {
  id: number;
  name: string;
  code: string;
  sectorsCount: number;
}

const Regions = () => {
  const { user } = useAuth();
  const [regions, setRegions] = useState<Region[]>([]);
  const [newRegion, setNewRegion] = useState({ name: "", code: "" });
  const [editingRegion, setEditingRegion] = useState<Region | null>(null);
  const [deletingRegion, setDeletingRegion] = useState<Region | null>(null);

  const handleAddRegion = () => {
    if (newRegion.name.trim() && newRegion.code.trim()) {
      setRegions([
        ...regions,
        { 
          id: Date.now(), 
          name: newRegion.name, 
          code: newRegion.code,
          sectorsCount: 0
        }
      ]);
      setNewRegion({ name: "", code: "" });
      toast.success("Region added successfully");
    }
  };

  const handleUpdateRegion = () => {
    if (editingRegion && editingRegion.name.trim()) {
      setRegions(regions.map(region => 
        region.id === editingRegion.id ? editingRegion : region
      ));
      setEditingRegion(null);
      toast.success("Region updated successfully");
    }
  };

  const handleDeleteRegion = () => {
    if (deletingRegion) {
      setRegions(regions.filter(region => region.id !== deletingRegion.id));
      setDeletingRegion(null);
      toast.success("Region deleted successfully");
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
            </div>
          </header>
          <main className="p-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Manage Regions</CardTitle>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Add Region
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Region</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="region-name">Region Name</Label>
                        <Input
                          id="region-name"
                          value={newRegion.name}
                          onChange={(e) => setNewRegion({ ...newRegion, name: e.target.value })}
                          placeholder="Enter region name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="region-code">Region Code</Label>
                        <Input
                          id="region-code"
                          value={newRegion.code}
                          onChange={(e) => setNewRegion({ ...newRegion, code: e.target.value })}
                          placeholder="Enter region code"
                        />
                      </div>
                      <Button onClick={handleAddRegion}>Add Region</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Region Name</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Sectors</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {regions.map((region) => (
                      <TableRow key={region.id}>
                        <TableCell>{region.name}</TableCell>
                        <TableCell>{region.code}</TableCell>
                        <TableCell>{region.sectorsCount} sectors</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setEditingRegion(region)}
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Edit Region</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-region-name">Region Name</Label>
                                    <Input
                                      id="edit-region-name"
                                      value={editingRegion?.name || ""}
                                      onChange={(e) => setEditingRegion(editingRegion ? {
                                        ...editingRegion,
                                        name: e.target.value
                                      } : null)}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-region-code">Region Code</Label>
                                    <Input
                                      id="edit-region-code"
                                      value={editingRegion?.code || ""}
                                      onChange={(e) => setEditingRegion(editingRegion ? {
                                        ...editingRegion,
                                        code: e.target.value
                                      } : null)}
                                    />
                                  </div>
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      variant="outline"
                                      onClick={() => setEditingRegion(null)}
                                    >
                                      Cancel
                                    </Button>
                                    <Button onClick={handleUpdateRegion}>
                                      Save Changes
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => setDeletingRegion(region)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Delete Region</DialogTitle>
                                  <DialogDescription>
                                    Are you sure you want to delete this region? This will also delete all sectors associated with it. This action cannot be undone.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    onClick={() => setDeletingRegion(null)}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    onClick={handleDeleteRegion}
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

export default Regions;
