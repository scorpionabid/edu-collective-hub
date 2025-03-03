
import { notifications as notificationsBase } from './notifications';
import { groups } from './groups';
import { mass } from './mass';

export const notifications = {
  ...notificationsBase,
  ...groups,
  ...mass
};
