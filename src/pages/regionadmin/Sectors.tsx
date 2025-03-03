import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle, Pencil, Trash2, Office } from "lucide-react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

interface Sector {
  id: string;
  name: string;
  regionId: string;
}

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Sektor adı ən azı 2 simvol olmalıdır.",
  }),
});

const RegionSectors = () => {
  const { user } = useAuth();
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [editingSector, setEditingSector] = useState<Sector | null>(null);
  const [deletingSector, setDeletingSector] = useState<Sector | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const fetchSectors = async () => {
    if (!user?.regionId) {
      return;
    }

    try {
      const sectorData = await api.sectors.getAll();
      const regionSectors = sectorData.filter(
        (sector) => sector.regionId === user.regionId
      );
      setSectors(regionSectors);
    } catch (error) {
      console.error("Error loading sectors:", error);
      toast.error("Failed to load sectors");
    }
  };

  useEffect(() => {
    fetchSectors();
  }, [user?.regionId]);

  const handleUpdateSector = () => {
    if (editingSector) {
    api.sectors.update(editingSector.id, editingSector.name)
      .then(() => {
        setEditingSector(null);
        fetchSectors();
        toast.success('Sektor uğurla yeniləndi');
      })
      .catch(error => {
        console.error('Error updating sector:', error);
        toast.error('Sektoru yeniləmək alınmadı');
      });
  }
};

  const handleDeleteSector = () => {
    if (deletingSector) {
      api.sectors.delete(deletingSector.id)
        .then(() => {
          setDeletingSector(null);
          fetchSectors();
          toast.success('Sektor uğurla silindi');
        })
        .catch(error => {
          console.error('Error deleting sector:', error);
          toast.error('Sektoru silmək alınmadı');
        });
    }
  };

  const handleCreateSector = (data: { name: string }) => {
  api.sectors.create(data.name)
    .then(() => {
      fetchSectors();
      toast.success('Sektor uğurla yaradıldı');
    })
    .catch(error => {
      console.error('Error creating sector:', error);
      toast.error('Sektoru yaratmaq alınmadı');
    });
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
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Sektorlar</h2>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Sektor əlavə et
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Sektor yarat</DialogTitle>
                      <DialogDescription>
                        Yeni sektoru yaratmaq üçün aşağıdakı formu doldurun.
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit(handleCreateSector)}
                        className="space-y-4"
                      >
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Sektor adı</FormLabel>
                              <FormControl>
                                <Input placeholder="Sektor adı" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <DialogFooter>
                          <Button type="submit">Yarat</Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Adı</TableHead>
                    <TableHead className="text-right">Əməliyyatlar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sectors.map((sector) => (
                    <TableRow key={sector.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Office className="w-4 h-4" />
                          <span>
                            {sector.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingSector(sector)}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Sektoru yenilə</DialogTitle>
                                <DialogDescription>
                                  Sektorun adını yeniləmək üçün aşağıdakı formu
                                  doldurun.
                                </DialogDescription>
                              </DialogHeader>
                              <Form {...form}>
                                <form
                                  onSubmit={form.handleSubmit(() =>
                                    handleUpdateSector()
                                  )}
                                  className="space-y-4"
                                >
                                  <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Sektor adı</FormLabel>
                                        <FormControl>
                                          <Input
                                            placeholder="Sektor adı"
                                            {...field}
                                            defaultValue={editingSector?.name}
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <DialogFooter>
                                    <Button type="submit">Yenilə</Button>
                                  </DialogFooter>
                                </form>
                              </Form>
                            </DialogContent>
                          </Dialog>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeletingSector(sector)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Sektoru sil</DialogTitle>
                                <DialogDescription>
                                  Bu sektoru silmək istədiyinizə əminsiniz? Bu
                                  əməliyyat geri alına bilməz.
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <Button onClick={() => setDeletingSector(null)}>
                                  Ləğv et
                                </Button>
                                <Button
                                  variant="primary"
                                  onClick={handleDeleteSector}
                                >
                                  Sil
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={2}>
                      Ümumi sektor sayı: {sectors.length}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default RegionSectors;
