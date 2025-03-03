
import { auth } from './auth';
import { categories } from './categories';
import { columns } from './columns';
import { formData } from './formData';
import { regions } from './regions';
import { sectors } from './sectors';
import { schools } from './schools';
import { profiles } from './profiles';
import { realtime } from './realtime';
import { versions } from './versions';

// Export all API modules as a unified API object
export const api = {
  auth,
  categories,
  columns,
  formData,
  regions,
  sectors,
  schools,
  profiles,
  realtime,
  versions
};

// Re-export types for convenience
export * from './types';
