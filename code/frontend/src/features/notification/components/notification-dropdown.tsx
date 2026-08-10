'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  useNotifications,
  useUnreadNotificationCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from '../hooks/use-notification';
import { NotificationBadge } from './notification-badge';
import { NotificationItem } from './notification-item';

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { data: notificationsData, isLoading } = useNotifications(0, 5, false);
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const notifications = notificationsData?.items || [];

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (id: string, link?: string, isRead?: boolean) => {
    if (!isRead) {
      markRead.mutate(id);
    }
    setIsOpen(false);
    if (link) {
      router.push(link as any);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-lg p-2 text-text-muted hover:bg-surface-alt hover:text-text-primary transition"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        <NotificationBadge className="absolute -top-0.5 -right-0.5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 z-50 w-80 sm:w-96 rounded-2xl border border-surface-border bg-surface text-text-primary p-4 shadow-2xl space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-surface-border pb-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary">Thông báo</h3>

            <button
              type="button"
              onClick={() => markAllRead.mutate()}
              className="flex items-center space-x-1 text-[11px] font-semibold text-primary hover:text-primary-hover transition"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              <span>Đánh dấu tất cả đã đọc</span>
            </button>
          </div>

          {/* List */}
          {isLoading ? (
            <div className="space-y-2 py-2">
              <div className="h-14 animate-pulse rounded-xl bg-surface-alt" />
              <div className="h-14 animate-pulse rounded-xl bg-surface-alt" />
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-0.5">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkRead={(id) => markRead.mutate(id)}
                  onClick={() => handleNotificationClick(notification.id, notification.link, notification.isRead)}
                />
              ))}

              {notifications.length === 0 && (
                <p className="text-center py-6 text-xs text-text-muted italic">Chưa có thông báo nào.</p>
              )}
            </div>
          )}

          {/* Footer Link */}
          <div className="border-t border-surface-border pt-2 text-center">
            <Link
              href={"/notifications" as any}
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center space-x-1 text-xs font-medium text-primary hover:text-primary-hover transition"
            >
              <span>Xem tất cả thông báo</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
