
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Shield, Info } from "lucide-react";
import { AdminForm } from "./AdminForm";

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

interface RegionListProps {
  regions: Entity[];
  newAdmin: NewAdmin;
  setNewAdmin: (admin: NewAdmin) => void;
  handleAddAdmin: () => void;
  setSelectedEntity: (entity: { type: AdminType; entity: Entity } | null) => void;
  allRegions: Entity[];
  sectors: Entity[];
  schools: Entity[];
}

export const RegionList = ({
  regions,
  newAdmin,
  setNewAdmin,
  handleAddAdmin,
  setSelectedEntity,
  allRegions,
  sectors,
  schools,
}: RegionListProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Region</TableHead>
          <TableHead>Admin</TableHead>
          <TableHead className="w-[100px]">Əməliyyatlar</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {regions.map((region) => (
          <TableRow key={region.id}>
            <TableCell className="font-medium">{region.name}</TableCell>
            <TableCell>{region.adminName || "Təyin edilməyib"}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                {!region.adminId && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedEntity({
                          type: "regionadmin",
                          entity: region
                        })}
                      >
                        <Shield className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <AdminForm
                        admin={{
                          ...newAdmin,
                          type: "regionadmin",
                          entityId: region.id.toString()
                        }}
                        onAdminChange={setNewAdmin}
                        onSubmit={handleAddAdmin}
                        submitLabel="Admin təyin et"
                        entityType="regionadmin"
                        entityName={region.name}
                        regions={allRegions}
                        sectors={sectors}
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
  );
};
