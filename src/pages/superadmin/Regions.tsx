import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { RegionForm } from "@/components/regions/RegionForm";

interface Region {
  id: string;
  name: string;
  created_at: string;
}

const SuperadminRegions = () => {
  const { user } = useAuth();
  const [regions, setRegions] = useState<Region[]>([]);
  const [editingRegion, setEditingRegion] = useState<Region | null>(null);
  const [deletingRegion, setDeletingRegion] = useState<Region | null>(null);

  const fetchRegions = async () => {
    try {
      const regionsData = await api.regions.getAll();
      setRegions(regionsData);
    } catch (error) {
      console.error('Error fetching regions:', error);
      toast.error('Failed to load regions');
    }
  };

  useEffect(() => {
    fetchRegions();
  }, []);

  const handleCreateRegion = (data: { name: string }) => {
    // Convert object parameter to string
    api.regions.create(data.name)
      .then(() => {
        fetchRegions();
        toast.success('Region uğurla yaradıldı');
      })
      .catch(error => {
        console.error('Error creating region:', error);
        toast.error('Regionu yaratmaq alınmadı');
      });
  };

  const handleUpdateRegion = () => {
    if (editingRegion) {
      // Convert object parameter to string
      api.regions.update(editingRegion.id, editingRegion.name)
        .then(() => {
          setEditingRegion(null);
          fetchRegions();
          toast.success('Region uğurla yeniləndi');
        })
        .catch(error => {
          console.error('Error updating region:', error);
          toast.error('Regionu yeniləmək alınmadı');
        });
    }
  };

  const handleDeleteRegion = () => {
    if (deletingRegion) {
      api.regions.delete(deletingRegion.id)
        .then(() => {
          setDeletingRegion(null);
          fetchRegions();
          toast.success('Region uğurla silindi');
        })
        .catch(error => {
          console.error('Error deleting region:', error);
          toast.error('Regionu silmək alınmadı');
        });
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
            <div className="grid gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Regionlar</CardTitle>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Region əlavə et
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <RegionForm onSubmit={handleCreateRegion} />
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Region adı</TableHead>
                        <TableHead>Əməliyyatlar</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {regions.map((region) => (
                        <TableRow key={region.id}>
                          <TableCell>{region.name}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    onClick={() => setEditingRegion(region)}
                                  >
                                    <Pencil className="w-4 h-4 mr-2" />
                                    Redaktə et
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <RegionForm
                                    initialData={editingRegion}
                                    onSubmit={handleUpdateRegion}
                                  />
                                </DialogContent>
                              </Dialog>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="destructive"
                                    onClick={() => setDeletingRegion(region)}
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Sil
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <div className="flex flex-col space-y-4">
                                    <h2 className="text-lg font-semibold">
                                      Regionu silmək istədiyinizə əminsiniz?
                                    </h2>
                                    <div className="flex justify-end space-x-2">
                                      <Button
                                        variant="secondary"
                                        onClick={() => setDeletingRegion(null)}
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

export default SuperadminRegions;
