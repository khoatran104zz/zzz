export type CalendarEventType = 'CUSTOM' | 'TASK';
export type CalendarViewMode = 'month' | 'week' | 'day';

export interface CalendarEventItemDto {
  id: string;
  title: string;
  description?: string;
  location?: string;
  meetingLink?: string;
  startTime: string;
  endTime: string;
  isAllDay: boolean;
  color: string;
  eventType: CalendarEventType;
  taskId?: string;
  workspaceId?: string;
  workspaceName?: string;
  status?: string;
  priority?: string;
  createdAt?: string;
}

export interface CreateCalendarEventInput {
  title: string;
  description?: string;
  location?: string;
  meetingLink?: string;
  startTime: string;
  endTime: string;
  workspaceId?: string;
  taskId?: string;
  color?: string;
  isAllDay?: boolean;
}

export interface UpdateCalendarEventInput {
  title: string;
  description?: string;
  location?: string;
  meetingLink?: string;
  startTime: string;
  endTime: string;
  workspaceId?: string;
  taskId?: string;
  color?: string;
  isAllDay?: boolean;
}
