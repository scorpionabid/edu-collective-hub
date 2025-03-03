
// Re-export individual modules from the notifications directory
import { notifications } from './notifications';
import { groups } from './groups';
import { mass } from './mass';

export const notificationsApi = {
  ...notifications,
  ...groups,
  ...mass
};

// Direct exports
export { notifications, groups, mass };
