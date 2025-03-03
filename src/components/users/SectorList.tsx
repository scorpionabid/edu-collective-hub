import React, { useState, useEffect } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../ui/table';
import { Button } from '../ui/button';
import { Plus, Download, Edit, Trash } from 'lucide-react';
import { exportToExcel } from '@/utils/excelExport';
import { toast } from 'sonner';

interface Sector {
  id: string;
  name: string;
  regionId?: string;
  regionName?: string;
  createdAt?: string;
}

interface SectorListProps {
  sectors: Sector[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

const SectorList = ({ sectors, onEdit, onDelete, onAdd }: SectorListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSectors, setFilteredSectors] = useState(sectors);

  useEffect(() => {
    const results = sectors.filter(sector =>
      sector.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSectors(results);
  }, [searchTerm, sectors]);
  
  const handleExport = async () => {
    try {
      // Fix export call to use correct format - Pass an array of column names
      await exportToExcel(
        sectors, 
        ['id', 'name', 'regionId', 'regionName', 'createdAt'],
        'Sectors List'
      );
      toast.success('Export completed successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Sectors</h2>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm" onClick={onAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Add Sector
          </Button>
        </div>
      </div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search sectors..."
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Region</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSectors.map(sector => (
              <TableRow key={sector.id}>
                <TableCell>{sector.name}</TableCell>
                <TableCell>{sector.regionName || 'N/A'}</TableCell>
                <TableCell>{sector.createdAt || 'N/A'}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => onEdit(sector.id)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onDelete(sector.id)}>
                    <Trash className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredSectors.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center">No sectors found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default SectorList;
