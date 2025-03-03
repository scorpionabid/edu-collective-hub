
// Re-export all types from their dedicated files
export * from './common';
export * from './categories';
export * from './columns';
export * from './formData';
export * from './notifications';
export * from './validation';
export * from './import-export';
export * from './cache';
export * from './auth';

// Re-export entities but exclude UserProfile since it's already exported from auth
import * as EntitiesExports from './entities';
// Remove UserProfile from entities exports to avoid ambiguity
const { UserProfile: _UserProfile, ...remainingEntitiesExports } = EntitiesExports;
export { remainingEntitiesExports as entities };
// Export other specific types from entities
export { School, Sector, Region, Profile } from './entities';
