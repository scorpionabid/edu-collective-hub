
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useEffect } from "react";

interface Region {
  id: number;
  name: string;
  code: string;
  sectorsCount: number;
}

const Regions = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [regions, setRegions] = useState<Region[]>([]);
  const [newRegion, setNewRegion] = useState({ name: "", code: "" });
  const [editingRegion, setEditingRegion] = useState<Region | null>(null);
  const [deletingRegion, setDeletingRegion] = useState<Region | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch regions on component mount
  useEffect(() => {
    fetchRegions();
  }, []);

  const fetchRegions = async () => {
    try {
      // In a real app, we'd use the API to fetch regions from the database
      // For now, let's just use an empty array since we want to reset mock data
      setRegions([]);
    } catch (error) {
      console.error("Error fetching regions:", error);
      toast.error("Regionlar yüklənərkən xəta baş verdi");
    }
  };

  const handleAddRegion = () => {
    if (newRegion.name.trim() && newRegion.code.trim()) {
      const newRegionObj: Region = {
        id: Date.now(),
        name: newRegion.name,
        code: newRegion.code,
        sectorsCount: 0
      };
      
      setRegions([...regions, newRegionObj]);
      setNewRegion({ name: "", code: "" });
      toast.success("Region uğurla əlavə edildi");
      setCreateDialogOpen(false);
    } else {
      toast.error("Regionun adı və kodu daxil edilməlidir");
    }
  };

  const handleUpdateRegion = () => {
    if (editingRegion && editingRegion.name.trim() && editingRegion.code.trim()) {
      setRegions(regions.map(region =>
        region.id === editingRegion.id ? editingRegion : region
      ));
      setEditingRegion(null);
      toast.success("Region uğurla yeniləndi");
      setEditDialogOpen(false);
    } else {
      toast.error("Regionun adı və kodu daxil edilməlidir");
    }
  };

  const handleDeleteRegion = () => {
    if (deletingRegion) {
      setRegions(regions.filter(region => region.id !== deletingRegion.id));
      setDeletingRegion(null);
      toast.success("Region uğurla silindi");
      setDeleteDialogOpen(false);
    }
  };

  const openEditDialog = (region: Region) => {
    setEditingRegion(region);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (region: Region) => {
    setDeletingRegion(region);
    setDeleteDialogOpen(true);
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
                <h1 className="text-xl font-semibold">Regionlar</h1>
              </div>
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Region əlavə et
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Yeni region əlavə et</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="region-name">Regionun adı</Label>
                      <Input
                        id="region-name"
                        value={newRegion.name}
                        onChange={(e) => setNewRegion({ ...newRegion, name: e.target.value })}
                        placeholder="Regionun adını daxil edin"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="region-code">Regionun kodu</Label>
                      <Input
                        id="region-code"
                        value={newRegion.code}
                        onChange={(e) => setNewRegion({ ...newRegion, code: e.target.value })}
                        placeholder="Regionun kodunu daxil edin"
                      />
                    </div>
                    <Button onClick={handleAddRegion}>Əlavə et</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </header>
          <main className="p-6">
            <Card>
              <CardHeader>
                <CardTitle>Regionların idarə edilməsi</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Regionun adı</TableHead>
                      <TableHead>Kod</TableHead>
                      <TableHead>Sektorlar</TableHead>
                      <TableHead>Əməliyyatlar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {regions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          Region tapılmadı. Zəhmət olmasa yeni region əlavə edin.
                        </TableCell>
                      </TableRow>
                    ) : (
                      regions.map((region) => (
                        <TableRow key={region.id}>
                          <TableCell className="font-medium">{region.name}</TableCell>
                          <TableCell>{region.code}</TableCell>
                          <TableCell>{region.sectorsCount} sektor</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openEditDialog(region)}
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Regionu redaktə et</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-region-name">Regionun adı</Label>
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
                                      <Label htmlFor="edit-region-code">Regionun kodu</Label>
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
                                        onClick={() => setEditDialogOpen(false)}
                                      >
                                        Ləğv et
                                      </Button>
                                      <Button onClick={handleUpdateRegion}>
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
                                    onClick={() => openDeleteDialog(region)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Regionu sil</DialogTitle>
                                    <DialogDescription>
                                      Bu regionu silmək istədiyinizə əminsiniz? Bu əməliyyat geri qaytarıla bilməz.
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
                                      onClick={handleDeleteRegion}
                                    >
                                      Sil
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
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

export default Regions;
