'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Menu, Plus, Settings, User, LogOut, Shield, ChevronDown, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useUiStore } from '@/store/uiStore';
import { NotificationDropdown } from '@/features/notification/components/notification-dropdown';
import { SearchBar } from '@/features/search/components/search-bar';
import { GlobalTaskModal } from '@/features/task/components/global-task-modal';
import { CreateUserModal } from '@/features/admin/components/create-user-modal';
import { useAuthStore } from '@/store/auth-store';

export default function Topbar() {
  const { toggleSidebar } = useUiStore();
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const router = useRouter();
  const { t: tTask } = useTranslation('task');
  const { t: tNav } = useTranslation('navigation');

  const canCreateTask = !!user;
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const isAdmin = user?.roles?.includes('ROLE_ADMIN') || user?.email === 'admin@gmail.com';
  const isManager = user?.roles?.includes('ROLE_MANAGER') || user?.email === 'manager@gmail.com';
  const isStaff = !isAdmin && !isManager;

  const createButtonLabel = isStaff ? 'Yêu cầu tạo công việc mới' : tTask('createTask', { defaultValue: 'Tạo công việc mới' });

  // Close user menu dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsUserMenuOpen(false);
    clearAuth();
    router.push('/login');
  };

  const getUserRoleLabel = () => {
    if (isAdmin) return 'Quản trị viên (ADMIN)';
    if (isManager) return 'Quản lý (MANAGER)';
    return 'Nhân viên (STAFF)';
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-surface-border bg-surface px-6 shadow-xs backdrop-blur-md transition-colors">
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
        {/* Admin Create Account Button */}
        {isAdmin && (
          <button
            type="button"
            onClick={() => setIsCreateUserModalOpen(true)}
            className="flex items-center space-x-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-bold text-emerald-500 shadow-xs transition hover:bg-emerald-500 hover:text-white active:scale-95"
            title="Tạo tài khoản người dùng mới và cấp quyền"
          >
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Tạo tài khoản</span>
          </button>
        )}

        {/* Prominent Create / Request Button */}
        {canCreateTask && (
          <button
            onClick={() => setIsTaskModalOpen(true)}
            className="flex items-center space-x-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-primary-hover active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">{createButtonLabel}</span>
          </button>
        )}

        <NotificationDropdown />

        <Link
          href="/settings"
          className="p-2 rounded-xl text-text-secondary hover:bg-surface-alt hover:text-text-primary transition-colors"
          title={tNav('menu.settings', { defaultValue: 'Cài đặt hệ thống' })}
        >
          <Settings className="h-4.5 w-4.5" />
        </Link>

        {/* User Profile Avatar Dropdown Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            type="button"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center space-x-1.5 p-1 rounded-full border border-surface-border bg-surface-alt hover:border-primary/50 hover:bg-surface transition-all shadow-xs"
            title={user?.fullName || 'Tài khoản cá nhân'}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary font-bold text-xs text-white shadow-xs">
              {user?.fullName?.substring(0, 1).toUpperCase() || 'U'}
            </div>
            <ChevronDown className={`h-3.5 w-3.5 text-text-muted transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu Box */}
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-surface-border bg-surface p-2 shadow-2xl animate-in fade-in duration-150 z-50 text-text-primary space-y-1">
              
              {/* Profile Header Summary */}
              <div className="p-3 rounded-xl bg-surface-alt/60 border border-surface-border/60 space-y-1">
                <p className="text-xs font-bold text-text-primary font-heading truncate">
                  {user?.fullName || 'User'}
                </p>
                <p className="text-[11px] text-text-muted truncate">
                  {user?.email || 'user@example.com'}
                </p>
                <div className="pt-1 flex items-center space-x-1 text-[10px] font-bold text-primary">
                  <Shield className="h-3 w-3" />
                  <span>{getUserRoleLabel()}</span>
                </div>
              </div>

              <div className="my-1 border-t border-surface-border" />

              {/* Menu Option 1: Hồ sơ & Tài khoản */}
              <Link
                href="/profile"
                onClick={() => setIsUserMenuOpen(false)}
                className="flex items-center space-x-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-text-primary hover:bg-primary/10 hover:text-primary transition"
              >
                <User className="h-4 w-4 text-primary" />
                <span>Hồ sơ & Tài khoản</span>
              </Link>

              {/* Menu Option 2: Cài đặt hệ thống */}
              <Link
                href="/settings"
                onClick={() => setIsUserMenuOpen(false)}
                className="flex items-center space-x-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-text-primary hover:bg-surface-alt transition"
              >
                <Settings className="h-4 w-4 text-text-secondary" />
                <span>Cài đặt hệ thống</span>
              </Link>

              <div className="my-1 border-t border-surface-border" />

              {/* Menu Option 3: Đăng xuất */}
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center space-x-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-status-error hover:bg-status-error/10 transition"
              >
                <LogOut className="h-4 w-4" />
                <span>Đăng xuất</span>
              </button>

            </div>
          )}
        </div>

      </div>

      <GlobalTaskModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} />
      <CreateUserModal isOpen={isCreateUserModalOpen} onClose={() => setIsCreateUserModalOpen(false)} />
    </header>
  );
}
