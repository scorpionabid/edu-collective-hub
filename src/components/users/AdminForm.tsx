
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";

type AdminType = 'regionadmin' | 'sectoradmin' | 'schooladmin';

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

interface AdminFormProps {
  admin: NewAdmin;
  onAdminChange: (admin: NewAdmin) => void;
  onSubmit: () => void;
  submitLabel: string;
  regions: Array<{ id: number; name: string; }>;
  sectors: Array<{ id: number; name: string; regionId: number; }>;
  schools: Array<{ id: number; name: string; sectorId: number; }>;
}

export const AdminForm = ({
  admin,
  onAdminChange,
  onSubmit,
  submitLabel,
  regions,
  sectors,
  schools
}: AdminFormProps) => {
  const getEntityOptions = () => {
    switch (admin.type) {
      case "regionadmin":
        return regions.map(region => (
          <SelectItem key={region.id} value={String(region.id)}>
            {region.name}
          </SelectItem>
        ));
      case "sectoradmin":
        return sectors.map(sector => (
          <SelectItem key={sector.id} value={String(sector.id)}>
            {sector.name}
          </SelectItem>
        ));
      case "schooladmin":
        return schools.map(school => (
          <SelectItem key={school.id} value={String(school.id)}>
            {school.name}
          </SelectItem>
        ));
      default:
        return [];
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{submitLabel}</DialogTitle>
      </DialogHeader>
      <div className="grid grid-cols-2 gap-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={admin.firstName}
            onChange={(e) => onAdminChange({ ...admin, firstName: e.target.value })}
            placeholder="Enter first name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={admin.lastName}
            onChange={(e) => onAdminChange({ ...admin, lastName: e.target.value })}
            placeholder="Enter last name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={admin.email}
            onChange={(e) => onAdminChange({ ...admin, email: e.target.value })}
            placeholder="Enter email"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="utisCode">UTIS Code</Label>
          <Input
            id="utisCode"
            value={admin.utisCode}
            onChange={(e) => onAdminChange({ ...admin, utisCode: e.target.value })}
            placeholder="Enter UTIS code"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={admin.password}
            onChange={(e) => onAdminChange({ ...admin, password: e.target.value })}
            placeholder="Enter password"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            value={admin.phone}
            onChange={(e) => onAdminChange({ ...admin, phone: e.target.value })}
            placeholder="Enter phone number"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Administrator Type</Label>
          <Select
            value={admin.type}
            onValueChange={(value: AdminType) => {
              onAdminChange({ ...admin, type: value, entityId: "" });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="regionadmin">Region Admin</SelectItem>
              <SelectItem value="sectoradmin">Sector Admin</SelectItem>
              <SelectItem value="schooladmin">School Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="entity">Select {admin.type.replace('admin', '')}</Label>
          <Select
            value={admin.entityId}
            onValueChange={(value) => onAdminChange({ ...admin, entityId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${admin.type.replace('admin', '')}`} />
            </SelectTrigger>
            <SelectContent>
              {getEntityOptions()}
            </SelectContent>
          </Select>
        </div>
        <Button className="col-span-2" onClick={onSubmit}>
          {submitLabel}
        </Button>
      </div>
    </>
  );
};
