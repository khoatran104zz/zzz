'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Layers, Plus, Settings, Users, Check, Edit3, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useWorkspaces } from '@/features/workspace/hooks/use-workspace';
import { useWorkspaceStore } from '@/store/workspace-store';
import { useAuthStore } from '@/store/auth-store';
import { CreateWorkspaceDialog } from '@/features/workspace/components/create-workspace-dialog';
import { EditWorkspaceDialog } from '@/features/workspace/components/edit-workspace-dialog';
import type { WorkspaceDto } from '@/features/workspace/types';
import { ProjectCardSkeleton } from '@/components/ui/skeletons/project-card-skeleton';
import { EmptyState } from '@/components/ui/empty-state';

export default function WorkspacesDirectoryPage() {
  const router = useRouter();
  const { t } = useTranslation('workspace');
  const { t: tNav } = useTranslation('navigation');
  const user = useAuthStore((state) => state.user);

  const { data: workspaces = [], isLoading } = useWorkspaces();
  const setActiveWorkspace = useWorkspaceStore((state) => state.setActiveWorkspace);
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace);

  const isAdmin = user?.roles?.includes('ROLE_ADMIN') || user?.email === 'admin@gmail.com';
  const isManager = user?.roles?.includes('ROLE_MANAGER') || user?.email === 'manager@gmail.com';
  const canCreateWorkspace = isAdmin || isManager;

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState<WorkspaceDto | null>(null);

  const handleOpenWorkspace = (ws: WorkspaceDto) => {
    setActiveWorkspace(ws);
    router.push(`/workspaces/${ws.id}`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-surface-border pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-text-primary font-heading">
            {t('directoryTitle', { defaultValue: 'Không gian làm việc' })}
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            {t('directorySubtitle', { defaultValue: 'Xem, quản lý và chuyển đổi các không gian làm việc của bạn' })}
          </p>
        </div>
        {canCreateWorkspace && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center space-x-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-primary-hover active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>{t('createWorkspace', { defaultValue: 'Tạo Workspace mới' })}</span>
          </button>
        )}
      </div>

      {isLoading ? (
        <ProjectCardSkeleton count={3} />
      ) : workspaces.length === 0 ? (
        canCreateWorkspace ? (
          <EmptyState
            icon={Layers}
            title={t('noWorkspacesTitle', { defaultValue: 'Chưa có không gian làm việc nào' })}
            description={t('noWorkspacesDesc', { defaultValue: 'Tạo không gian làm việc đầu tiên để bắt đầu quản lý dự án và cộng tác cùng nhóm.' })}
            actionLabel={t('createWorkspace', { defaultValue: 'Tạo Workspace' })}
            onAction={() => setIsCreateOpen(true)}
          />
        ) : (
          <EmptyState
            icon={Layers}
            title={t('noWorkspacesStaffTitle', { defaultValue: 'Chưa tham gia không gian làm việc nào' })}
            description={t('noWorkspacesStaffDesc', { defaultValue: 'Bạn chưa được thêm vào không gian làm việc nào. Vui lòng liên hệ Quản trị viên hoặc Quản lý để được mời vào Workspace.' })}
          />
        )
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((ws) => {
            const isActive = activeWorkspace?.id === ws.id;
            const canEditWs = ws.userRole === 'OWNER' || ws.userRole === 'ADMIN' || ws.userRole === 'MANAGER' || isAdmin || isManager;
            return (
              <div
                key={ws.id}
                onClick={() => handleOpenWorkspace(ws)}
                className={`relative flex flex-col justify-between rounded-xl border p-5 backdrop-blur-md transition shadow-xs cursor-pointer ${
                  isActive
                    ? 'border-primary/50 bg-menu-active/20 ring-1 ring-primary/30'
                    : 'border-surface-border bg-surface hover:border-primary/30 hover:shadow-md'
                }`}
              >
                <div>
                  {/* Top Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white shadow-sm"
                        style={{ backgroundColor: ws.themeColor || '#4F46E5' }}
                      >
                        {ws.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-text-primary font-heading line-clamp-1">{ws.name}</h3>
                        <span className="rounded-full bg-surface-alt px-2 py-0.5 text-[10px] font-semibold text-text-muted capitalize">
                          {ws.userRole || 'Member'}
                        </span>
                      </div>
                    </div>

                    {canEditWs && (
                      <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setEditingWorkspace(ws)}
                          className="rounded-lg p-1.5 text-text-muted hover:bg-surface-alt hover:text-text-primary transition"
                          title="Chỉnh sửa Workspace"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <Link
                          href={`/workspaces/${ws.id}/settings` as any}
                          className="rounded-lg p-1.5 text-text-muted hover:bg-surface-alt hover:text-text-primary transition"
                          title={tNav('menu.settings')}
                        >
                          <Settings className="h-4 w-4" />
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <p className="mt-3 line-clamp-2 text-xs text-text-secondary">
                    {ws.description || 'Không có mô tả cho không gian làm việc này.'}
                  </p>
                </div>

                {/* Footer Controls */}
                <div className="mt-5 flex items-center justify-between border-t border-surface-border pt-3">
                  <div className="flex items-center space-x-1.5 text-xs text-text-muted">
                    <Users className="h-3.5 w-3.5 text-primary" />
                    <span>{ws.memberCount || 1} Thành viên</span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenWorkspace(ws);
                    }}
                    className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      isActive
                        ? 'bg-primary text-white hover:bg-primary-hover shadow-xs'
                        : 'bg-surface-alt text-text-primary hover:bg-primary hover:text-white'
                    }`}
                  >
                    <span>Truy cập</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dialogs */}
      <CreateWorkspaceDialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      <EditWorkspaceDialog
        workspace={editingWorkspace}
        isOpen={!!editingWorkspace}
        onClose={() => setEditingWorkspace(null)}
      />
    </div>
  );
}
