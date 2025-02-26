
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
import { PlusCircle, Pencil, Trash2, BuildingIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Sector {
  id: number;
  name: string;
  code: string;
  regionId: number;
  schoolsCount: number;
}

interface Region {
  id: number;
  name: string;
}

const Sectors = () => {
  const { user } = useAuth();
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [regions, setRegions] = useState<Region[]>([
    { id: 1, name: "Bakı" },
    { id: 2, name: "Sumqayıt" },
    { id: 3, name: "Gəncə" },
  ]);
  const [selectedRegion, setSelectedRegion] = useState<number | null>(null);
  const [newSector, setNewSector] = useState({ name: "", code: "" });
  const [editingSector, setEditingSector] = useState<Sector | null>(null);
  const [deletingSector, setDeletingSector] = useState<Sector | null>(null);

  const handleAddSector = () => {
    if (newSector.name.trim() && newSector.code.trim() && selectedRegion) {
      setSectors([
        ...sectors,
        {
          id: Date.now(),
          name: newSector.name,
          code: newSector.code,
          regionId: selectedRegion,
          schoolsCount: 0
        }
      ]);
      setNewSector({ name: "", code: "" });
      toast.success("Sektor uğurla əlavə edildi");
    }
  };

  const handleUpdateSector = () => {
    if (editingSector && editingSector.name.trim()) {
      setSectors(sectors.map(sector =>
        sector.id === editingSector.id ? editingSector : sector
      ));
      setEditingSector(null);
      toast.success("Sektor uğurla yeniləndi");
    }
  };

  const handleDeleteSector = () => {
    if (deletingSector) {
      setSectors(sectors.filter(sector => sector.id !== deletingSector.id));
      setDeletingSector(null);
      toast.success("Sektor uğurla silindi");
    }
  };

  const filteredSectors = selectedRegion
    ? sectors.filter(sector => sector.regionId === selectedRegion)
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
                <h1 className="text-xl font-semibold">Sektorlar</h1>
              </div>
            </div>
          </header>
          <main className="p-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Sektorların idarə edilməsi</CardTitle>
                <div className="flex items-center gap-4">
                  <Select
                    value={selectedRegion?.toString()}
                    onValueChange={(value) => setSelectedRegion(Number(value))}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Region seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map((region) => (
                        <SelectItem key={region.id} value={region.id.toString()}>
                          {region.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Sektor əlavə et
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Yeni sektor əlavə et</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="sector-name">Sektorun adı</Label>
                          <Input
                            id="sector-name"
                            value={newSector.name}
                            onChange={(e) => setNewSector({ ...newSector, name: e.target.value })}
                            placeholder="Sektorun adını daxil edin"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="sector-code">Sektorun kodu</Label>
                          <Input
                            id="sector-code"
                            value={newSector.code}
                            onChange={(e) => setNewSector({ ...newSector, code: e.target.value })}
                            placeholder="Sektorun kodunu daxil edin"
                          />
                        </div>
                        <Button onClick={handleAddSector}>Əlavə et</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sektorun adı</TableHead>
                      <TableHead>Kod</TableHead>
                      <TableHead>Məktəblər</TableHead>
                      <TableHead>Əməliyyatlar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSectors.map((sector) => (
                      <TableRow key={sector.id}>
                        <TableCell>{sector.name}</TableCell>
                        <TableCell>{sector.code}</TableCell>
                        <TableCell>{sector.schoolsCount} məktəb</TableCell>
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
                                  <DialogTitle>Sektoru redaktə et</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-sector-name">Sektorun adı</Label>
                                    <Input
                                      id="edit-sector-name"
                                      value={editingSector?.name || ""}
                                      onChange={(e) => setEditingSector(editingSector ? {
                                        ...editingSector,
                                        name: e.target.value
                                      } : null)}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-sector-code">Sektorun kodu</Label>
                                    <Input
                                      id="edit-sector-code"
                                      value={editingSector?.code || ""}
                                      onChange={(e) => setEditingSector(editingSector ? {
                                        ...editingSector,
                                        code: e.target.value
                                      } : null)}
                                    />
                                  </div>
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      variant="outline"
                                      onClick={() => setEditingSector(null)}
                                    >
                                      Ləğv et
                                    </Button>
                                    <Button onClick={handleUpdateSector}>
                                      Yadda saxla
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
                                  onClick={() => setDeletingSector(sector)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Sektoru sil</DialogTitle>
                                  <DialogDescription>
                                    Bu sektoru silmək istədiyinizə əminsiniz? Bu əməliyyat geri qaytarıla bilməz.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    onClick={() => setDeletingSector(null)}
                                  >
                                    Ləğv et
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    onClick={handleDeleteSector}
                                  >
                                    Sil
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
