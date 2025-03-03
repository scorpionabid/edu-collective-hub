import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  PlusCircle,
  School as SchoolIcon,
  Pencil,
  Trash2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { SchoolForm } from "@/components/schools/SchoolForm";
import { api } from "@/lib/api";
import { Sector } from "@/components/sectors/SectorList";
import { Region } from "@/components/regions/RegionList";

interface School {
  id: string;
  name: string;
  address?: string;
  email?: string;
  phone?: string;
  sector_id: string;
  sectorName?: string;
  regionId?: string;
  regionName?: string;
}

const SuperadminSchools = () => {
  const { user } = useAuth();
  const [schools, setSchools] = useState<School[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [deletingSchool, setDeletingSchool] = useState<School | null>(null);

  useEffect(() => {
    fetchSchools();
    loadSectors();
    loadRegions();
  }, []);

  const fetchSchools = async () => {
    try {
      const schoolData = await api.schools.getAll();
      setSchools(schoolData as School[]);
    } catch (error) {
      console.error("Error loading schools:", error);
      toast.error("Failed to load schools");
    }
  };

  const loadSectors = async () => {
    try {
      const sectorData = await api.sectors.getAll();
      // Transform the data to match the Sector type
      const transformedSectors = sectorData.map(sector => ({
        id: sector.id,
        name: sector.name,
        regionId: sector.region_id || ""
      }));
      setSectors(transformedSectors);
    } catch (error) {
      console.error('Error loading sectors:', error);
      toast.error('Failed to load sectors');
    }
  };

  const loadRegions = async () => {
    try {
      const regionData = await api.regions.getAll();
      setRegions(regionData as Region[]);
    } catch (error) {
      console.error("Error loading regions:", error);
      toast.error("Failed to load regions");
    }
  };

  const handleCreateSchool = (data: {
    name: string;
    sectorId: string;
    address?: string;
    email?: string;
    phone?: string;
  }) => {
    api.schools.create({
      name: data.name,
      sector_id: data.sectorId, // Changed to sector_id to match API
      address: data.address,
      email: data.email,
      phone: data.phone
    })
      .then(newSchool => {
        // Update schools with the sector and region names
        const sector = sectors.find(s => s.id === data.sectorId);
        const region = regions.find(r => r.id === sector?.regionId);
        
        const schoolWithNames = {
          ...newSchool,
          sector_id: data.sectorId, // Changed to sector_id
          sectorName: sector?.name || 'Unknown Sector',
          regionId: sector?.regionId || '',
          regionName: region?.name || 'Unknown Region'
        };
        
        setSchools([...schools, schoolWithNames as any]);
        toast.success('Məktəb uğurla yaradıldı');
      })
      .catch(error => {
        console.error('Error creating school:', error);
        toast.error('Məktəbi yaratmaq alınmadı');
      });
  };

  const handleUpdateSchool = () => {
    if (editingSchool) {
      const updateData: any = {};
      if (editingSchool.name !== undefined) updateData.name = editingSchool.name;
      if (editingSchool.address !== undefined) updateData.address = editingSchool.address;
      if (editingSchool.email !== undefined) updateData.email = editingSchool.email;
      if (editingSchool.phone !== undefined) updateData.phone = editingSchool.phone;
      if (editingSchool.sectorId !== undefined) updateData.sector_id = editingSchool.sectorId;
      
      api.schools.update(editingSchool.id, updateData)
        .then(updatedSchool => {
          // Update the school in the list with sector and region names
          const sector = sectors.find(s => s.id === editingSchool.sector_id || editingSchool.sectorId);
          const region = regions.find(r => r.id === sector?.regionId);
          
          const updatedSchoolWithNames = {
            ...updatedSchool,
            sectorName: sector?.name || 'Unknown Sector',
            regionId: sector?.regionId || '',
            regionName: region?.name || 'Unknown Region'
          };
          
          setSchools(schools.map(school => 
            school.id === updatedSchoolWithNames.id ? updatedSchoolWithNames as any : school
          ));
          
          setEditingSchool(null);
          toast.success('Məktəb uğurla yeniləndi');
        })
        .catch(error => {
          console.error('Error updating school:', error);
          toast.error('Məktəbi yeniləmək alınmadı');
        });
    }
  };

  const handleDeleteSchool = () => {
    if (deletingSchool) {
      api.schools
        .delete(deletingSchool.id)
        .then(() => {
          setSchools(schools.filter((school) => school.id !== deletingSchool.id));
          setDeletingSchool(null);
          toast.success("Məktəb uğurla silindi");
        })
        .catch((error) => {
          console.error("Error deleting school:", error);
          toast.error("Məktəbi silmək alınmadı");
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
                <h1 className="text-xl font-semibold">Superadmin Məktəblər</h1>
              </div>
            </div>
          </header>
          <main className="p-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Məktəblər</CardTitle>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Məktəb əlavə et
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <SchoolForm
                        sectors={sectors}
                        onSubmit={handleCreateSchool}
                      />
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Məktəb adı</TableHead>
                        <TableHead>Sektor</TableHead>
                        <TableHead>Region</TableHead>
                        <TableHead>Əməliyyatlar</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {schools.map((school) => (
                        <TableRow key={school.id}>
                          <TableCell>{school.name}</TableCell>
                          <TableCell>{school.sectorName}</TableCell>
                          <TableCell>{school.regionName}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    onClick={() => setEditingSchool(school)}
                                  >
                                    <Pencil className="w-4 h-4 mr-2" />
                                    Redaktə et
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <SchoolForm
                                    sectors={sectors}
                                    initialData={editingSchool}
                                    onSubmit={handleUpdateSchool}
                                  />
                                </DialogContent>
                              </Dialog>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="destructive"
                                    onClick={() => setDeletingSchool(school)}
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Sil
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <div className="flex flex-col space-y-4">
                                    <h2 className="text-lg font-semibold">
                                      Məktəbi silmək istədiyinizə əminsiniz?
                                    </h2>
                                    <div className="flex justify-end space-x-2">
                                      <Button
                                        variant="ghost"
                                        onClick={() => setDeletingSchool(null)}
                                      >
                                        Ləğv et
                                      </Button>
                                      <Button
                                        variant="primary"
                                        onClick={handleDeleteSchool}
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

export default SuperadminSchools;
