
export type AdminType = 'regionadmin' | 'sectoradmin' | 'schooladmin';

export interface AdminUser {
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

export interface NewAdmin {
  firstName: string;
  lastName: string;
  email: string;
  utisCode: string;
  password: string;
  phone: string;
  type: AdminType;
  entityId: string;
}

export interface Entity {
  id: number;
  name: string;
  adminId?: number;
  adminName?: string;
}
