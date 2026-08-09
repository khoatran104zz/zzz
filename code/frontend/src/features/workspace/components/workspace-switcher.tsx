'use client';

import React, { useState } from 'react';
import { Check, ChevronDown, Layers, Plus } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useWorkspaceStore } from '@/store/workspace-store';
import { useAuthStore } from '@/store/auth-store';
import { useWorkspaces } from '../hooks/use-workspace';
import { CreateWorkspaceDialog } from './create-workspace-dialog';

export function WorkspaceSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation('workspace');
  const user = useAuthStore((state) => state.user);
  const [isOpen, setIsOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const isAdmin = user?.roles?.includes('ROLE_ADMIN') || user?.email === 'admin@gmail.com';
  const isManager = user?.roles?.includes('ROLE_MANAGER') || user?.email === 'manager@gmail.com';
  const canCreateWorkspace = isAdmin || isManager;

  const { data: workspaces = [] } = useWorkspaces();
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace);
  const setActiveWorkspace = useWorkspaceStore((state) => state.setActiveWorkspace);

  const isWorkspaceActive = pathname.startsWith('/workspaces');

  const handleSelectWorkspace = (ws: typeof workspaces[0]) => {
    setActiveWorkspace(ws);
    setIsOpen(false);
    router.push(`/workspaces/${ws.id}`);
  };

  return (
    <>
      <div className="relative">
        {/* Sidebar Menu Item Button matching other sidebar links */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex h-10 w-full items-center justify-between rounded-lg px-3.5 text-xs font-medium transition ${
            isWorkspaceActive
              ? 'bg-menu-active text-menu-activeText font-semibold shadow-xs'
              : 'text-text-secondary hover:bg-surface-alt hover:text-text-primary'
          }`}
        >
          <div className="flex items-center space-x-3 truncate">
            <Layers className="h-4 w-4 shrink-0 text-primary" />
            <span className="truncate">
              {activeWorkspace?.name || t('title', { defaultValue: 'Workspace' })}
            </span>
          </div>
          <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-text-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Beautiful Clean Workspace List Dropdown */}
        {isOpen && (
          <div
            className="absolute left-0 top-full z-50 mt-1.5 w-full min-w-[220px] rounded-xl border border-surface-border bg-surface p-2 shadow-xl backdrop-blur-md"
            onMouseLeave={() => setIsOpen(false)}
          >
            <div className="mb-2 px-2 py-1 text-[10px] font-bold tracking-wider text-text-muted uppercase">
              {t('myWorkspaces', { defaultValue: 'Workspaces của tôi' })}
            </div>

            <div className="max-h-56 overflow-y-auto space-y-1 pr-0.5">
              {workspaces.length === 0 ? (
                <div className="px-2 py-3 text-center text-xs text-text-muted">
                  {t('noWorkspaces', { defaultValue: 'Chưa có Workspace' })}
                </div>
              ) : (
                workspaces.map((ws) => {
                  const isActive = activeWorkspace?.id === ws.id;
                  return (
                    <button
                      key={ws.id}
                      onClick={() => handleSelectWorkspace(ws)}
                      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs transition ${
                        isActive
                          ? 'bg-primary/10 text-primary font-semibold border border-primary/20'
                          : 'text-text-secondary hover:bg-surface-alt hover:text-text-primary'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 truncate">
                        <div
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-bold text-white text-[10px] shadow-xs"
                          style={{ backgroundColor: ws.themeColor || '#4F46E5' }}
                        >
                          {ws.name.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="truncate text-xs">{ws.name}</span>
                      </div>

                      {isActive && <Check className="h-3.5 w-3.5 shrink-0 text-primary" />}
                    </button>
                  );
                })
              )}
            </div>

            {/* Create New Workspace Action */}
            {canCreateWorkspace && (
              <div className="mt-2 border-t border-surface-border pt-1.5">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setIsCreateOpen(true);
                  }}
                  className="flex w-full items-center space-x-2 rounded-lg px-2.5 py-1.5 text-xs font-bold text-primary hover:bg-primary/10 transition"
                >
                  <Plus className="h-4 w-4" />
                  <span>{t('createWorkspace', { defaultValue: 'Tạo Workspace mới' })}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Create Workspace */}
      <CreateWorkspaceDialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </>
  );
}
