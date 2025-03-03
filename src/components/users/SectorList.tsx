
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, Trash, Plus, Download } from 'lucide-react';
import { exportToExcel } from '@/utils/excelExport';
import { toast } from 'sonner';

interface Sector {
  id: string;
  name: string;
  regionId: string;
  regionName?: string;
}

interface SectorListProps {
  sectors: Sector[];
  onAdd: (name: string, regionId: string) => Promise<void>;
  onEdit: (id: string, name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  regions: { id: string; name: string }[];
  selectedRegion?: string;
  showHeader?: boolean;
}

function SectorList({ 
  sectors, 
  onAdd, 
  onEdit, 
  onDelete, 
  regions, 
  selectedRegion, 
  showHeader = true 
}: SectorListProps) {
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [regionId, setRegionId] = useState(selectedRegion || '');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  useEffect(() => {
    if (selectedRegion) {
      setRegionId(selectedRegion);
    }
  }, [selectedRegion]);

  const handleExport = () => {
    try {
      // Convert the sectors array into a format suitable for Excel export
      const data = sectors.map(sector => ({
        ID: sector.id,
        Name: sector.name,
        Region: sector.regionName || '',
      }));
      
      exportToExcel(data, ['ID', 'Name', 'Region'], 'Sectors');
      toast.success('Sectors exported successfully');
    } catch (error) {
      console.error('Error exporting sectors:', error);
      toast.error('Failed to export sectors');
    }
  };

  const handleAdd = async () => {
    if (!name.trim()) {
      toast.error('Sector name is required');
      return;
    }
    
    try {
      await onAdd(name, regionId);
      setName('');
      setIsAddDialogOpen(false);
      toast.success('Sector added successfully');
    } catch (error) {
      console.error('Error adding sector:', error);
      toast.error('Failed to add sector');
    }
  };

  const handleEdit = async () => {
    if (!editName.trim() || !editingId) {
      toast.error('Sector name is required');
      return;
    }
    
    try {
      await onEdit(editingId, editName);
      setEditingId(null);
      setEditName('');
      setIsEditDialogOpen(false);
      toast.success('Sector updated successfully');
    } catch (error) {
      console.error('Error updating sector:', error);
      toast.error('Failed to update sector');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      await onDelete(deleteId);
      setDeleteId(null);
      setIsDeleteDialogOpen(false);
      toast.success('Sector deleted successfully');
    } catch (error) {
      console.error('Error deleting sector:', error);
      toast.error('Failed to delete sector');
    }
  };

  return (
    <Card className="w-full">
      {showHeader && (
        <CardHeader>
          <CardTitle>Sectors</CardTitle>
          <CardDescription>Manage sectors in your organization</CardDescription>
        </CardHeader>
      )}
      <CardContent>
        <div className="flex justify-between mb-4">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Sector
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Sector</DialogTitle>
                <DialogDescription>
                  Create a new sector in your organization
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="region" className="text-right">
                    Region
                  </Label>
                  <select
                    id="region"
                    value={regionId}
                    onChange={(e) => setRegionId(e.target.value)}
                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select a region</option>
                    {regions.map((region) => (
                      <option key={region.id} value={region.id}>
                        {region.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAdd}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Region</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sectors.length > 0 ? (
              sectors.map((sector) => (
                <TableRow key={sector.id}>
                  <TableCell className="font-medium">{sector.name}</TableCell>
                  <TableCell>{sector.regionName}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingId(sector.id);
                        setEditName(sector.name);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setDeleteId(sector.id);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  No sectors found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Sector</DialogTitle>
            <DialogDescription>
              Update sector information
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editName" className="text-right">
                Name
              </Label>
              <Input
                id="editName"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this sector? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export default SectorList;
