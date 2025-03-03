import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle, Pencil, Trash2, Office } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Sector {
  id: string;
  name: string;
  regionId: string;
  regionName?: string;
}

const SuperadminSectors = () => {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [editingSector, setEditingSector] = useState<Sector | null>(null);
  const [deletingSector, setDeletingSector] = useState<Sector | null>(null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [regionId, setRegionId] = useState('');

  // Add getById function to regions API for this page
  const loadRegionName = async (regionId: string) => {
    try {
      const regionData = await api.regions.getAll();
      const region = regionData.find(r => r.id === regionId);
      return region?.name || 'Unknown Region';
    } catch (error) {
      console.error(`Error loading region name for ${regionId}:`, error);
      return 'Unknown Region';
    }
  };

  const fetchSectors = async () => {
    try {
      const sectorData = await api.sectors.getAll();
      loadRegionNames(sectorData);
    } catch (error) {
      console.error('Error fetching sectors:', error);
      toast.error('Sektorları yükləmək alınmadı');
    }
  };

  const fetchRegions = async () => {
    try {
      const regionData = await api.regions.getAll();
      setRegions(regionData);
    } catch (error) {
      console.error('Error fetching regions:', error);
      toast.error('Regionları yükləmək alınmadı');
    }
  };

  useEffect(() => {
    fetchSectors();
    fetchRegions();
  }, []);

  // Fix the handleUpdateSector function
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

  // Fix the loadRegionNames function by adding regionId to the sector object
  const loadRegionNames = async (sectors: any[]) => {
    const sectorsWithRegionNames = await Promise.all(
      sectors.map(async (sector) => {
        if (sector.region_id) {
          const regionName = await loadRegionName(sector.region_id);
          return {
            ...sector,
            regionId: sector.region_id, // Add regionId property
            regionName
          };
        }
        return sector;
      })
    );
    
    setSectors(sectorsWithRegionNames);
  };

  // Fix the create sector function call
  const handleCreateSector = (data: { name: string; regionId: string }) => {
    api.sectors.create({
      name: data.name,
      region_id: data.regionId
    })
      .then((newSector) => {
        // Now add the regionName to the new sector
        if (newSector && newSector.region_id) {
          loadRegionName(newSector.region_id)
            .then(regionName => {
              setSectors([...sectors, {
                ...newSector,
                regionId: newSector.region_id,
                regionName
              }]);
            });
      } else {
        fetchSectors(); // Just reload all sectors
      }
      toast.success('Sektor uğurla yaradıldı');
    })
    .catch(error => {
      console.error('Error creating sector:', error);
      toast.error('Sektoru yaratmaq alınmadı');
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Sektorlar</CardTitle>
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
                Yeni sektoru yaratmaq üçün formu doldurun.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Ad
                </Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="region" className="text-right">
                  Region
                </Label>
                <Select onValueChange={setRegionId}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Region seç" />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map((region) => (
                      <SelectItem key={region.id} value={region.id}>{region.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={() => {
              handleCreateSector({ name: name, regionId: regionId });
              setOpen(false);
            }}>Yarat</Button>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Adı</TableHead>
              <TableHead>Region</TableHead>
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
                <TableCell>{sector.regionName}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => setEditingSector(sector)}>
                    <Pencil className="w-4 h-4 mr-2" />
                    Redaktə et
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeletingSector(sector)}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Sil
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <Dialog open={editingSector !== null} onOpenChange={() => setEditingSector(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sektoru redaktə et</DialogTitle>
            <DialogDescription>
              Sektorun adını dəyişdirin.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Ad
              </Label>
              <Input id="name" defaultValue={editingSector?.name} onChange={(e) => {
                if (editingSector) {
                  setEditingSector({ ...editingSector, name: e.target.value });
                }
              }} className="col-span-3" />
            </div>
          </div>
          <Button onClick={handleUpdateSector}>Yenilə</Button>
        </DialogContent>
      </Dialog>
      <Dialog open={deletingSector !== null} onOpenChange={() => setDeletingSector(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sektoru sil</DialogTitle>
            <DialogDescription>
              {deletingSector?.name} adlı sektoru silmək istədiyinizə əminsiniz?
            </DialogDescription>
          </DialogHeader>
          <Button onClick={handleDeleteSector}>Sil</Button>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default SuperadminSectors;
