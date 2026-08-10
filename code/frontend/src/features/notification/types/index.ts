export type NotificationType =
  | 'TASK_ASSIGNED'
  | 'TASK_DUE'
  | 'REMINDER_TRIGGERED'
  | 'COMMENT_ADDED'
  | 'TAG_ADDED'
  | 'WORKSPACE_INVITATION'
  | 'PROJECT_MEMBER_ADDED'
  | 'SYSTEM';

export interface NotificationDto {
  id: string;
  title: string;
  message: string;
  userId: string;
  type: NotificationType;
  link?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface UnreadCountResponse {
  unreadCount: number;
}

export interface PaginatedNotificationsResponse {
  items: NotificationDto[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
