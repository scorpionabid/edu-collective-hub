
import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { api } from '@/lib/api';
import { DataTable } from '@/components/ui/data-table';
import SchoolForm from '@/components/schools/SchoolForm';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { School, Sector, Region } from '@/lib/api/types';

const SchoolsPage = () => {
  const { user } = useAuth();
  const [schools, setSchools] = useState<School[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [selectedSector, setSelectedSector] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [filteredSectors, setFilteredSectors] = useState<Sector[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Filter sectors based on selected region
    if (selectedRegion) {
      setFilteredSectors(sectors.filter(sector => sector.regionId === selectedRegion));
      setSelectedSector(''); // Reset sector selection when region changes
    } else {
      setFilteredSectors(sectors);
    }
  }, [selectedRegion, sectors]);

  useEffect(() => {
    // Filter schools based on selections
    filterSchools();
  }, [selectedSector, selectedRegion, schools]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [schoolsData, sectorsData, regionsData] = await Promise.all([
        api.schools.getAll(),
        api.sectors.getAll(),
        api.regions.getAll()
      ]);
      setSchools(schoolsData);
      setSectors(sectorsData);
      setRegions(regionsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data.');
    } finally {
      setIsLoading(false);
    }
  };

  const filterSchools = () => {
    let filtered = [...schools];
    
    if (selectedSector) {
      filtered = filtered.filter(school => school.sectorId === selectedSector);
    }
    
    if (selectedRegion && !selectedSector) {
      filtered = filtered.filter(school => {
        const sector = sectors.find(s => s.id === school.sectorId);
        return sector?.regionId === selectedRegion;
      });
    }
    
    setFilteredSchools(filtered);
  };

  const [filteredSchools, setFilteredSchools] = useState<School[]>([]);

  const handleCreateSchool = async (schoolData: Omit<School, 'id'>) => {
    try {
      await api.schools.create({
        name: schoolData.name,
        sectorId: schoolData.sectorId,
        address: schoolData.address,
        email: schoolData.email,
        phone: schoolData.phone,
        createdAt: new Date().toISOString()
      });
      
      fetchData();
      setIsDialogOpen(false);
      toast.success('School created successfully!');
    } catch (error) {
      console.error('Error creating school:', error);
      toast.error('Failed to create school.');
    }
  };

  const handleUpdateSchool = async (schoolData: Omit<School, 'id'>) => {
    if (!editingSchool) return;
    
    try {
      await api.schools.update(editingSchool.id, {
        name: schoolData.name,
        sectorId: schoolData.sectorId,
        address: schoolData.address,
        email: schoolData.email,
        phone: schoolData.phone
      });
      
      fetchData();
      setIsDialogOpen(false);
      setEditingSchool(null);
      toast.success('School updated successfully!');
    } catch (error) {
      console.error('Error updating school:', error);
      toast.error('Failed to update school.');
    }
  };

  const handleDeleteSchool = async (school: School) => {
    if (window.confirm(`Are you sure you want to delete ${school.name}?`)) {
      try {
        await api.schools.delete(school.id);
        fetchData();
        toast.success('School deleted successfully!');
      } catch (error) {
        console.error('Error deleting school:', error);
        toast.error('Failed to delete school.');
      }
    }
  };

  const columns = [
    {
      header: 'School Name',
      accessorKey: 'name',
    },
    {
      header: 'Region',
      accessorKey: 'regionName',
      cell: ({ row }: { row: { original: School } }) => {
        const sector = sectors.find(s => s.id === row.original.sectorId);
        const region = regions.find(r => r.id === sector?.regionId);
        return region?.name || '-';
      },
    },
    {
      header: 'Sector',
      accessorKey: 'sectorName',
      cell: ({ row }: { row: { original: School } }) => {
        const sector = sectors.find(s => s.id === row.original.sectorId);
        return sector?.name || '-';
      },
    },
    {
      header: 'Email',
      accessorKey: 'email',
    },
    {
      header: 'Phone',
      accessorKey: 'phone',
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: ({ row }: { row: { original: School } }) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditingSchool(row.original);
              setIsDialogOpen(true);
            }}
          >
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDeleteSchool(row.original)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Schools Management</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => setEditingSchool(null)}
              >
                Add New School
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{editingSchool ? 'Edit School' : 'Add New School'}</DialogTitle>
              </DialogHeader>
              <SchoolForm
                onSubmit={editingSchool ? handleUpdateSchool : handleCreateSchool}
                initialData={editingSchool || undefined}
                sectors={filteredSectors.length > 0 ? filteredSectors : sectors}
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-6 flex flex-wrap gap-4">
          <div className="w-full md:w-64">
            <label className="block text-sm font-medium mb-1">Filter by Region</label>
            <select
              className="w-full p-2 border rounded"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
            >
              <option value="">All Regions</option>
              {regions.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.name}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full md:w-64">
            <label className="block text-sm font-medium mb-1">Filter by Sector</label>
            <select
              className="w-full p-2 border rounded"
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              disabled={filteredSectors.length === 0}
            >
              <option value="">All Sectors</option>
              {filteredSectors.map((sector) => (
                <option key={sector.id} value={sector.id}>
                  {sector.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredSchools}
          loading={isLoading}
          pagination
        />
      </div>
    </AdminLayout>
  );
};

export default SchoolsPage;
