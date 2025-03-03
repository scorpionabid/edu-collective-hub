
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, RefreshCw } from 'lucide-react';
import { Sector } from '@/lib/api/types';

export interface SectorListProps {
  sectors: Sector[];
  onDelete?: (sectorId: string) => Promise<void>;
  onRefresh?: () => Promise<void>;
}

export const SectorList: React.FC<SectorListProps> = ({ 
  sectors, 
  onDelete,
  onRefresh
}) => {
  return (
    <div>
      <div className="flex justify-end mb-4">
        {onRefresh && (
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        )}
      </div>
      
      {sectors.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No sectors found
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Region</TableHead>
              <TableHead>Schools</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sectors.map((sector) => (
              <TableRow key={sector.id}>
                <TableCell className="font-medium">{sector.name}</TableCell>
                <TableCell>{sector.regionName || 'Unknown Region'}</TableCell>
                <TableCell>{sector.schoolCount || 0}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm">
                      <Pencil className="w-4 h-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    {onDelete && (
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => onDelete(sector.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};
