'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  AlertTriangle, 
  CheckSquare, 
  MoreHorizontal
} from 'lucide-react';
import type { TaskDto, TaskStatus } from '@/features/task/types';
import { useUpdateTaskStatus } from '@/features/task/hooks/use-task';
import { useAuthStore } from '@/store/auth-store';

interface WorkspaceBacklogTabProps {
  tasks: TaskDto[];
  isLoading: boolean;
  onOpenCreateTask: () => void;
}

export function WorkspaceBacklogTab({
  tasks,
  isLoading,
  onOpenCreateTask,
}: WorkspaceBacklogTabProps) {
  const { t } = useTranslation('workspace');
  const { t: tTask } = useTranslation('task');
  const user = useAuthStore((state) => state.user);
  const updateStatusMutation = useUpdateTaskStatus();

  const isAdmin = user?.roles?.includes('ROLE_ADMIN') || user?.email === 'admin@gmail.com';
  const isManager = user?.roles?.includes('ROLE_MANAGER') || user?.email === 'manager@gmail.com';
  const canManageSprint = isAdmin || isManager;
  const canCreateTask = !!user;

  const [searchTerm, setSearchTerm] = useState('');
  const [openSprints, setOpenSprints] = useState<Record<string, boolean>>({
    sprint0: true,
    sprint1: true,
    sprint2: false,
    sprint3: false,
  });

  const toggleSprint = (sprintKey: string) => {
    setOpenSprints((prev) => ({ ...prev, [sprintKey]: !prev[sprintKey] }));
  };

  const filteredTasks = tasks.filter((t) =>
    t.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDueDate = (dateStr?: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="space-y-5 text-text-primary pb-12">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-border pb-3">
        <div className="flex items-center space-x-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-text-muted" />
            <input
              type="text"
              placeholder={t('backlog.searchBacklog', { defaultValue: 'Tìm kiếm Backlog...' })}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-surface-border bg-surface pl-9 pr-3 py-1.5 text-xs focus:border-primary focus:outline-hidden shadow-xs"
            />
          </div>

          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-white shadow-xs">
            {user?.fullName?.substring(0, 1).toUpperCase() || 'U'}
          </div>

          <button className="flex items-center space-x-1.5 rounded-lg border border-surface-border bg-surface px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-surface-alt shadow-xs">
            <Filter className="h-3.5 w-3.5" />
            <span>{t('summary.filter', { defaultValue: 'Bộ lọc' })}</span>
          </button>
        </div>
      </div>

      {/* Sprints List Container */}
      <div className="space-y-4">
        {/* SCRUM Sprint 0 (Active Sprint) */}
        <div className="rounded-xl border border-surface-border bg-surface overflow-hidden shadow-xs">
          {/* Sprint Header */}
          <div className="flex items-center justify-between bg-surface-alt px-4 py-2.5 border-b border-surface-border">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => toggleSprint('sprint0')}
                className="text-text-secondary hover:text-text-primary"
              >
                {openSprints.sprint0 ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>

              <span className="text-xs font-bold text-text-primary font-heading uppercase tracking-wide">
                SCRUM Sprint 0
              </span>

              <span className="text-[11px] text-text-muted">16 Jun – 20 Jun ({filteredTasks.length} {t('backlog.workItems', { defaultValue: 'công việc' })})</span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                {filteredTasks.filter((t) => t.status === 'TODO').length} / {filteredTasks.length}
              </span>

              {canManageSprint && (
                <button className="rounded-lg bg-primary px-3 py-1 text-xs font-semibold text-white hover:bg-primary-hover shadow-xs transition">
                  {t('backlog.completeSprint', { defaultValue: 'Hoàn thành Sprint' })}
                </button>
              )}

              <button className="p-1 text-text-muted hover:text-text-primary">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Sprint Work Items Rows */}
          {openSprints.sprint0 && (
            <div className="divide-y divide-surface-border">
              {filteredTasks.length === 0 ? (
                <div className="p-6 text-center text-xs text-text-muted">
                  {t('backlog.noItemsInSprint', { defaultValue: 'Chưa có công việc nào trong Sprint này.' })}
                </div>
              ) : (
                filteredTasks.map((task, idx) => {
                  const key = `SCRUM-${idx + 1}`;
                  const dueDateFormatted = formatDueDate(task.dueDate);
                  const isDone = task.status === 'DONE' || task.status === 'COMPLETED';

                  return (
                    <div
                      key={task.id}
                      className="flex items-center justify-between px-4 py-2.5 text-xs hover:bg-surface-alt/50 transition group"
                    >
                      <div className="flex items-center space-x-3 truncate">
                        <input
                          type="checkbox"
                          checked={isDone}
                          onChange={() =>
                            updateStatusMutation.mutate({
                              taskId: task.id,
                              status: isDone ? 'TODO' : 'DONE',
                            })
                          }
                          className="h-4 w-4 rounded-xs border-surface-border text-primary focus:ring-primary"
                        />

                        <div className="flex items-center space-x-2">
                          <CheckSquare className="h-4 w-4 text-blue-500 shrink-0" />
                          <span className="font-semibold text-text-muted text-[11px]">{key}</span>
                        </div>

                        <span
                          className={`font-medium text-text-primary truncate ${
                            isDone ? 'line-through text-text-muted' : ''
                          }`}
                        >
                          {task.title}
                        </span>
                      </div>

                      <div className="flex items-center space-x-3 shrink-0">
                        {/* Status Select */}
                        <select
                          value={task.status || 'TODO'}
                          onChange={(e) =>
                            updateStatusMutation.mutate({
                              taskId: task.id,
                              status: e.target.value as TaskStatus,
                            })
                          }
                          className="rounded-lg border border-surface-border bg-surface px-2.5 py-1 text-[11px] font-semibold text-text-secondary focus:outline-hidden"
                        >
                          <option value="TODO">{tTask('statuses.TODO', { defaultValue: 'Cần làm' })}</option>
                          <option value="IN_PROGRESS">{tTask('statuses.IN_PROGRESS', { defaultValue: 'Đang làm' })}</option>
                          <option value="IN_REVIEW">{tTask('statuses.IN_REVIEW', { defaultValue: 'Đang xem xét' })}</option>
                          <option value="DONE">{tTask('statuses.DONE', { defaultValue: 'Hoàn thành' })}</option>
                          <option value="COMPLETED">{tTask('statuses.DONE', { defaultValue: 'Hoàn thành' })}</option>
                        </select>

                        {/* Due Date Warning */}
                        {dueDateFormatted && (
                          <div className="flex items-center space-x-1 rounded-md border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                            <AlertTriangle className="h-3 w-3 text-amber-500" />
                            <span>{dueDateFormatted}</span>
                          </div>
                        )}

                        {/* Assignee Avatar */}
                        <div
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-xs"
                          title={task.assignee?.fullName || 'Unassigned'}
                        >
                          {task.assignee?.fullName?.substring(0, 1).toUpperCase() || 'U'}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Create Task Action inside Sprint */}
              {canCreateTask && (
                <div className="p-2 bg-surface-alt/30">
                  <button
                    onClick={onOpenCreateTask}
                    className="flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10 transition"
                  >
                    <Plus className="h-4 w-4" />
                    <span>{t('backlog.create', { defaultValue: 'Tạo công việc' })}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* SCRUM Sprint 1 (Future Sprint) */}
        <div className="rounded-xl border border-surface-border bg-surface overflow-hidden shadow-xs">
          <div className="flex items-center justify-between bg-surface-alt px-4 py-2.5 border-b border-surface-border">
            <div className="flex items-center space-x-2">
              <button onClick={() => toggleSprint('sprint1')} className="text-text-secondary">
                {openSprints.sprint1 ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              <span className="text-xs font-bold text-text-primary font-heading uppercase tracking-wide">
                SCRUM Sprint 1
              </span>
              <span className="text-[11px] text-text-muted">21 Jun – 28 Jun (0 {t('backlog.workItems', { defaultValue: 'công việc' })})</span>
            </div>

            <div className="flex items-center space-x-2">
              {canManageSprint && (
                <button className="rounded-lg border border-surface-border bg-surface px-3 py-1 text-xs font-semibold text-text-secondary hover:bg-surface-alt shadow-xs transition">
                  {t('backlog.startSprint', { defaultValue: 'Bắt đầu Sprint' })}
                </button>
              )}
              <button className="p-1 text-text-muted hover:text-text-primary">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>

          {openSprints.sprint1 && (
            <div>
              <div className="m-3 flex items-center justify-center rounded-xl border-2 border-dashed border-surface-border p-6 text-center text-xs text-text-muted bg-surface-alt/20">
                {t('backlog.planSprintPlaceholder', { defaultValue: 'Lập kế hoạch Sprint bằng cách kéo thả công việc vào đây.' })}
              </div>

              {canCreateTask && (
                <div className="p-2 bg-surface-alt/30 border-t border-surface-border">
                  <button
                    onClick={onOpenCreateTask}
                    className="flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10 transition"
                  >
                    <Plus className="h-4 w-4" />
                    <span>{t('backlog.create', { defaultValue: 'Tạo công việc' })}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
