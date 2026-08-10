'use client';

import React from 'react';
import { Bell, MessageSquare, CheckSquare, Tag, Info, Check, Trash2, Users, UserPlus } from 'lucide-react';
import type { NotificationDto, NotificationType } from '../types';

interface NotificationItemProps {
  notification: NotificationDto;
  onMarkRead?: (id: string) => void;
  onDelete?: (id: string) => void;
  onClick?: () => void;
}

export function NotificationItem({
  notification,
  onMarkRead,
  onDelete,
  onClick,
}: NotificationItemProps) {
  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case 'REMINDER_TRIGGERED':
        return <Bell className="h-4 w-4 text-amber-400" />;
      case 'COMMENT_ADDED':
        return <MessageSquare className="h-4 w-4 text-indigo-400" />;
      case 'TASK_ASSIGNED':
      case 'TASK_DUE':
        return <CheckSquare className="h-4 w-4 text-emerald-400" />;
      case 'TAG_ADDED':
        return <Tag className="h-4 w-4 text-purple-400" />;
      case 'WORKSPACE_INVITATION':
        return <Users className="h-4 w-4 text-indigo-400" />;
      case 'PROJECT_MEMBER_ADDED':
        return <UserPlus className="h-4 w-4 text-sky-400" />;
      default:
        return <Info className="h-4 w-4 text-blue-400" />;
    }
  };

  const formattedDate = notification.createdAt
    ? new Date(notification.createdAt).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return (
    <div
      onClick={onClick}
      className={`group relative flex items-start space-x-3 rounded-xl border p-3 text-xs transition cursor-pointer ${
        !notification.isRead
          ? 'border-primary/30 bg-primary/10 hover:bg-primary/20 text-text-primary font-medium'
          : 'border-surface-border bg-surface-alt/60 hover:bg-surface-alt text-text-secondary'
      }`}
    >
      {/* Icon Container */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-alt">
        {getTypeIcon(notification.type)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-0.5">
        <div className="flex items-center justify-between">
          <h4 className={`font-semibold truncate ${!notification.isRead ? 'text-text-primary font-bold' : 'text-text-primary'}`}>
            {notification.title}
          </h4>
          <span className="text-[10px] text-text-muted shrink-0 ml-2">{formattedDate}</span>
        </div>
        <p className="text-text-secondary line-clamp-2 text-[11px] leading-relaxed">{notification.message}</p>
      </div>

      {/* Status Dot & Controls */}
      <div className="flex items-center space-x-1 shrink-0 pt-0.5">
        {!notification.isRead && (
          <span className="h-2 w-2 rounded-full bg-primary" title="Unread" />
        )}

        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {!notification.isRead && onMarkRead && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMarkRead(notification.id);
              }}
              className="rounded p-1 text-text-muted hover:bg-surface-alt hover:text-primary"
              title="Mark as read"
            >
              <Check className="h-3 w-3" />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(notification.id);
              }}
              className="rounded p-1 text-text-muted hover:bg-status-error/10 hover:text-status-error"
              title="Delete notification"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
