
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

interface SchoolListProps {
  schools: Entity[];
  newAdmin: NewAdmin;
  setNewAdmin: (admin: NewAdmin) => void;
  handleAddAdmin: () => void;
  setSelectedEntity: (entity: { type: AdminType; entity: Entity } | null) => void;
  regions: Entity[];
  sectors: Entity[];
  allSchools: Entity[];
}

export const SchoolList = ({
  schools,
  newAdmin,
  setNewAdmin,
  handleAddAdmin,
  setSelectedEntity,
  regions,
  sectors,
  allSchools,
}: SchoolListProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Məktəb</TableHead>
          <TableHead>Admin</TableHead>
          <TableHead className="w-[100px]">Əməliyyatlar</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {schools.map((school) => (
          <TableRow key={school.id}>
            <TableCell className="font-medium">{school.name}</TableCell>
            <TableCell>{school.adminName || "Təyin edilməyib"}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                {!school.adminId && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedEntity({
                          type: "schooladmin",
                          entity: school
                        })}
                      >
                        <Shield className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <AdminForm
                        admin={{
                          ...newAdmin,
                          type: "schooladmin",
                          entityId: school.id.toString()
                        }}
                        onAdminChange={setNewAdmin}
                        onSubmit={handleAddAdmin}
                        submitLabel="Admin təyin et"
                        entityType="schooladmin"
                        entityName={school.name}
                        regions={regions}
                        sectors={sectors}
                        schools={allSchools}
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
