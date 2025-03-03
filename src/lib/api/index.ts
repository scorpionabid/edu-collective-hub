
import { categories } from './categories';
import { columns } from './columns';
import { formData } from './formData';
import { auth } from './auth';
import { regions } from './regions';
import { sectors } from './sectors';
import { schools } from './schools';
import { profiles } from './profiles';
import { versions } from './versions';
import { notifications } from './notifications';
import { categoryValidation } from './categoryValidation';

export const api = {
  categories,
  columns,
  formData,
  auth,
  regions,
  sectors,
  schools,
  profiles,
  versions,
  notifications,
  categoryValidation
};

// Re-export individual modules directly to allow importing them directly
export { categories, columns, formData, auth, regions, sectors, schools, profiles, versions, notifications, categoryValidation };

// Re-export types - using `export type` to comply with isolatedModules
export type { Column, Category } from './types';
export type * from './types';
