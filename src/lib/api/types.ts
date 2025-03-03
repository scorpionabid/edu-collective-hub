
// Only adding the missing properties to the NotificationStats interface
export interface NotificationStats {
  total: number;
  pending: number;
  sent: number;
  failed: number;
  read: number;
  totalSent: number;
  delivered: number;
}
