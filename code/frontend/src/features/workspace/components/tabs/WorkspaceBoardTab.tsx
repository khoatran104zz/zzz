'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Search, 
  Plus, 
  AlertTriangle, 
  CheckSquare, 
  MoreHorizontal
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

  const columns: { id: TaskStatus; title: string; color: string }[] = [
    { id: 'TODO', title: tTask('statuses.TODO', { defaultValue: 'Cần làm' }), color: 'bg-slate-400' },
    { id: 'IN_PROGRESS', title: tTask('statuses.IN_PROGRESS', { defaultValue: 'Đang làm' }), color: 'bg-blue-500' },
    { id: 'IN_REVIEW', title: tTask('statuses.IN_REVIEW', { defaultValue: 'Đang xem xét' }), color: 'bg-amber-500' },
    { id: 'DONE', title: tTask('statuses.DONE', { defaultValue: 'Hoàn thành' }), color: 'bg-emerald-500' },
  ];

  const formatDueDate = (dateStr?: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const filteredTasks = tasks.filter((t) =>
    t.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-5 text-text-primary pb-12">
      {/* Search Bar Only */}
      <div className="flex items-center justify-between border-b border-surface-border pb-3">
        <div className="relative w-72">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-text-muted" />
          <input
            type="text"
            placeholder={t('board.searchBoard', { defaultValue: 'Tìm kiếm trên bảng...' })}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-surface-border bg-surface pl-9 pr-3 py-1.5 text-xs focus:border-primary focus:outline-hidden shadow-xs"
          />
        </div>
      </div>

      {/* Kanban Board 4 Columns Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {columns.map((col) => {
          const colTasks = filteredTasks.filter((t) => {
            const st = t.status || 'TODO';
            if (col.id === 'DONE') return st === 'DONE' || st === 'COMPLETED';
            return st === col.id;
          });

          return (
            <div
              key={col.id}
              className="flex flex-col justify-between rounded-xl border border-surface-border bg-surface-alt/40 p-3 min-h-[420px] shadow-xs"
            >
              <div>
                {/* Column Header */}
                <div className="mb-3 flex items-center justify-between px-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-text-primary font-heading">{col.title}</span>
                    <span className="rounded-full bg-surface-alt px-2 py-0.5 text-[10px] font-bold text-text-muted">
                      {colTasks.length}
                    </span>
                  </div>
                  <button className="p-1 text-text-muted hover:text-text-primary">
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Column Cards */}
                <div className="space-y-3">
                  {colTasks.map((task, idx) => {
                    const key = `TASK-${idx + 1}`;
                    const dueDateStr = formatDueDate(task.dueDate);

                    return (
                      <div
                        key={task.id}
                        onClick={() => {
                          setSelectedTask(task);
                          onSelectTask?.(task);
                        }}
                        className="group relative rounded-xl border border-surface-border bg-surface p-3.5 shadow-xs transition hover:border-primary/40 hover:shadow-md cursor-pointer"
                      >
                        <h4 className="text-xs font-bold text-text-primary font-heading line-clamp-2">
                          {task.title}
                        </h4>

                        {dueDateStr && (
                          <div className="mt-2.5 flex items-center space-x-1 text-[10px] font-bold text-red-600 dark:text-red-400">
                            <span>{tTask('dueDate', { defaultValue: 'Hạn chót' })}</span>
                            <span className="flex items-center space-x-0.5 rounded-sm bg-red-50 px-1.5 py-0.5 dark:bg-red-950/40">
                              <span>{dueDateStr}</span>
                              <AlertTriangle className="h-3 w-3 text-red-500" />
                            </span>
                          </div>
                        )}

                        <div className="mt-3 flex items-center justify-between border-t border-surface-border/60 pt-2.5">
                          <div className="flex items-center space-x-1.5 text-[11px] font-semibold text-text-muted">
                            <CheckSquare className="h-3.5 w-3.5 text-blue-500" />
                            <span>{key}</span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <div
                              className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white shadow-xs"
                              title={task.assignee?.fullName || task.assignee?.email || 'Unassigned'}
                            >
                              {task.assignee?.fullName?.substring(0, 1).toUpperCase() || 'U'}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
