
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Pencil, Trash2 } from "lucide-react";

type AdminType = 'regionadmin' | 'sectoradmin' | 'schooladmin';

interface AdminUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  utisCode: string;
  phone: string;
  type: AdminType;
  entityId: number;
  entityName: string;
}

interface AdminListProps {
  admins: AdminUser[];
  onEdit: (admin: AdminUser) => void;
  onDelete: (admin: AdminUser) => void;
  setDeletingAdmin: (admin: AdminUser | null) => void;
}

export const AdminList = ({
  admins,
  onEdit,
  onDelete,
  setDeletingAdmin,
}: AdminListProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>UTIS Code</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Entity</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {admins.map((admin) => (
          <TableRow key={admin.id}>
            <TableCell>{admin.firstName} {admin.lastName}</TableCell>
            <TableCell>{admin.email}</TableCell>
            <TableCell>{admin.utisCode}</TableCell>
            <TableCell>{admin.phone}</TableCell>
            <TableCell>{admin.type.replace('admin', ' Admin')}</TableCell>
            <TableCell>{admin.entityName}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(admin)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Administrator</DialogTitle>
                    </DialogHeader>
                    {/* Admin form will be rendered here by parent */}
                  </DialogContent>
                </Dialog>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeletingAdmin(admin)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete Administrator</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to delete this administrator? This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setDeletingAdmin(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => onDelete(admin)}
                      >
                        Delete
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
