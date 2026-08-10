'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Search, 
  Plus, 
  AlertTriangle, 
  CheckSquare, 
  MoreHorizontal,
  CheckCircle2,
  Clock,
  PlayCircle,
  AlertCircle,
  Calendar
} from 'lucide-react';
import type { TaskDto, TaskStatus } from '@/features/task/types';
import { useUpdateTaskStatus } from '@/features/task/hooks/use-task';
import { useAuthStore } from '@/store/auth-store';
import { TaskDetailModal } from '@/features/task/components/task-detail-modal';

interface WorkspaceBoardTabProps {
  tasks: TaskDto[];
  isLoading: boolean;
  onOpenCreateTask: () => void;
  onSelectTask?: (task: TaskDto) => void;
}

export function WorkspaceBoardTab({
  tasks,
  isLoading,
  onOpenCreateTask,
  onSelectTask,
}: WorkspaceBoardTabProps) {
  const { t } = useTranslation('workspace');
  const { t: tTask } = useTranslation('task');
  const user = useAuthStore((state) => state.user);
  const updateStatusMutation = useUpdateTaskStatus();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTask, setSelectedTask] = useState<TaskDto | null>(null);

  const canCreateTask = !!user;

  const columns: { 
    id: TaskStatus; 
    title: string; 
    badgeBg: string; 
    badgeText: string; 
    badgeBorder: string; 
    dotBg: string; 
    topBorder: string;
    icon: React.ElementType;
  }[] = [
    { 
      id: 'TODO', 
      title: tTask('statuses.TODO', { defaultValue: 'Cần làm' }), 
      badgeBg: 'bg-slate-500/10 dark:bg-slate-500/20',
      badgeText: 'text-slate-600 dark:text-slate-300',
      badgeBorder: 'border-slate-500/30',
      dotBg: 'bg-slate-400',
      topBorder: 'border-t-slate-400',
      icon: Clock
    },
    { 
      id: 'IN_PROGRESS', 
      title: tTask('statuses.IN_PROGRESS', { defaultValue: 'Đang làm' }), 
      badgeBg: 'bg-blue-500/10 dark:bg-blue-500/20',
      badgeText: 'text-blue-600 dark:text-blue-400',
      badgeBorder: 'border-blue-500/30',
      dotBg: 'bg-blue-500 animate-pulse',
      topBorder: 'border-t-blue-500',
      icon: PlayCircle
    },
    { 
      id: 'IN_REVIEW', 
      title: tTask('statuses.IN_REVIEW', { defaultValue: 'Đang xem xét' }), 
      badgeBg: 'bg-amber-500/10 dark:bg-amber-500/20',
      badgeText: 'text-amber-600 dark:text-amber-400',
      badgeBorder: 'border-amber-500/30',
      dotBg: 'bg-amber-500',
      topBorder: 'border-t-amber-500',
      icon: AlertCircle
    },
    { 
      id: 'DONE', 
      title: tTask('statuses.DONE', { defaultValue: 'Hoàn thành' }), 
      badgeBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
      badgeText: 'text-emerald-600 dark:text-emerald-400',
      badgeBorder: 'border-emerald-500/30',
      dotBg: 'bg-emerald-500',
      topBorder: 'border-t-emerald-500',
      icon: CheckCircle2
    },
  ];

  const formatDueDate = (dateStr?: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getPriorityBadge = (priority?: string) => {
    const p = priority?.toUpperCase() || 'MEDIUM';
    switch (p) {
      case 'URGENT':
        return <span className="rounded-md border border-red-500/30 bg-red-500/10 px-1.5 py-0.5 text-[9px] font-bold text-red-500">Khẩn cấp 🚨</span>;
      case 'HIGH':
        return <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-bold text-amber-500">Cao 🔥</span>;
      case 'LOW':
        return <span className="rounded-md border border-slate-500/30 bg-slate-500/10 px-1.5 py-0.5 text-[9px] font-bold text-slate-500">Thấp</span>;
      default:
        return <span className="rounded-md border border-blue-500/30 bg-blue-500/10 px-1.5 py-0.5 text-[9px] font-bold text-blue-500">Trung bình</span>;
    }
  };

  const filteredTasks = tasks.filter((t) =>
    t.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-5 text-text-primary pb-12">
      {/* Search & Action Bar */}
      <div className="flex items-center justify-between border-b border-surface-border pb-3">
        <div className="relative w-80">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-text-muted" />
          <input
            type="text"
            placeholder={t('board.searchBoard', { defaultValue: 'Tìm kiếm công việc trên bảng...' })}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-surface-border bg-surface pl-9 pr-3 py-1.5 text-xs text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none transition shadow-xs"
          />
        </div>

        {canCreateTask && (
          <button
            type="button"
            onClick={onOpenCreateTask}
            className="flex items-center space-x-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-primary-hover transition active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Thêm công việc</span>
          </button>
        )}
      </div>

      {/* Kanban Board 4 Columns Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {columns.map((col) => {
          const ColumnIcon = col.icon;
          const colTasks = filteredTasks.filter((t) => {
            const st = t.status || 'TODO';
            if (col.id === 'DONE') return st === 'DONE' || st === 'COMPLETED';
            return st === col.id;
          });

          return (
            <div
              key={col.id}
              className={`flex flex-col justify-between rounded-2xl border border-surface-border bg-surface-alt/40 p-3.5 min-h-[460px] shadow-xs border-t-4 ${col.topBorder}`}
            >
              <div>
                {/* Column Header */}
                <div className="mb-3.5 flex items-center justify-between px-1">
                  <div className="flex items-center space-x-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${col.dotBg}`} />
                    <ColumnIcon className={`h-4 w-4 ${col.badgeText}`} />
                    <span className="text-xs font-bold text-text-primary font-heading">{col.title}</span>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${col.badgeBg} ${col.badgeText} ${col.badgeBorder}`}>
                      {colTasks.length}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={onOpenCreateTask}
                    className="p-1 rounded-lg text-text-muted hover:bg-surface-alt hover:text-text-primary transition"
                    title="Thêm công việc mới vào cột này"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {/* Column Cards Stream */}
                <div className="space-y-3">
                  {colTasks.map((task, idx) => {
                    const key = `TASK-${idx + 1}`;
                    const dueDateStr = formatDueDate(task.dueDate);
                    const isCompleted = col.id === 'DONE' || task.status === 'DONE' || task.status === 'COMPLETED';

                    return (
                      <div
                        key={task.id}
                        onClick={() => {
                          setSelectedTask(task);
                          onSelectTask?.(task);
                        }}
                        className={`group relative rounded-xl border p-3.5 shadow-xs transition cursor-pointer ${
                          isCompleted
                            ? 'border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/50 hover:shadow-md'
                            : 'border-surface-border bg-surface hover:border-primary/40 hover:shadow-md'
                        }`}
                      >
                        {/* Task Priority & Status Indicators */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-1.5">
                            {getPriorityBadge(task.priority)}
                            {isCompleted && (
                              <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                                Đã xong ✓
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-bold text-text-muted">#{key}</span>
                        </div>

                        {/* Task Title (Strikethrough if completed!) */}
                        <h4
                          className={`text-xs font-bold font-heading leading-snug line-clamp-2 ${
                            isCompleted
                              ? 'line-through text-text-muted decoration-emerald-500/80 decoration-2'
                              : 'text-text-primary'
                          }`}
                        >
                          {isCompleted && <CheckCircle2 className="inline-block mr-1 h-3.5 w-3.5 text-emerald-500 shrink-0" />}
                          {task.title}
                        </h4>

                        {/* Due Date Display */}
                        {dueDateStr && (
                          <div className="mt-2.5 flex items-center space-x-1 text-[10px] font-bold">
                            <span className="text-text-muted">{tTask('dueDate', { defaultValue: 'Hạn chót' })}:</span>
                            <span className={`flex items-center space-x-1 rounded-md px-1.5 py-0.5 ${
                              isCompleted
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                            }`}>
                              <Calendar className="h-3 w-3" />
                              <span>{dueDateStr}</span>
                            </span>
                          </div>
                        )}

                        {/* Card Footer: Task ID Key & Assignee Info */}
                        <div className="mt-3 flex items-center justify-between border-t border-surface-border/60 pt-2.5 text-xs">
                          {/* Task Identifier Key */}
                          <div className="flex items-center space-x-1.5 text-[11px] font-semibold text-text-muted">
                            <CheckSquare className={`h-3.5 w-3.5 ${isCompleted ? 'text-emerald-500' : 'text-primary'}`} />
                            <span>{key}</span>
                          </div>

                          {/* Assignee Information */}
                          <div className="flex items-center space-x-1.5 text-[11px]">
                            {task.assignee ? (
                              <div className="flex items-center space-x-1 rounded-lg bg-surface-alt px-2 py-0.5 border border-surface-border/80" title={task.assignee.fullName || task.assignee.email}>
                                <span className="font-semibold text-text-secondary truncate max-w-[140px]">
                                  {task.assignee.fullName || task.assignee.email}
                                </span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-text-muted italic">Chưa phân công</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {colTasks.length === 0 && (
                    <div className="flex h-32 flex-col items-center justify-center rounded-xl border border-dashed border-surface-border bg-surface/40 p-4 text-center">
                      <p className="text-[11px] text-text-muted italic">Trống</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
      />
    </div>
  );
}
