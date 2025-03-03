
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Sector {
  id: string;
  name: string;
  regionId?: string;
}

interface SectorListProps {
  sectors: Sector[];
  onEdit: (sector: Sector) => void;
  onDelete: (sector: Sector) => void;
  title?: string;
}

export const SectorList: React.FC<SectorListProps> = ({ 
  sectors, 
  onEdit, 
  onDelete, 
  title = "Sectors" 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter sectors based on search term
  const filteredSectors = sectors.filter(sector => 
    sector.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <Input 
          className="max-w-xs" 
          placeholder="Search sectors..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSectors.length > 0 ? (
              filteredSectors.map(sector => (
                <TableRow key={sector.id}>
                  <TableCell>{sector.name}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onEdit(sector)}
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="destructive"
                            size="sm"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <div className="space-y-4">
                            <h3 className="text-lg font-medium">Confirm Deletion</h3>
                            <p>Are you sure you want to delete {sector.name}? This action cannot be undone.</p>
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="outline" 
                                onClick={() => document.querySelector('[data-dialog-close]')?.click()}
                              >
                                Cancel
                              </Button>
                              <Button 
                                variant="destructive"
                                onClick={() => {
                                  onDelete(sector);
                                  document.querySelector('[data-dialog-close]')?.click();
                                }}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} className="text-center py-4">
                  No sectors found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default SectorList;
