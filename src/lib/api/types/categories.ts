
import { Column } from './columns';

export interface Category {
  id: string;
  name: string;
  regionId: string | null;
  sectorId: string | null;
  schoolId: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  columns?: Column[];
}
