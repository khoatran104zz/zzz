'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import {
  Home,
  LogOut,
  Settings,
  BookOpen,
  Palette,
  Calendar,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useWorkspaceStore } from '@/store/workspace-store';
import { useLogout } from '@/features/auth/hooks/use-auth';
import { WorkspaceSwitcher } from './workspace-switcher';

export function WorkspaceSidebar() {
  const pathname = usePathname();
  const { t: tNav } = useTranslation('navigation');
  const user = useAuthStore((state) => state.user);
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace);
  const logoutMutation = useLogout();

  const isAdminUser = user?.roles?.includes('ROLE_ADMIN') || user?.email === 'admin@gmail.com';
  const isManagerUser = !isAdminUser && (user?.roles?.includes('ROLE_MANAGER') || user?.email === 'manager@gmail.com');
  const isStaffUser = !isAdminUser && !isManagerUser;

  const isDashboardActive = pathname === '/' || pathname === '/dashboard';
  const isCalendarActive = pathname === '/calendar';
  const isWikiActive = pathname.includes('/wiki');
  const isWhiteboardActive = pathname.includes('/whiteboards');
  const isSettingsActive = pathname.startsWith('/settings');
  const isAdminActive = pathname.startsWith('/admin');

  const roleBadgeConfig = isAdminUser
    ? { label: tNav('roles.admin', { defaultValue: 'Quản trị viên' }), icon: '🛡️', style: 'bg-red-500/10 text-red-500 border-red-500/20' }
    : isManagerUser
    ? { label: tNav('roles.manager', { defaultValue: 'Quản lý' }), icon: '👔', style: 'bg-amber-500/10 text-amber-500 border-amber-500/20' }
    : { label: tNav('roles.staff', { defaultValue: 'Nhân viên' }), icon: '🧑‍💻', style: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' };

  return (
    <aside className="hidden md:flex h-screen w-[260px] flex-col border-r border-surface-border bg-surface-sidebar p-4 text-text-secondary transition-colors">
      {/* Brand Header - Clicking logo redirects to Dashboard / */}
      <Link href="/" className="mb-6 flex items-center space-x-2.5 px-2 group cursor-pointer" title="Về trang Tổng quan">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-white font-extrabold shadow-md transition group-hover:scale-105">
          <Sparkles className="h-4 w-4" />
        </div>
        <h1 className="text-lg font-bold tracking-tight text-text-primary font-heading">
          Task<span className="text-primary">Flow</span>
        </h1>
      </Link>

      {/* Main Navigation Items */}
      <nav className="space-y-1.5">
        {/* 1. Admin Portal Link for System Administrators */}
        {isAdminUser && (
          <Link
            href="/admin"
            className={`flex h-10 items-center space-x-3 rounded-xl border px-3.5 text-xs font-bold transition shadow-xs ${
              isAdminActive
                ? 'border-red-500/40 bg-red-500/10 text-red-500'
                : 'border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10'
            }`}
          >
            <ShieldAlert className="h-4 w-4 shrink-0 text-red-500" />
            <span className="truncate">{tNav('roles.systemAdmin', { defaultValue: 'Quản trị hệ thống' })}</span>
          </Link>
        )}

        {/* 2. Tổng quan (Dashboard) at the top */}
        <Link
          href="/"
          className={`flex h-10 items-center space-x-3 rounded-lg px-3.5 text-xs font-medium transition ${
            isDashboardActive
              ? 'bg-menu-active text-menu-activeText font-semibold shadow-xs'
              : 'text-text-secondary hover:bg-surface-alt hover:text-text-primary'
          }`}
        >
          <Home className="h-4 w-4" />
          <span>{tNav('menu.dashboard', { defaultValue: 'Tổng quan' })}</span>
        </Link>

        {/* 3. Workspace Dropdown switcher right below Dashboard */}
        <div className="pt-0.5 pb-1">
          <WorkspaceSwitcher />
        </div>

        {/* 4. Other navigation items */}
        <Link
          href="/calendar"
          className={`flex h-10 items-center space-x-3 rounded-lg px-3.5 text-xs font-medium transition ${
            isCalendarActive
              ? 'bg-menu-active text-menu-activeText font-semibold shadow-xs'
              : 'text-text-secondary hover:bg-surface-alt hover:text-text-primary'
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span>{tNav('menu.calendar', { defaultValue: 'Lịch' })}</span>
        </Link>

        <Link
          href={(activeWorkspace ? `/workspaces/${activeWorkspace.id}/wiki` : '/workspaces') as any}
          className={`flex h-10 items-center space-x-3 rounded-lg px-3.5 text-xs font-medium transition ${
            isWikiActive
              ? 'bg-menu-active text-menu-activeText font-semibold shadow-xs'
              : 'text-text-secondary hover:bg-surface-alt hover:text-text-primary'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>{tNav('menu.wiki', { defaultValue: 'Wiki' })}</span>
        </Link>

        <Link
          href={(activeWorkspace ? `/workspaces/${activeWorkspace.id}/whiteboards` : '/workspaces') as any}
          className={`flex h-10 items-center space-x-3 rounded-lg px-3.5 text-xs font-medium transition ${
            isWhiteboardActive
              ? 'bg-menu-active text-menu-activeText font-semibold shadow-xs'
              : 'text-text-secondary hover:bg-surface-alt hover:text-text-primary'
          }`}
        >
          <Palette className="h-4 w-4" />
          <span>{tNav('menu.whiteboard', { defaultValue: 'Bảng vẽ' })}</span>
        </Link>

        <Link
          href="/settings"
          className={`flex h-10 items-center space-x-3 rounded-lg px-3.5 text-xs font-medium transition ${
            isSettingsActive
              ? 'bg-menu-active text-menu-activeText font-semibold shadow-xs'
              : 'text-text-secondary hover:bg-surface-alt hover:text-text-primary'
          }`}
        >
          <Settings className="h-4 w-4" />
          <span>{tNav('menu.settings', { defaultValue: 'Cài đặt' })}</span>
        </Link>
      </nav>

      {/* User Footer Profile */}
      <div className="border-t border-surface-border pt-3 mt-auto">
        <div className="flex items-center justify-between rounded-xl bg-surface-alt p-2 shadow-xs">
          <div className="flex items-center space-x-2.5 truncate">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white shadow-sm shrink-0">
              {user?.fullName?.substring(0, 1).toUpperCase() || 'U'}
            </div>
            <div className="truncate min-w-0">
              <p className="text-xs font-semibold text-text-primary truncate">{user?.fullName}</p>
              <div className="mt-0.5 flex items-center space-x-1">
                <span className={`inline-flex items-center space-x-1 rounded-full border px-1.5 py-0.5 text-[9px] font-semibold leading-none ${roleBadgeConfig.style}`}>
                  <span>{roleBadgeConfig.icon}</span>
                  <span>{roleBadgeConfig.label}</span>
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => logoutMutation.mutate()}
            title={tNav('user.logout', { defaultValue: 'Đăng xuất' })}
            className="rounded-lg p-1.5 text-text-muted hover:bg-status-error/10 hover:text-status-error transition shrink-0"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
