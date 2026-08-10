'use client';

import React, { useState } from 'react';
import { Bell, CheckCheck, ChevronLeft, ChevronRight, Inbox, Sparkles, UserPlus, CheckCircle2, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification,
} from '@/features/notification/hooks/use-notification';
import { useAcceptInvitation } from '@/features/workspace/hooks/use-workspace';
import { NotificationItem } from '@/features/notification/components/notification-item';
import { NotificationListSkeleton } from '@/components/ui/skeletons/notification-list-skeleton';
import { EmptyState } from '@/components/ui/empty-state';

export default function NotificationsPage() {
  const [page, setPage] = useState(0);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const router = useRouter();
  const { t: tNav } = useTranslation('navigation');
  const { t: tCommon } = useTranslation('common');

  const { data, isLoading } = useNotifications(page, 15, unreadOnly);
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const deleteNotification = useDeleteNotification();
  const acceptInvitation = useAcceptInvitation();

  const notifications = data?.items || [];
  const totalElements = data?.totalElements || 0;
  const totalPages = data?.totalPages || 0;

  const handleNotificationClick = (id: string, link?: string, isRead?: boolean) => {
    if (!isRead) {
      markRead.mutate(id);
    }

    if (link) {
      // Extract token if link format is /invite/[token]
      if (link.startsWith('/invite/')) {
        const token = link.replace('/invite/', '');
        acceptInvitation.mutate(token, {
          onSuccess: (wsMember) => {
            if (wsMember?.workspaceId) {
              router.push(`/workspaces/${wsMember.workspaceId}`);
            } else {
              router.push('/workspaces');
            }
          },
        });
      } else {
        router.push(link as any);
      }
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6 text-text-primary">
      
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-5">
        <div className="flex items-center space-x-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-xs">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-text-primary font-heading flex items-center space-x-2">
              <span>Trung tâm Thông báo</span>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                {totalElements}
              </span>
            </h1>
            <p className="text-xs text-text-secondary mt-0.5">
              Theo dõi lời mời tham gia dự án, phân công công việc và các cập nhật mới nhất
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => markAllRead.mutate()}
          className="flex items-center space-x-2 rounded-xl border border-surface-border bg-surface-alt px-4 py-2 text-xs font-bold text-text-primary hover:bg-surface hover:border-primary/40 transition shadow-xs self-start sm:self-auto"
        >
          <CheckCheck className="h-4 w-4 text-primary" />
          <span>Đánh dấu tất cả đã đọc</span>
        </button>
      </div>

      {/* Filter Tabs & Pagination Control Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-1.5 rounded-xl border border-surface-border bg-surface-alt p-1">
          <button
            type="button"
            onClick={() => {
              setUnreadOnly(false);
              setPage(0);
            }}
            className={`rounded-lg px-4 py-1.5 text-xs font-bold transition ${
              !unreadOnly
                ? 'bg-primary text-white shadow-xs'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Tất cả
          </button>
          <button
            type="button"
            onClick={() => {
              setUnreadOnly(true);
              setPage(0);
            }}
            className={`rounded-lg px-4 py-1.5 text-xs font-bold transition ${
              unreadOnly
                ? 'bg-primary text-white shadow-xs'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Chưa đọc
          </button>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center space-x-2 text-xs text-text-secondary font-medium">
            <span>
              Trang {page + 1} / {totalPages} ({totalElements} thông báo)
            </span>
            <div className="flex items-center space-x-1">
              <button
                type="button"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="rounded-lg p-1.5 border border-surface-border bg-surface hover:bg-surface-alt disabled:opacity-30 transition"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled={data?.last}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg p-1.5 border border-surface-border bg-surface hover:bg-surface-alt disabled:opacity-30 transition"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Notification Stream */}
      {isLoading ? (
        <NotificationListSkeleton count={4} />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Bạn đã xem hết thông báo!"
          description={unreadOnly ? 'Không có thông báo chưa đọc nào.' : 'Hiện tại chưa có thông báo mới nào dành cho bạn.'}
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const isInvitation = notification.type === 'WORKSPACE_INVITATION' && notification.link?.startsWith('/invite/');
            const token = isInvitation ? notification.link?.replace('/invite/', '') : null;

            return (
              <div
                key={notification.id}
                className={`group relative rounded-2xl border transition p-4 space-y-3 ${
                  !notification.isRead
                    ? 'border-primary/40 bg-primary/5 hover:bg-primary/10 shadow-xs'
                    : 'border-surface-border bg-surface hover:bg-surface-alt/60'
                }`}
              >
                <NotificationItem
                  notification={notification}
                  onMarkRead={(id) => markRead.mutate(id)}
                  onDelete={(id) => deleteNotification.mutate(id)}
                  onClick={() => handleNotificationClick(notification.id, notification.link, notification.isRead)}
                />

                {/* Interactive Action Card for Workspace Invitations */}
                {isInvitation && token && (
                  <div className="ml-11 flex items-center justify-between rounded-xl border border-primary/20 bg-primary/10 p-3">
                    <div className="flex items-center space-x-2 text-xs font-semibold text-primary">
                      <UserPlus className="h-4 w-4" />
                      <span>Lời mời tham gia Workspace này đang chờ bạn xác nhận!</span>
                    </div>

                    <button
                      type="button"
                      disabled={acceptInvitation.isPending}
                      onClick={(e) => {
                        e.stopPropagation();
                        acceptInvitation.mutate(token, {
                          onSuccess: (wsMember) => {
                            if (!notification.isRead) {
                              markRead.mutate(notification.id);
                            }
                            if (wsMember?.workspaceId) {
                              router.push(`/workspaces/${wsMember.workspaceId}`);
                            } else {
                              router.push('/workspaces');
                            }
                          },
                        });
                      }}
                      className="flex items-center space-x-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-primary-hover active:scale-95 transition"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Chấp nhận tham gia</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
