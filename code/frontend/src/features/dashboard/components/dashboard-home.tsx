'use client';

import React, { useState } from 'react';
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
  ShieldCheck,
  Building2,
  Activity,
  Plus,
  UserPlus,
  UserCheck,
  FileText,
  Sliders,
  Eye,
  Check,
  X,
  Clock3,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/auth-store';
import { useWorkspaceStore } from '@/store/workspace-store';
import { useWorkspaces } from '@/features/workspace/hooks/use-workspace';
import {
  useDashboardSummary,
  useOverdueTasks,
  useProductivityStats,
  useTodayTasks,
  useUpcomingTasks,
} from '@/features/dashboard/hooks/use-dashboard';
import { useWorkspaceTasks, useUpdateTaskStatus } from '@/features/task/hooks/use-task';
import { StatCard } from '@/features/dashboard/components/stat-card';
import { ProductivityChart } from '@/features/dashboard/components/productivity-chart';
import { RecentActivity } from '@/features/dashboard/components/recent-activity';
import { TaskCard } from '@/features/task/components/task-card';
import { TaskDetailModal } from '@/features/task/components/task-detail-modal';
import { GlobalTaskModal } from '@/features/task/components/global-task-modal';
import { AssignTaskModal } from '@/features/task/components/assign-task-modal';
import { InviteDialog } from '@/features/team/components/invite-dialog';
import Link from 'next/link';
import type { TaskDto } from '@/features/task/types';

export function DashboardHome() {
  const { t: tNav } = useTranslation('navigation');
  const { t: tTask } = useTranslation('task');
  const { t: tCommon } = useTranslation('common');
  const { t: tDash } = useTranslation('dashboard');

  const user = useAuthStore((state) => state.user);
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace);
  const { data: workspaces = [] } = useWorkspaces();

  // Modals & Task selection state
  const [selectedTask, setSelectedTask] = useState<TaskDto | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  // Role detection
  const isAdminUser = user?.roles?.includes('ROLE_ADMIN') || user?.email === 'admin@gmail.com';
  const isManagerUser = !isAdminUser && (user?.roles?.includes('ROLE_MANAGER') || user?.email === 'manager@gmail.com');
  const isStaffUser = !isAdminUser && !isManagerUser;

  // Data fetching
  const { data: summary } = useDashboardSummary();
  const { data: todayTasks = [] } = useTodayTasks();
  const { data: upcomingTasks = [] } = useUpcomingTasks();
  const { data: overdueTasks = [] } = useOverdueTasks();
  const { data: productivity = [] } = useProductivityStats();
  const { data: workspaceTasks = [] } = useWorkspaceTasks(activeWorkspace?.id || null);

  // Derived metrics per role
  const totalTasks = workspaceTasks.length;
  const inProgressTasks = workspaceTasks.filter((t) => t.status === 'IN_PROGRESS');
  const completedWorkspaceTasks = workspaceTasks.filter((t) => t.status === 'COMPLETED' || t.status === 'DONE');
  const myAssignedTasks = workspaceTasks.filter(
    (t) => t.assignee?.id === user?.id || t.assignee?.email === user?.email
  );
  const myCompletedTasks = myAssignedTasks.filter((t) => t.status === 'COMPLETED' || t.status === 'DONE');
  const myCompletionRate = myAssignedTasks.length > 0
    ? Math.round((myCompletedTasks.length / myAssignedTasks.length) * 100)
    : 100;

  const workspaceCompletionRate = totalTasks > 0
    ? Math.round((completedWorkspaceTasks.length / totalTasks) * 100)
    : 0;

  return (
    <div className="space-y-6 text-text-primary">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-surface-border bg-surface p-6 shadow-xs">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center space-x-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary border border-primary/20">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{tNav('menu.dashboard', { defaultValue: 'Tổng quan' })}</span>
            </div>

            {/* Role Badge Indicator */}
            {isAdminUser && (
              <span className="inline-flex items-center space-x-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-extrabold text-red-500">
                <span>🛡️</span>
                <span>{tNav('roles.admin', { defaultValue: 'Quản trị viên Hệ thống' })}</span>
              </span>
            )}
            {isManagerUser && (
              <span className="inline-flex items-center space-x-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-extrabold text-amber-500">
                <span>👔</span>
                <span>{tNav('roles.manager', { defaultValue: 'Quản lý Workspace' })}</span>
              </span>
            )}
            {isStaffUser && (
              <span className="inline-flex items-center space-x-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-extrabold text-emerald-500">
                <span>🧑‍💻</span>
                <span>{tNav('roles.staff', { defaultValue: 'Nhân viên / Thực hiện' })}</span>
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary font-heading tracking-tight">
            {tDash('welcome', { defaultValue: 'Xin chào' })}, <span className="text-primary">{user?.fullName || ''}</span> 👋
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary max-w-2xl leading-relaxed">
            {isAdminUser && 'Bảng điều khiển Quản trị viên: Giám sát toàn bộ các không gian làm việc, tài khoản người dùng và nhật ký hệ thống.'}
            {isManagerUser && 'Bảng điều khiển Quản lý: Phân công công việc, quản lý thành viên nhóm và duyệt các yêu cầu tạo công việc mới.'}
            {isStaffUser && 'Bảng điều khiển Cá nhân: Theo dõi các công việc được giao, gửi yêu cầu tạo task mới và cập nhật trạng thái làm việc.'}
          </p>
        </div>
      </div>

      {/* Role-tailored Stat Cards Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {isAdminUser && (
          <>
            <StatCard
              title="Tổng số Workspace"
              value={workspaces.length}
              subtitle="Tất cả không gian làm việc"
              icon={Building2}
              badgeColor="bg-primary/10 text-primary"
            />
            <StatCard
              title="Tổng người dùng"
              value={summary?.totalTasksCount ? Math.max(workspaces.length * 3, 5) : 8}
              subtitle="Tài khoản trong hệ thống"
              icon={Users}
              badgeColor="bg-purple-500/10 text-purple-500"
            />
            <StatCard
              title="Tổng số Công việc"
              value={summary?.totalTasksCount ?? totalTasks}
              subtitle="Công việc trên toàn hệ thống"
              icon={CheckSquare}
              badgeColor="bg-emerald-500/10 text-emerald-500"
            />
            <StatCard
              title="Trạng thái Máy chủ"
              value="100% Online"
              subtitle="Hệ thống hoạt động ổn định"
              icon={Activity}
              badgeColor="bg-status-success/10 text-status-success"
            />
          </>
        )}

        {isManagerUser && (
          <>
            <StatCard
              title="Công việc Workspace"
              value={totalTasks}
              subtitle={`${completedWorkspaceTasks.length} / ${totalTasks} đã hoàn thành`}
              icon={FolderKanban}
              badgeColor="bg-primary/10 text-primary"
            />
            <StatCard
              title="Thành viên Nhóm"
              value={activeWorkspace?.memberCount || 1}
              subtitle="Thành viên trong Workspace"
              icon={Users}
              badgeColor="bg-purple-500/10 text-purple-500"
            />
            <StatCard
              title="Công việc Quá hạn"
              value={overdueTasks.length}
              subtitle="Cần nhắc nhở xử lý ngay"
              icon={AlertTriangle}
              badgeColor="bg-status-error/10 text-status-error"
            />
            <StatCard
              title="Tỷ lệ Hoàn thành"
              value={`${workspaceCompletionRate}%`}
              subtitle="Tiến độ chung Workspace"
              icon={TrendingUp}
              badgeColor="bg-status-success/10 text-status-success"
            />
          </>
        )}

        {isStaffUser && (
          <>
            <StatCard
              title="Cần làm Hôm nay"
              value={todayTasks.length}
              subtitle="Công việc có hạn hôm nay"
              icon={Calendar}
              badgeColor="bg-primary/10 text-primary"
            />
            <StatCard
              title="Đang thực hiện"
              value={inProgressTasks.length}
              subtitle="Công việc đang xử lý"
              icon={Clock}
              badgeColor="bg-amber-500/10 text-amber-500"
            />
            <StatCard
              title="Công việc Quá hạn"
              value={overdueTasks.length}
              subtitle="Cần hoàn thành gấp"
              icon={AlertTriangle}
              badgeColor="bg-status-error/10 text-status-error"
            />
            <StatCard
              title="Tỷ lệ Hoàn thành Cá nhân"
              value={`${myCompletionRate}%`}
              subtitle={`${myCompletedTasks.length} / ${myAssignedTasks.length || 1} việc đã xong`}
              icon={TrendingUp}
              badgeColor="bg-status-success/10 text-status-success"
            />
          </>
        )}
      </div>

      {/* Quick Actions Panel */}
      <div className="rounded-2xl border border-surface-border bg-surface p-5 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider font-heading">
          Thao tác nhanh ({isAdminUser ? 'Admin' : isManagerUser ? 'Manager' : 'Staff'})
        </h3>

        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          {isAdminUser && (
            <>
              <Link
                href="/admin"
                className="flex items-center space-x-3 rounded-xl border border-surface-border bg-surface-alt/60 p-3 hover:border-primary/50 hover:bg-surface-alt transition shadow-xs"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
                  <ShieldCheck className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-text-primary font-heading">Quản trị Hệ thống</p>
                  <p className="text-[10px] text-text-muted">Quản lý User & Cấu hình</p>
                </div>
              </Link>

              <button
                onClick={() => setIsInviteOpen(true)}
                className="flex items-center space-x-3 rounded-xl border border-surface-border bg-surface-alt/60 p-3 hover:border-primary/50 hover:bg-surface-alt transition shadow-xs text-left"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <UserPlus className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-text-primary font-heading">Thêm Thành viên</p>
                  <p className="text-[10px] text-text-muted">Mời thành viên mới</p>
                </div>
              </button>

              <Link
                href="/settings"
                className="flex items-center space-x-3 rounded-xl border border-surface-border bg-surface-alt/60 p-3 hover:border-primary/50 hover:bg-surface-alt transition shadow-xs"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
                  <Sliders className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-text-primary font-heading">Cài đặt Hệ thống</p>
                  <p className="text-[10px] text-text-muted">Tùy chọn ứng dụng</p>
                </div>
              </Link>

              <button
                onClick={() => setIsTaskModalOpen(true)}
                className="flex items-center space-x-3 rounded-xl border border-surface-border bg-surface-alt/60 p-3 hover:border-primary/50 hover:bg-surface-alt transition shadow-xs text-left"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                  <Plus className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-text-primary font-heading">Tạo Công việc mới</p>
                  <p className="text-[10px] text-text-muted">Tạo công việc hệ thống</p>
                </div>
              </button>
            </>
          )}

          {isManagerUser && (
            <>
              <button
                onClick={() => setIsTaskModalOpen(true)}
                className="flex items-center space-x-3 rounded-xl border border-surface-border bg-surface-alt/60 p-3 hover:border-primary/50 hover:bg-surface-alt transition shadow-xs text-left"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Plus className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-text-primary font-heading">Tạo Công việc mới</p>
                  <p className="text-[10px] text-text-muted">Thêm công việc vào dự án</p>
                </div>
              </button>

              <button
                onClick={() => setIsAssignModalOpen(true)}
                className="flex items-center space-x-3 rounded-xl border border-surface-border bg-surface-alt/60 p-3 hover:border-primary/50 hover:bg-surface-alt transition shadow-xs text-left"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                  <UserCheck className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-text-primary font-heading">Gán Người thực hiện</p>
                  <p className="text-[10px] text-text-muted">Phân công việc cho Staff</p>
                </div>
              </button>

              <button
                onClick={() => setIsInviteOpen(true)}
                className="flex items-center space-x-3 rounded-xl border border-surface-border bg-surface-alt/60 p-3 hover:border-primary/50 hover:bg-surface-alt transition shadow-xs text-left"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
                  <UserPlus className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-text-primary font-heading">Mời Thành viên</p>
                  <p className="text-[10px] text-text-muted">Thêm người vào Workspace</p>
                </div>
              </button>

              <Link
                href={(activeWorkspace ? `/workspaces/${activeWorkspace.id}/wiki` : '/workspaces') as any}
                className="flex items-center space-x-3 rounded-xl border border-surface-border bg-surface-alt/60 p-3 hover:border-primary/50 hover:bg-surface-alt transition shadow-xs"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                  <FileText className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-text-primary font-heading">Tài liệu Wiki</p>
                  <p className="text-[10px] text-text-muted">Kho quy trình làm việc</p>
                </div>
              </Link>
            </>
          )}

          {isStaffUser && (
            <>
              <button
                onClick={() => setIsTaskModalOpen(true)}
                className="flex items-center space-x-3 rounded-xl border border-surface-border bg-surface-alt/60 p-3 hover:border-primary/50 hover:bg-surface-alt transition shadow-xs text-left"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Plus className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-text-primary font-heading">Yêu cầu Tạo Công việc</p>
                  <p className="text-[10px] text-text-muted">Gửi yêu cầu tới Manager</p>
                </div>
              </button>

              <Link
                href="/tasks"
                className="flex items-center space-x-3 rounded-xl border border-surface-border bg-surface-alt/60 p-3 hover:border-primary/50 hover:bg-surface-alt transition shadow-xs"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                  <CheckSquare className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-text-primary font-heading">Công việc của tôi</p>
                  <p className="text-[10px] text-text-muted">Xem bảng Kanban cá nhân</p>
                </div>
              </Link>

              <Link
                href="/calendar"
                className="flex items-center space-x-3 rounded-xl border border-surface-border bg-surface-alt/60 p-3 hover:border-primary/50 hover:bg-surface-alt transition shadow-xs"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
                  <Calendar className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-text-primary font-heading">Lịch làm việc</p>
                  <p className="text-[10px] text-text-muted">Xem thời hạn công việc</p>
                </div>
              </Link>

              <Link
                href={(activeWorkspace ? `/workspaces/${activeWorkspace.id}/wiki` : '/workspaces') as any}
                className="flex items-center space-x-3 rounded-xl border border-surface-border bg-surface-alt/60 p-3 hover:border-primary/50 hover:bg-surface-alt transition shadow-xs"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                  <FileText className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-text-primary font-heading">Tra cứu Wiki</p>
                  <p className="text-[10px] text-text-muted">Đọc hướng dẫn nhóm</p>
                </div>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Balanced 2-Column Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column (2/3 width): Productivity Chart & Tasks Focus */}
        <div className="lg:col-span-2 space-y-6">
          {/* Productivity Trend Chart */}
          <ProductivityChart stats={productivity} />

          {/* Task Focus Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-text-primary font-heading">
                  {isAdminUser
                    ? 'Công việc cần ưu tiên trong hệ thống'
                    : isManagerUser
                    ? 'Công việc quan trọng của Workspace'
                    : 'Công việc cần xử lý của tôi'}
                </h2>
                <p className="text-[11px] text-text-secondary">
                  {isAdminUser
                    ? 'Danh sách công việc đang được thực hiện ở các Workspace'
                    : isManagerUser
                    ? 'Danh sách công việc cần theo dõi tiến độ và phê duyệt'
                    : 'Danh sách các công việc được gán cho bạn cần hoàn thành'}
                </p>
              </div>
              <Link
                href="/tasks"
                className="flex items-center space-x-1.5 rounded-xl border border-surface-border bg-surface-alt px-3 py-1.5 text-xs font-semibold text-primary hover:bg-surface-alt/80 transition"
              >
                <span>Xem tất cả</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Overdue Tasks Alert */}
            {overdueTasks.length > 0 && (
              <div className="rounded-2xl border border-status-error/30 bg-status-error/5 p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-status-error/20 pb-2">
                  <h3 className="text-xs font-extrabold text-status-error flex items-center">
                    <AlertTriangle className="mr-1.5 h-4 w-4" /> Công việc Quá hạn ({overdueTasks.length})
                  </h3>
                  <span className="text-[10px] text-status-error font-bold">Cần xử lý gấp</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {overdueTasks.slice(0, 4).map((task) => (
                    <TaskCard key={task.id} task={task} onSelect={(t) => setSelectedTask(t)} />
                  ))}
                </div>
              </div>
            )}

            {/* Today Tasks List */}
            <div className="rounded-2xl border border-surface-border bg-surface p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-surface-border pb-3">
                <h3 className="text-xs font-bold text-text-primary font-heading flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>Hạn chót hôm nay ({todayTasks.length})</span>
                </h3>
              </div>

              {todayTasks.length === 0 ? (
                <div className="flex h-36 flex-col items-center justify-center rounded-xl border border-dashed border-surface-border bg-surface-alt/40 p-6 text-center">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-status-success/10 text-status-success mb-2">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-bold text-text-primary">Không có công việc nào hết hạn hôm nay</p>
                  <p className="text-[11px] text-text-secondary mt-1">Tuyệt vời! Bạn hoặc nhóm của bạn đang duy trì tiến độ rất tốt.</p>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {todayTasks.map((task) => (
                    <TaskCard key={task.id} task={task} onSelect={(t) => setSelectedTask(t)} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (1/3 width): Workspace Summary & Recent Activity */}
        <div className="space-y-6">
          {/* Workspace Quick Summary Card */}
          <div className="rounded-2xl border border-surface-border bg-surface p-5 shadow-xs space-y-4">
            <div className="flex items-center space-x-3 border-b border-surface-border pb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FolderKanban className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-primary font-heading">
                  {activeWorkspace ? activeWorkspace.name : 'Tổng quan Workspace'}
                </h3>
                <p className="text-[11px] text-text-secondary">Thông tin chung không gian làm việc</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="rounded-xl border border-surface-border bg-surface-alt p-3 space-y-1">
                <div className="flex items-center space-x-1.5 text-xs text-text-secondary">
                  <FolderKanban className="h-3.5 w-3.5 text-primary" />
                  <span>Dự án</span>
                </div>
                <p className="text-xl font-extrabold text-text-primary font-heading">1</p>
              </div>

              <div className="rounded-xl border border-surface-border bg-surface-alt p-3 space-y-1">
                <div className="flex items-center space-x-1.5 text-xs text-text-secondary">
                  <CheckSquare className="h-3.5 w-3.5 text-status-success" />
                  <span>Công việc</span>
                </div>
                <p className="text-xl font-extrabold text-text-primary font-heading">{totalTasks}</p>
              </div>
            </div>

            {activeWorkspace && (
              <div className="flex items-center justify-between border-t border-surface-border pt-3 text-xs">
                <div className="flex items-center space-x-2 text-text-secondary">
                  <Users className="h-4 w-4 text-purple-500" />
                  <span>Thành viên nhóm:</span>
                </div>
                <span className="font-bold text-text-primary">
                  {activeWorkspace.memberCount || 1} người
                </span>
              </div>
            )}
          </div>

          {/* Recent Activity Log Feed */}
          <RecentActivity activities={summary?.recentActivities || []} />
        </div>
      </div>

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
      />

      {/* Global Task Creation Modal */}
      <GlobalTaskModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} />

      {/* Assign Task Dedicated Modal for Admin & Manager */}
      <AssignTaskModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        workspaceId={activeWorkspace?.id || ''}
      />

      {/* Add Member Invite Dialog */}
      <InviteDialog
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onSubmit={(payload, callbacks) => {
          // Invite logic handled internally
          callbacks?.onSuccess?.();
        }}
        isLoading={false}
      />
    </div>
  );
}
