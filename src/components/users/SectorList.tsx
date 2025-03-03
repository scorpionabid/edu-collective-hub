import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Shield, Info, FileDown } from "lucide-react";
import { AdminForm } from "./AdminForm";
import { exportToExcel } from '@/utils/excelExport';
import { toast } from "sonner";

type AdminType = 'regionadmin' | 'sectoradmin' | 'schooladmin';

interface Entity {
  id: number;
  name: string;
  adminId?: number;
  adminName?: string;
}

interface NewAdmin {
  firstName: string;
  lastName: string;
  email: string;
  utisCode: string;
  password: string;
  phone: string;
  type: AdminType;
  entityId: string;
}

interface SectorListProps {
  sectors: Entity[];
  newAdmin: NewAdmin;
  setNewAdmin: (admin: NewAdmin) => void;
  handleAddAdmin: () => void;
  setSelectedEntity: (entity: { type: AdminType; entity: Entity } | null) => void;
  regions: Entity[];
  allSectors: Entity[];
  schools: Entity[];
}

export const SectorList = ({
  sectors,
  newAdmin,
  setNewAdmin,
  handleAddAdmin,
  setSelectedEntity,
  regions,
  allSectors,
  schools,
}: SectorListProps) => {
  // Excel export functionality
  const handleExportSectors = () => {
    const exportData = sectors.map(sector => ({
      'Sektor': sector.name,
      'Admin': sector.adminName || 'Təyin edilməyib'
    }));
    
    exportToExcel(exportData, 'Sektorlar');
    toast.success('Sektorlar uğurla export edildi');
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button variant="outline" onClick={handleExportSectors}>
          <FileDown className="w-4 h-4 mr-2" />
          Export et
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sektor</TableHead>
            <TableHead>Admin</TableHead>
            <TableHead className="w-[100px]">Əməliyyatlar</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sectors.map((sector) => (
            <TableRow key={sector.id}>
              <TableCell className="font-medium">{sector.name}</TableCell>
              <TableCell>{sector.adminName || "Təyin edilməyib"}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {!sector.adminId && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedEntity({
                            type: "sectoradmin",
                            entity: sector
                          })}
                        >
                          <Shield className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <AdminForm
                          admin={{
                            ...newAdmin,
                            type: "sectoradmin",
                            entityId: sector.id.toString()
                          }}
                          onAdminChange={setNewAdmin}
                          onSubmit={handleAddAdmin}
                          submitLabel="Admin təyin et"
                          entityType="sectoradmin"
                          entityName={sector.name}
                          regions={regions}
                          sectors={allSectors}
                          schools={schools}
                        />
                      </DialogContent>
                    </Dialog>
                  )}
                  <Button variant="ghost" size="sm">
                    <Info className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
