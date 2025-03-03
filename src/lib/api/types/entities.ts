
export interface School {
  id: string;
  name: string;
  sectorId: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  createdAt: string;
}

export interface Sector {
  id: string;
  name: string;
  regionId: string;
  createdAt: string;
  regionName?: string;
  schoolCount?: number;
}

export interface Region {
  id: string;
  name: string;
  createdAt: string;
}

export interface Profile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  role: string;
  regionId?: string | null;
  sectorId?: string | null;
  schoolId?: string | null;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  role: string;
  email?: string;
  regionId?: string | null;
  sectorId?: string | null;
  schoolId?: string | null;
  createdAt: string;
  name?: string;
}
