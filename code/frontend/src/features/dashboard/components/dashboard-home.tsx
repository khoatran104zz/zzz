'use client';

import React from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  FolderKanban,
  CheckSquare,
  Users,
  Sparkles,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/auth-store';
import { useWorkspaceStore } from '@/store/workspace-store';
import {
  useDashboardSummary,
  useOverdueTasks,
  useProductivityStats,
  useTodayTasks,
  useUpcomingTasks,
} from '@/features/dashboard/hooks/use-dashboard';
import { useProjects } from '@/features/project/hooks/use-project';
import { StatCard } from '@/features/dashboard/components/stat-card';
import { ProductivityChart } from '@/features/dashboard/components/productivity-chart';
import { RecentActivity } from '@/features/dashboard/components/recent-activity';
import { TaskCard } from '@/features/task/components/task-card';
import Link from 'next/link';

export function DashboardHome() {
  const { t: tNav } = useTranslation('navigation');
  const { t: tTask } = useTranslation('task');
  const { t: tCommon } = useTranslation('common');
  const { t: tProj } = useTranslation('project');

  const user = useAuthStore((state) => state.user);
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace);

  const isAdminUser = user?.roles?.includes('ROLE_ADMIN') || user?.email === 'admin@gmail.com';
  const isManagerUser = !isAdminUser && (user?.roles?.includes('ROLE_MANAGER') || user?.email === 'manager@gmail.com');

  const { data: summary } = useDashboardSummary();
  const { data: todayTasks = [] } = useTodayTasks();
  const { data: upcomingTasks = [] } = useUpcomingTasks();
  const { data: overdueTasks = [] } = useOverdueTasks();
  const { data: productivity = [] } = useProductivityStats();
  const { data: projects = [] } = useProjects(activeWorkspace?.id || null);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-surface-border bg-surface p-6 shadow-sm">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center space-x-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary border border-primary/20">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{tNav('menu.dashboard')}</span>
            </div>
            {/* Role Badge */}
            {isAdminUser && (
              <span className="inline-flex items-center space-x-1 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-bold text-red-500">
                <span>🛡️</span>
                <span>{tNav('roles.admin', { defaultValue: 'Quản trị viên' })}</span>
              </span>
            )}
            {isManagerUser && (
              <span className="inline-flex items-center space-x-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-500">
                <span>👔</span>
                <span>{tNav('roles.manager', { defaultValue: 'Quản lý' })}</span>
              </span>
            )}
            {!isAdminUser && !isManagerUser && (
              <span className="inline-flex items-center space-x-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-500">
                <span>🧑‍💻</span>
                <span>{tNav('roles.staff', { defaultValue: 'Nhân viên' })}</span>
              </span>
            )}
          </div>

          <h1 className="text-2xl font-extrabold text-text-primary font-heading tracking-tight">
            Xin chào, <span className="text-primary">{user?.fullName || ''}</span> 👋
          </h1>
          <p className="text-xs text-text-secondary max-w-xl leading-relaxed">
            {isAdminUser && 'Hệ thống Quản trị: Theo dõi toàn bộ tiến độ công việc, dự án và nhật ký hoạt động hệ thống.'}
            {isManagerUser && 'Hệ thống Quản lý: Điều phối dự án, theo dõi tiến độ Sprint và khối lượng công việc nhóm.'}
            {!isAdminUser && !isManagerUser && 'Không gian làm việc Nhân viên: Theo dõi các công việc được giao, tiến độ cá nhân và lịch công việc.'}
          </p>
        </div>
      </div>

      {/* Statistics Cards Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={tNav('submenus.myTasks')}
          value={summary?.todayTasksCount ?? todayTasks.length}
          subtitle="Công việc cần làm hôm nay"
          icon={Calendar}
          badgeColor="bg-primary/10 text-primary"
        />

        <StatCard
          title={tNav('submenus.allTasks')}
          value={summary?.upcomingTasksCount ?? upcomingTasks.length}
          subtitle="Hạn chót trong 7 ngày tới"
          icon={Clock}
          badgeColor="bg-purple-500/10 text-purple-500"
        />

        <StatCard
          title={tNav('submenus.overdueTasks')}
          value={summary?.overdueTasksCount ?? overdueTasks.length}
          subtitle="Công việc đã quá hạn"
          icon={AlertTriangle}
          badgeColor="bg-status-error/10 text-status-error"
        />

        <StatCard
          title="Completion Rate"
          value={`${summary?.completionRate ?? 0}%`}
          subtitle={`${summary?.completedTasksCount ?? 0} / ${summary?.totalTasksCount ?? 0} đã hoàn thành`}
          icon={TrendingUp}
          badgeColor="bg-status-success/10 text-status-success"
        />
      </div>

      {/* Balanced 2-Column Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column (2/3 width): Productivity Chart & Tasks Focus */}
        <div className="lg:col-span-2 space-y-6">
          {/* 7-Day Productivity Chart */}
          <ProductivityChart stats={productivity} />

          {/* Task Focus Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-text-primary font-heading">{tTask('title')}</h2>
                <p className="text-[11px] text-text-secondary">Các công việc cần tập trung xử lý ngay</p>
              </div>
              <Link
                href="/tasks"
                className="flex items-center space-x-1.5 rounded-lg border border-surface-border bg-surface-alt px-3 py-1.5 text-xs font-medium text-primary hover:bg-surface-alt/80 transition"
              >
                <span>{tNav('submenus.allTasks')}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Overdue Tasks Alert Section */}
            {overdueTasks.length > 0 && (
              <div className="rounded-xl border border-status-error/30 bg-status-error/5 p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-status-error/20 pb-2">
                  <h3 className="text-xs font-semibold text-status-error flex items-center">
                    <AlertTriangle className="mr-1.5 h-4 w-4" /> {tNav('submenus.overdueTasks')} ({overdueTasks.length})
                  </h3>
                  <span className="text-[10px] text-status-error font-medium">Cần xử lý gấp</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {overdueTasks.slice(0, 4).map((task) => (
                    <TaskCard key={task.id} task={task} onSelect={() => {}} />
                  ))}
                </div>
              </div>
            )}

            {/* Due Today Tasks */}
            <div className="rounded-xl border border-surface-border bg-surface p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-surface-border pb-3">
                <h3 className="text-xs font-bold text-text-primary font-heading flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>Hôm nay ({todayTasks.length})</span>
                </h3>
              </div>

              {todayTasks.length === 0 ? (
                <div className="flex h-36 flex-col items-center justify-center rounded-lg border border-dashed border-surface-border bg-surface-alt p-6 text-center">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-status-success/10 text-status-success mb-2">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-medium text-text-primary">{tCommon('emptyState.title')}</p>
                  <p className="text-[11px] text-text-secondary mt-1">{tCommon('emptyState.description')}</p>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {todayTasks.map((task) => (
                    <TaskCard key={task.id} task={task} onSelect={() => {}} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (1/3 width): Workspace Summary & Recent Activity */}
        <div className="space-y-6">
          {/* Workspace Quick Summary Card */}
          <div className="rounded-xl border border-surface-border bg-surface p-5 shadow-sm space-y-4">
            <div className="flex items-center space-x-3 border-b border-surface-border pb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FolderKanban className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text-primary font-heading">Workspace Overview</h3>
                <p className="text-[11px] text-text-secondary">Thông tin không gian làm việc</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="rounded-lg border border-surface-border bg-surface-alt p-3 space-y-1">
                <div className="flex items-center space-x-1.5 text-xs text-text-secondary">
                  <FolderKanban className="h-3.5 w-3.5 text-primary" />
                  <span>{tProj('title')}</span>
                </div>
                <p className="text-xl font-extrabold text-text-primary font-heading">{projects.length}</p>
              </div>

              <div className="rounded-lg border border-surface-border bg-surface-alt p-3 space-y-1">
                <div className="flex items-center space-x-1.5 text-xs text-text-secondary">
                  <CheckSquare className="h-3.5 w-3.5 text-status-success" />
                  <span>{tTask('title')}</span>
                </div>
                <p className="text-xl font-extrabold text-text-primary font-heading">{summary?.totalTasksCount || 0}</p>
              </div>
            </div>

            {activeWorkspace && (
              <div className="flex items-center justify-between border-t border-surface-border pt-3 text-xs">
                <div className="flex items-center space-x-2 text-text-secondary">
                  <Users className="h-4 w-4 text-purple-500" />
                  <span>Thành viên:</span>
                </div>
                <span className="font-semibold text-text-primary">{activeWorkspace.memberCount || 1} người</span>
              </div>
            )}
          </div>

          {/* Recent Activity Log Feed */}
          <RecentActivity activities={summary?.recentActivities || []} />
        </div>
      </div>
    </div>
  );
}
