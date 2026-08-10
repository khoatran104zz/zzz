'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Calendar, Clock, User, CheckCircle2 } from 'lucide-react';
import type { TaskDto, TaskStatus } from '@/features/task/types';
import { useAuthStore } from '@/store/auth-store';

interface WorkspaceTimelineTabProps {
  tasks: TaskDto[];
  isLoading: boolean;
  onOpenCreateTask: () => void;
  onSelectTask?: (task: TaskDto) => void;
}

export function WorkspaceTimelineTab({
  tasks,
  isLoading,
  onOpenCreateTask,
  onSelectTask,
}: WorkspaceTimelineTabProps) {
  const { t } = useTranslation('workspace');
  const user = useAuthStore((state) => state.user);
  const canCreateTask = !!user;

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'TODO':
        return <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">Cần làm</span>;
      case 'IN_PROGRESS':
        return <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20">Đang làm</span>;
      case 'IN_REVIEW':
        return <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold text-purple-600 dark:text-purple-400 border border-purple-500/20">Đang xem xét</span>;
      case 'COMPLETED':
      case 'DONE':
      default:
        return <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">Hoàn thành</span>;
    }
  };

  const getTaskProgressBarClass = (status: TaskStatus) => {
    switch (status) {
      case 'TODO':
        return 'bg-indigo-500';
      case 'IN_PROGRESS':
        return 'bg-amber-500';
      case 'IN_REVIEW':
        return 'bg-purple-600';
      case 'COMPLETED':
      case 'DONE':
      default:
        return 'bg-emerald-500';
    }
  };

  const getProgressPercentage = (status: TaskStatus) => {
    switch (status) {
      case 'TODO': return 15;
      case 'IN_PROGRESS': return 55;
      case 'IN_REVIEW': return 85;
      case 'COMPLETED':
      case 'DONE': return 100;
      default: return 30;
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '---';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Generate dynamic 4 detailed date columns for the timeline header
  const today = new Date();
  const dateHeader1 = `01/${String(today.getMonth() + 1).padStart(2, '0')} - 10/${String(today.getMonth() + 1).padStart(2, '0')}`;
  const dateHeader2 = `11/${String(today.getMonth() + 1).padStart(2, '0')} - 20/${String(today.getMonth() + 1).padStart(2, '0')}`;
  const dateHeader3 = `21/${String(today.getMonth() + 1).padStart(2, '0')} - 30/${String(today.getMonth() + 1).padStart(2, '0')}`;
  const dateHeader4 = `01/${String((today.getMonth() + 2) % 12 || 12).padStart(2, '0')} - 10/${String((today.getMonth() + 2) % 12 || 12).padStart(2, '0')}`;

  return (
    <div className="space-y-4 text-text-primary pb-8">
      {/* Detailed Timeline Gantt Container */}
      <div className="relative rounded-2xl border border-surface-border bg-surface overflow-hidden shadow-xs flex flex-col min-h-[480px]">
        <div className="flex flex-1 overflow-x-auto">
          
          {/* Left Summary Table Panel */}
          <div className="w-[420px] shrink-0 border-r border-surface-border bg-surface">
            {/* Table Column Headers */}
            <div className="grid grid-cols-4 gap-2 bg-surface-alt/70 px-4 py-3 text-[11px] font-bold text-text-muted border-b border-surface-border uppercase">
              <span className="col-span-1">{t('timeline.work', { defaultValue: 'Công việc' })}</span>
              <span className="text-center">{t('timeline.status', { defaultValue: 'Trạng thái' })}</span>
              <span className="text-center">Ngày tạo & Hạn chót</span>
              <span className="text-right">{t('timeline.assignee', { defaultValue: 'Người thực hiện' })}</span>
            </div>

            {/* Task List Rows */}
            <div className="divide-y divide-surface-border/40">
              {isLoading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-9 animate-pulse rounded-lg bg-surface-alt" />
                  ))}
                </div>
              ) : tasks.length === 0 ? (
                <div className="p-8 text-xs text-text-muted text-center space-y-1">
                  <Clock className="h-6 w-6 mx-auto text-text-muted opacity-60" />
                  <p>{t('timeline.noTasks', { defaultValue: 'Chưa có công việc nào trên tiến độ.' })}</p>
                </div>
              ) : (
                tasks.map((task) => {
                  const assigneeName = task.assignee?.fullName || task.assignee?.email || 'Chưa gán';
                  const initials = assigneeName.substring(0, 1).toUpperCase();

                  return (
                    <div
                      key={task.id}
                      onClick={() => onSelectTask?.(task)}
                      className="grid grid-cols-4 gap-2 items-center px-4 py-3 text-xs hover:bg-primary/5 transition cursor-pointer group"
                    >
                      <span className="font-bold text-text-primary group-hover:text-primary transition truncate" title={task.title}>
                        {task.title}
                      </span>

                      <div className="flex justify-center">
                        {getStatusBadge(task.status)}
                      </div>

                      <div className="text-center text-[10px] font-semibold text-text-secondary leading-tight">
                        <div>{formatDate(task.createdAt)}</div>
                        <div className="text-primary font-bold">{formatDate(task.dueDate)}</div>
                      </div>

                      <div className="flex items-center justify-end space-x-1.5 min-w-0">
                        <span className="text-[11px] font-semibold text-text-secondary truncate max-w-[65px]">
                          {assigneeName}
                        </span>
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[9px] font-extrabold text-white shadow-xs">
                          {initials}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Add Task Quick Button */}
            {canCreateTask && (
              <div className="p-3 border-t border-surface-border bg-surface-alt/20">
                <button
                  onClick={onOpenCreateTask}
                  className="flex items-center space-x-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/10 transition"
                >
                  <Plus className="h-4 w-4" />
                  <span>{t('timeline.create', { defaultValue: 'Tạo công việc mới' })}</span>
                </button>
              </div>
            )}
          </div>

          {/* Right Gantt Visual Timeline View with Detailed Date Columns */}
          <div className="flex-1 relative min-w-[600px] bg-surface">
            {/* Dynamic Detailed Date Column Headers */}
            <div className="grid grid-cols-4 bg-surface-alt/70 text-center text-xs font-bold text-text-muted border-b border-surface-border py-3">
              <span>{dateHeader1}</span>
              <span>{dateHeader2}</span>
              <span>{dateHeader3}</span>
              <span>{dateHeader4}</span>
            </div>

            {/* Current Today Line Indicator */}
            <div className="absolute top-0 bottom-0 left-[28%] w-0.5 bg-primary z-10 opacity-70">
              <div className="absolute top-2 -left-1.5 h-3 w-3 rounded-full bg-primary border-2 border-surface" />
            </div>

            {/* Real Task Progress Bars */}
            <div className="pt-4 px-4 space-y-5">
              {tasks.map((task, idx) => {
                const pct = getProgressPercentage(task.status);
                const offset = (idx % 4) * 22 + 4;
                const barColor = getTaskProgressBarClass(task.status);
                const formattedDueDate = formatDate(task.dueDate);

                return (
                  <div key={task.id} className="relative h-8 flex items-center">
                    <div
                      onClick={() => onSelectTask?.(task)}
                      className={`absolute h-7 rounded-xl text-white px-3 text-[11px] font-bold flex items-center justify-between shadow-xs transition hover:brightness-110 active:scale-95 cursor-pointer ${barColor}`}
                      style={{
                        left: `${offset}%`,
                        width: `${Math.max(pct, 32)}%`,
                      }}
                      title={`${task.title} (Bấm để xem chi tiết) - Hạn chót: ${formattedDueDate}`}
                    >
                      <span className="truncate mr-2 font-heading">{task.title}</span>
                      <span className="text-[10px] font-mono opacity-95 shrink-0 bg-black/20 px-1.5 py-0.5 rounded">
                        {formattedDueDate}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
