
import { auth } from './auth';
import { categories } from './categories';
import { columns } from './columns';
import { formData } from './formData';
import { profiles } from './profiles';
import { regions } from './regions';
import { schools } from './schools';
import { sectors } from './sectors';
import { versions } from './versions';
import { realtime } from './realtime';
import { notifications } from './notifications';

export const api = {
  auth,
  categories,
  columns,
  formData,
  profiles,
  regions,
  schools,
  sectors,
  versions,
  realtime,
  notifications
};

// Re-export types
export type {
  Category,
  Column,
  FormData,
  Profile,
  TableVersion,
  FormEntryVersion,
  VersionDiff,
  NotificationGroup,
  CreateNotificationGroupData,
  UpdateNotificationGroupData,
  NotificationGroupMember,
  AddGroupMemberData,
  MassNotification,
  CreateMassNotificationData,
  MassNotificationRecipient,
  NotificationStats,
  GetMassNotificationsParams
} from './types';
