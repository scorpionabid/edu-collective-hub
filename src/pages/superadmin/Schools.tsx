
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { School } from "@/lib/api/types";
import { Plus, School2, Building } from "lucide-react";

import { SchoolForm } from "@/components/schools/SchoolForm";

const Schools = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [sectors, setSectors] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedSector, setSelectedSector] = useState<string>("");

  useEffect(() => {
    fetchSchools();
    fetchSectors();
    fetchRegions();
  }, []);

  const fetchSchools = async () => {
    try {
      const schoolsData = await api.schools.getAll();
      const schoolsWithInfo = await Promise.all(
        schoolsData.map(async (school) => {
          const sector = school.sector_id 
            ? await api.sectors.getById(school.sector_id)
            : null;
          
          const region = sector?.region_id
            ? await api.regions.getById(sector.region_id)
            : null;
          
          return {
            ...school,
            sectorName: sector?.name || "Unknown",
            regionId: region?.id || "",
            regionName: region?.name || "Unknown"
          };
        })
      );
      
      setSchools(schoolsWithInfo);
    } catch (error) {
      console.error("Error fetching schools:", error);
      toast.error("Məktəblərin siyahısını əldə etmək mümkün olmadı.");
    }
  };

  const fetchSectors = async () => {
    try {
      const sectorsData = await api.sectors.getAll();
      setSectors(sectorsData);
    } catch (error) {
      console.error("Error fetching sectors:", error);
      toast.error("Sektorların siyahısını əldə etmək mümkün olmadı.");
    }
  };

  const fetchRegions = async () => {
    try {
      const regionsData = await api.regions.getAll();
      setRegions(regionsData);
    } catch (error) {
      console.error("Error fetching regions:", error);
      toast.error("Regionların siyahısını əldə etmək mümkün olmadı.");
    }
  };

  const handleAddSchool = async (schoolData: Omit<School, 'id'>) => {
    try {
      await api.schools.create({
        name: schoolData.name,
        sector_id: schoolData.sector_id || "",
        address: schoolData.address,
        email: schoolData.email,
        phone: schoolData.phone
      });
      
      setAddDialogOpen(false);
      toast.success("Məktəb uğurla yaradıldı");
      fetchSchools();
    } catch (error) {
      console.error("Error creating school:", error);
      toast.error("Məktəbi yaratmaq mümkün olmadı");
    }
  };

  const handleEditSchool = async (id: string, schoolData: Partial<School>) => {
    try {
      if (!editingSchool) return;
      
      await api.schools.update(id, {
        name: schoolData.name,
        sector_id: schoolData.sector_id || editingSchool.sector_id,
        address: schoolData.address,
        email: schoolData.email,
        phone: schoolData.phone
      });
      
      setEditDialogOpen(false);
      setEditingSchool(null);
      toast.success("Məktəb uğurla yeniləndi");
      fetchSchools();
    } catch (error) {
      console.error("Error updating school:", error);
      toast.error("Məktəbi yeniləmək mümkün olmadı");
    }
  };

  const handleDeleteSchool = async (id: string) => {
    try {
      await api.schools.delete(id);
      toast.success("Məktəb uğurla silindi");
      fetchSchools();
    } catch (error) {
      console.error("Error deleting school:", error);
      toast.error("Məktəbi silmək mümkün olmadı");
    }
  };

  const filteredSchools = schools.filter(school => {
    if (selectedRegion && selectedSector) {
      return school.regionId === selectedRegion && school.sector_id === selectedSector;
    } else if (selectedRegion) {
      return school.regionId === selectedRegion;
    } else if (selectedSector) {
      return school.sector_id === selectedSector;
    }
    return true;
  });

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Məktəblər</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Məktəb
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Yeni Məktəb Yaradın</DialogTitle>
              <DialogDescription>
                Məktəbin məlumatlarını daxil edin
              </DialogDescription>
            </DialogHeader>
            <SchoolForm 
              onSubmit={handleAddSchool}
              sectors={sectors}
              regions={regions} 
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Region</label>
          <select
            className="w-full rounded-md border border-input p-2"
            value={selectedRegion}
            onChange={(e) => {
              setSelectedRegion(e.target.value);
              setSelectedSector("");
            }}
          >
            <option value="">All Regions</option>
            {regions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Sector</label>
          <select
            className="w-full rounded-md border border-input p-2"
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            disabled={!selectedRegion}
          >
            <option value="">All Sectors</option>
            {sectors
              .filter(
                (sector) => !selectedRegion || sector.region_id === selectedRegion
              )
              .map((sector) => (
                <option key={sector.id} value={sector.id}>
                  {sector.name}
                </option>
              ))}
          </select>
        </div>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">Bütün Məktəblər</TabsTrigger>
          <TabsTrigger value="active">Aktiv Məktəblər</TabsTrigger>
          <TabsTrigger value="inactive">Deaktiv Məktəblər</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSchools.map((school) => (
              <Card key={school.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">
                    {school.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-2 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center">
                      <Building className="mr-2 h-4 w-4" />
                      <span>Sektor: {school.sectorName}</span>
                    </div>
                    <div className="flex items-center">
                      <Building className="mr-2 h-4 w-4" />
                      <span>Region: {school.regionName}</span>
                    </div>
                    {school.address && (
                      <div className="flex items-center">
                        <Building className="mr-2 h-4 w-4" />
                        <span>Ünvan: {school.address}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingSchool(school);
                        setEditDialogOpen(true);
                      }}
                    >
                      Redaktə et
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteSchool(school.id)}
                    >
                      Sil
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="active">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSchools
              .filter((school) => true) // Filter condition for active schools
              .map((school) => (
                <Card key={school.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium">
                      {school.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-2 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center">
                        <Building className="mr-2 h-4 w-4" />
                        <span>Sektor: {school.sectorName}</span>
                      </div>
                      <div className="flex items-center">
                        <Building className="mr-2 h-4 w-4" />
                        <span>Region: {school.regionName}</span>
                      </div>
                      {school.address && (
                        <div className="flex items-center">
                          <Building className="mr-2 h-4 w-4" />
                          <span>Ünvan: {school.address}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingSchool(school);
                          setEditDialogOpen(true);
                        }}
                      >
                        Redaktə et
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteSchool(school.id)}
                      >
                        Sil
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
        <TabsContent value="inactive">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSchools
              .filter((school) => false) // Filter condition for inactive schools
              .map((school) => (
                <Card key={school.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium">
                      {school.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-2 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center">
                        <Building className="mr-2 h-4 w-4" />
                        <span>Sektor: {school.sectorName}</span>
                      </div>
                      <div className="flex items-center">
                        <Building className="mr-2 h-4 w-4" />
                        <span>Region: {school.regionName}</span>
                      </div>
                      {school.address && (
                        <div className="flex items-center">
                          <Building className="mr-2 h-4 w-4" />
                          <span>Ünvan: {school.address}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingSchool(school);
                          setEditDialogOpen(true);
                        }}
                      >
                        Redaktə et
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteSchool(school.id)}
                      >
                        Sil
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isEditDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Məktəbi Redaktə edin</DialogTitle>
            <DialogDescription>
              Məktəbin məlumatlarını yeniləyin
            </DialogDescription>
          </DialogHeader>
          {editingSchool && (
            <SchoolForm
              school={editingSchool}
              onSubmit={(data) => handleEditSchool(editingSchool.id, data)}
              sectors={sectors}
              regions={regions}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Schools;
