
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SectorList } from '@/components/sectors/SectorList';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const Sectors = () => {
  const { user } = useAuth();
  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [newSectorName, setNewSectorName] = useState('');

  useEffect(() => {
    fetchSectors();
  }, []);

  const fetchSectors = async () => {
    try {
      setLoading(true);
      
      // Get the profile with regionId using user.id
      const profileResponse = await api.profiles.getById(user?.id || '');
      
      // If we have a regionId in the profile, fetch sectors for that region
      if (profileResponse && profileResponse.regionId) {
        const sectorsResponse = await api.sectors.getByRegion(profileResponse.regionId);
        setSectors(sectorsResponse);
      } else {
        // Fallback to fetching all sectors if no regionId is available
        const allSectors = await api.sectors.getAll();
        setSectors(allSectors);
      }
    } catch (error) {
      console.error('Error fetching sectors:', error);
      toast.error('Failed to fetch sectors');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSector = async () => {
    if (!newSectorName.trim()) {
      toast.error('Please enter a sector name');
      return;
    }

    try {
      // Get the profile with regionId using user.id
      const profileResponse = await api.profiles.getById(user?.id || '');
      
      if (!profileResponse || !profileResponse.regionId) {
        toast.error('No region assigned to this user');
        return;
      }

      await api.sectors.create({
        name: newSectorName,
        regionId: profileResponse.regionId
      });

      toast.success('Sector added successfully');
      setNewSectorName('');
      setAddDialogOpen(false);
      fetchSectors();
    } catch (error) {
      console.error('Error adding sector:', error);
      toast.error('Failed to add sector');
    }
  };

  const handleDeleteSector = async (sectorId: string) => {
    try {
      await api.sectors.delete(sectorId);
      toast.success('Sector deleted successfully');
      fetchSectors();
    } catch (error) {
      console.error('Error deleting sector:', error);
      toast.error('Failed to delete sector');
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sectors</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Sector
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Sector</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Sector Name</Label>
                <Input
                  id="name"
                  value={newSectorName}
                  onChange={(e) => setNewSectorName(e.target.value)}
                  placeholder="Enter sector name"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleAddSector}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Sectors</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading sectors...</p>
          ) : (
            <SectorList 
              sectors={sectors} 
              onDelete={handleDeleteSector} 
              onRefresh={fetchSectors}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Sectors;
