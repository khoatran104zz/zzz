'use client';

import { useState } from 'react';
import { Menu, Plus, Settings } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useUiStore } from '@/store/uiStore';
import { NotificationDropdown } from '@/features/notification/components/notification-dropdown';
import { SearchBar } from '@/features/search/components/search-bar';
import { GlobalTaskModal } from '@/features/task/components/global-task-modal';
import { useAuthStore } from '@/store/auth-store';

export default function Topbar() {
  const { toggleSidebar } = useUiStore();
  const user = useAuthStore((state) => state.user);
  const { t: tTask } = useTranslation('task');
  const { t: tNav } = useTranslation('navigation');

  const isAdmin = user?.roles?.includes('ROLE_ADMIN') || user?.email === 'admin@gmail.com';
  const isManager = user?.roles?.includes('ROLE_MANAGER') || user?.email === 'manager@gmail.com';
  const canCreateTask = isAdmin || isManager;

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-surface-border bg-surface px-6 shadow-sm backdrop-blur-md transition-colors">
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg text-text-secondary hover:bg-surface-alt hover:text-text-primary transition-colors"
          title="Toggle Sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <SearchBar />
      </div>

      <div className="flex items-center gap-3">
        {/* Prominent Create Button - Admin & Manager Only */}
        {canCreateTask && (
          <button
            onClick={() => setIsTaskModalOpen(true)}
            className="flex items-center space-x-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-primary-hover active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">{tTask('createTask')}</span>
          </button>
        )}

        <NotificationDropdown />

        <Link
          href="/settings"
          className="p-2 rounded-lg text-text-secondary hover:bg-surface-alt hover:text-text-primary transition-colors"
          title={tNav('menu.settings')}
        >
          <Settings className="h-4 w-4" />
        </Link>

        <Link
          href="/settings"
          className="flex items-center gap-2 p-1.5 rounded-full border border-surface-border bg-surface-alt hover:border-primary transition-colors"
          title={user?.fullName || 'User Profile'}
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary font-bold text-[10px] text-white">
            {user?.fullName?.substring(0, 1).toUpperCase() || 'U'}
          </div>
        </Link>
      </div>

      <GlobalTaskModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} />
    </header>
  );
}
