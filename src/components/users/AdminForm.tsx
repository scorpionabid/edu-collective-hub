
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AdminType, NewAdmin, Entity } from "./types";

interface AdminFormProps {
  admin: NewAdmin;
  onAdminChange: (admin: NewAdmin) => void;
  onSubmit: () => void;
  submitLabel: string;
  entityName?: string;
  entityType?: AdminType;
  regions: Entity[];
  sectors: Entity[];
  schools: Entity[];
}

export const AdminForm = ({
  admin,
  onAdminChange,
  onSubmit,
  submitLabel,
  entityName,
  entityType,
  regions,
  sectors,
  schools
}: AdminFormProps) => {
  const getEntityOptions = () => {
    if (entityType && entityName) {
      return [(
        <SelectItem key={admin.entityId} value={admin.entityId}>
          {entityName}
        </SelectItem>
      )];
    }

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
        {entityType && entityName && (
          <DialogDescription>
            {entityName} üçün {entityType === 'regionadmin' ? 'region' : entityType === 'sectoradmin' ? 'sektor' : 'məktəb'} administratoru yaradın
          </DialogDescription>
        )}
      </DialogHeader>
      <div className="grid grid-cols-2 gap-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">Ad</Label>
          <Input
            id="firstName"
            value={admin.firstName}
            onChange={(e) => onAdminChange({ ...admin, firstName: e.target.value })}
            placeholder="Adı daxil edin"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Soyad</Label>
          <Input
            id="lastName"
            value={admin.lastName}
            onChange={(e) => onAdminChange({ ...admin, lastName: e.target.value })}
            placeholder="Soyadı daxil edin"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={admin.email}
            onChange={(e) => onAdminChange({ ...admin, email: e.target.value })}
            placeholder="Email daxil edin"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="utisCode">UTIS Kodu</Label>
          <Input
            id="utisCode"
            value={admin.utisCode}
            onChange={(e) => onAdminChange({ ...admin, utisCode: e.target.value })}
            placeholder="UTIS kodunu daxil edin"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Şifrə</Label>
          <Input
            id="password"
            type="password"
            value={admin.password}
            onChange={(e) => onAdminChange({ ...admin, password: e.target.value })}
            placeholder="Şifrəni daxil edin"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Telefon</Label>
          <Input
            id="phone"
            value={admin.phone}
            onChange={(e) => onAdminChange({ ...admin, phone: e.target.value })}
            placeholder="Telefon nömrəsini daxil edin"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Administrator növü</Label>
          <Select
            value={admin.type}
            onValueChange={(value: AdminType) => {
              onAdminChange({ ...admin, type: value, entityId: "" });
            }}
            disabled={!!entityType}
          >
            <SelectTrigger>
              <SelectValue placeholder="Növü seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="regionadmin">Region Administratoru</SelectItem>
              <SelectItem value="sectoradmin">Sektor Administratoru</SelectItem>
              <SelectItem value="schooladmin">Məktəb Administratoru</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="entity">Təyin ediləcək {admin.type === 'regionadmin' ? 'region' : admin.type === 'sectoradmin' ? 'sektor' : 'məktəb'}</Label>
          <Select
            value={admin.entityId}
            onValueChange={(value) => onAdminChange({ ...admin, entityId: value })}
            disabled={!!entityType}
          >
            <SelectTrigger>
              <SelectValue placeholder={`${admin.type === 'regionadmin' ? 'Region' : admin.type === 'sectoradmin' ? 'Sektor' : 'Məktəb'} seçin`} />
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
