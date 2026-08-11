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
  MoreHorizontal,
  Layers,
  Calendar,
  ArrowRightLeft,
  CheckCircle2,
  Clock,
  PlayCircle,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import type { TaskDto, TaskStatus } from '@/features/task/types';
import { useUpdateTaskStatus } from '@/features/task/hooks/use-task';
import { useAuthStore } from '@/store/auth-store';
import { ConfirmStatusChangeModal } from '@/features/task/components/confirm-status-change-modal';

interface WorkspaceBacklogTabProps {
  tasks: TaskDto[];
  isLoading: boolean;
  onOpenCreateTask: () => void;
  onSelectTask?: (task: TaskDto) => void;
}

interface SprintItem {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'PLANNED' | 'COMPLETED';
}

export function WorkspaceBacklogTab({
  tasks,
  isLoading,
  onOpenCreateTask,
  onSelectTask,
}: WorkspaceBacklogTabProps) {
  const { t } = useTranslation('workspace');
  const { t: tTask } = useTranslation('task');
  const { t: tCommon } = useTranslation('common');
  const user = useAuthStore((state) => state.user);
  const updateStatusMutation = useUpdateTaskStatus();

  const isAdmin = user?.roles?.includes('ROLE_ADMIN') || user?.email === 'admin@gmail.com';
  const isManager = user?.roles?.includes('ROLE_MANAGER') || user?.email === 'manager@gmail.com';
  const canManageSprint = isAdmin || isManager;
  const canCreateTask = !!user;

  const [searchTerm, setSearchTerm] = useState('');
  
  // Real Sprints State (Scrum Sprint Management)
  const [sprints, setSprints] = useState<SprintItem[]>([
    { id: 'sprint-1', name: 'SCRUM Sprint 1', startDate: '10 Aug', endDate: '24 Aug', status: 'ACTIVE' },
    { id: 'sprint-2', name: 'SCRUM Sprint 2', startDate: '25 Aug', endDate: '08 Sep', status: 'PLANNED' },
  ]);

  // Section Collapse State
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'sprint-1': true,
    'sprint-2': true,
    backlogPool: true,
  });

  // Task to Sprint Assignment mapping state
  const [taskSprintMapping, setTaskSprintMapping] = useState<Record<string, string>>({});

  // Status Change Confirmation Modal State
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    task: TaskDto;
    newStatus: TaskStatus;
  } | null>(null);

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Create New Sprint Handler
  const handleCreateNewSprint = () => {
    const newSprintNumber = sprints.length + 1;
    const newSprint: SprintItem = {
      id: `sprint-${newSprintNumber}`,
      name: `SCRUM Sprint ${newSprintNumber}`,
      startDate: '10 Sep',
      endDate: '24 Sep',
      status: 'PLANNED',
    };
    setSprints((prev) => [...prev, newSprint]);
    setOpenSections((prev) => ({ ...prev, [newSprint.id]: true }));
  };

  // Filter tasks based on real search term
  const filteredTasks = tasks.filter((t) =>
    t.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Scrum Rule 1: Active Sprint Tasks (IN_PROGRESS, IN_REVIEW, or assigned to Sprint 1)
  const activeSprintTasks = filteredTasks.filter((t) => {
    const assignedSprint = taskSprintMapping[t.id];
    if (assignedSprint === 'sprint-1') return true;
    if (!assignedSprint && (t.status === 'IN_PROGRESS' || t.status === 'IN_REVIEW')) return true;
    return false;
  });

  // Scrum Rule 2: Sprint 2 Planned Tasks
  const sprint2Tasks = filteredTasks.filter((t) => taskSprintMapping[t.id] === 'sprint-2');

  // Scrum Rule 3: Backlog Pool Tasks
  // CRITICAL SCRUM RULE: Completed tasks (DONE/COMPLETED) CANNOT be in the Backlog Pool!
  // Backlog pool contains ONLY UNCOMPLETED tasks (TODO) that belong to NO Sprint!
  const backlogPoolTasks = filteredTasks.filter((t) => {
    const isCompleted = t.status === 'DONE' || t.status === 'COMPLETED';
    const isAssignedToSprint = !!taskSprintMapping[t.id] || t.status === 'IN_PROGRESS' || t.status === 'IN_REVIEW';
    return !isCompleted && !isAssignedToSprint;
  });

  const formatDueDate = (dateStr?: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: 'short' });
  };

  const getPriorityBadge = (priority?: string) => {
    const p = priority?.toUpperCase() || 'MEDIUM';
    switch (p) {
      case 'URGENT':
        return <span className="rounded-md border border-red-500/30 bg-red-500/10 px-1.5 py-0.5 text-[9px] font-bold text-red-500">Khẩn cấp</span>;
      case 'HIGH':
        return <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-bold text-amber-500">Cao</span>;
      case 'LOW':
        return <span className="rounded-md border border-slate-500/30 bg-slate-500/10 px-1.5 py-0.5 text-[9px] font-bold text-slate-500">Thấp</span>;
      default:
        return <span className="rounded-md border border-blue-500/30 bg-blue-500/10 px-1.5 py-0.5 text-[9px] font-bold text-blue-500">Trung bình</span>;
    }
  };

  // Status Change Request Handler (Opens Confirmation Modal!)
  const handleRequestStatusChange = (task: TaskDto, newStatus: TaskStatus) => {
    if (task.status === newStatus) return;
    setPendingStatusChange({ task, newStatus });
  };

  // Confirm Status Mutation Execution
  const handleConfirmStatusChange = () => {
    if (!pendingStatusChange) return;
    updateStatusMutation.mutate(
      {
        taskId: pendingStatusChange.task.id,
        status: pendingStatusChange.newStatus,
      },
      {
        onSuccess: () => {
          setPendingStatusChange(null);
        },
      }
    );
  };

  // Move Task between Backlog and Sprint
  const handleAssignTaskToSprint = (taskId: string, sprintId: string) => {
    setTaskSprintMapping((prev) => ({
      ...prev,
      [taskId]: sprintId,
    }));
  };

  return (
    <div className="space-y-6 text-text-primary pb-12">
      {/* Header & Scrum Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-border pb-4">
        <div className="flex items-center space-x-3">
          <div className="relative w-72">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-text-muted" />
            <input
              type="text"
              placeholder={t('backlog.searchBacklog', { defaultValue: 'Tìm kiếm trong Backlog & Sprints...' })}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-surface-border bg-surface pl-9 pr-3 py-1.5 text-xs text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none transition shadow-xs"
            />
          </div>

          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary border border-primary/20">
            Tổng: {filteredTasks.length} {t('backlog.workItems', { defaultValue: 'công việc' })}
          </span>
        </div>

        {/* Scrum Sprint Actions */}
        <div className="flex items-center space-x-2">
          {canManageSprint && (
            <button
              type="button"
              onClick={handleCreateNewSprint}
              className="flex items-center space-x-1.5 rounded-xl border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs font-bold text-primary hover:bg-primary hover:text-white transition active:scale-95 shadow-xs"
            >
              <Plus className="h-4 w-4" />
              <span>Tạo Sprint mới</span>
            </button>
          )}

          {canCreateTask && (
            <button
              type="button"
              onClick={onOpenCreateTask}
              className="flex items-center space-x-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-primary-hover transition active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span>{t('backlog.create', { defaultValue: 'Tạo công việc' })}</span>
            </button>
          )}
        </div>
      </div>

      {/* Sprints & Backlog Containers */}
      <div className="space-y-5">
        {/* SPRINT 1 (Active Sprint) */}
        <div className="rounded-2xl border border-surface-border bg-surface overflow-hidden shadow-xs">
          <div className="flex items-center justify-between bg-surface-alt/70 px-4 py-3 border-b border-surface-border">
            <div className="flex items-center space-x-2.5">
              <button
                type="button"
                onClick={() => toggleSection('sprint-1')}
                className="text-text-secondary hover:text-text-primary"
              >
                {openSections['sprint-1'] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>

              <div className="flex items-center space-x-2">
                <PlayCircle className="h-4 w-4 text-blue-500 animate-pulse" />
                <span className="text-xs font-bold text-text-primary font-heading uppercase tracking-wide">
                  {sprints[0]?.name || 'SCRUM Sprint 1 (Active)'}
                </span>
              </div>

              <span className="text-[11px] text-text-muted">
                10 Aug – 24 Aug ({activeSprintTasks.length} {t('backlog.workItems', { defaultValue: 'công việc' })})
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-bold text-blue-500 border border-blue-500/20">
                {activeSprintTasks.filter((t) => t.status === 'DONE' || t.status === 'COMPLETED').length} / {activeSprintTasks.length} hoàn thành
              </span>

              {canManageSprint && (
                <button
                  type="button"
                  className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-500 hover:bg-blue-500 hover:text-white transition active:scale-95"
                >
                  {t('backlog.completeSprint', { defaultValue: 'Hoàn thành Sprint' })}
                </button>
              )}
            </div>
          </div>

          {openSections['sprint-1'] && (
            <div className="divide-y divide-surface-border/60">
              {activeSprintTasks.length === 0 ? (
                <div className="p-6 text-center text-xs text-text-muted">
                  Sprint này chưa có công việc. Kéo hoặc chọn công việc từ danh sách Backlog bên dưới để đưa vào Sprint.
                </div>
              ) : (
                activeSprintTasks.map((task) => {
                  const key = task.id.substring(0, 6).toUpperCase();
                  const dueDateFormatted = formatDueDate(task.dueDate);
                  const isDone = task.status === 'DONE' || task.status === 'COMPLETED';

                  return (
                    <div
                      key={task.id}
                      onClick={() => onSelectTask?.(task)}
                      className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-xs hover:bg-surface-alt/50 transition cursor-pointer group"
                    >
                      <div className="flex items-center space-x-3 truncate">
                        <input
                          type="checkbox"
                          checked={isDone}
                          onClick={(e) => e.stopPropagation()}
                          onChange={() =>
                            handleRequestStatusChange(task, isDone ? 'TODO' : 'DONE')
                          }
                          className="h-4 w-4 rounded-xs border-surface-border text-primary focus:ring-primary cursor-pointer"
                        />

                        <div className="flex items-center space-x-2">
                          {getPriorityBadge(task.priority)}
                          <span className="font-mono text-[10px] font-bold text-text-muted">#{key}</span>
                        </div>

                        <span
                          className={`font-semibold text-text-primary truncate group-hover:text-primary transition ${
                            isDone ? 'line-through text-text-muted decoration-emerald-500 decoration-2' : ''
                          }`}
                        >
                          {isDone && <CheckCircle2 className="inline-block mr-1 h-3.5 w-3.5 text-emerald-500 shrink-0" />}
                          {task.title}
                        </span>
                      </div>

                      <div className="flex items-center space-x-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                        {dueDateFormatted && (
                          <div className="flex items-center space-x-1 rounded-md border border-surface-border bg-surface-alt px-2 py-0.5 text-[10px] font-bold text-text-muted">
                            <Calendar className="h-3 w-3" />
                            <span>{dueDateFormatted}</span>
                          </div>
                        )}

                        <select
                          value={task.status || 'IN_PROGRESS'}
                          onChange={(e) =>
                            handleRequestStatusChange(task, e.target.value as TaskStatus)
                          }
                          className="rounded-xl border border-surface-border bg-surface px-2.5 py-1 text-[11px] font-bold text-text-primary focus:border-primary focus:outline-none"
                        >
                          <option value="TODO">{tTask('statuses.TODO', { defaultValue: 'Cần làm' })}</option>
                          <option value="IN_PROGRESS">{tTask('statuses.IN_PROGRESS', { defaultValue: 'Đang làm' })}</option>
                          <option value="IN_REVIEW">{tTask('statuses.IN_REVIEW', { defaultValue: 'Đang xem xét' })}</option>
                          <option value="DONE">{tTask('statuses.DONE', { defaultValue: 'Hoàn thành' })}</option>
                        </select>

                        {task.assignee ? (
                          <div
                            className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-xs"
                            title={task.assignee.fullName || task.assignee.email}
                          >
                            {(task.assignee.fullName || task.assignee.email).substring(0, 1).toUpperCase()}
                          </div>
                        ) : (
                          <span className="text-[10px] text-text-muted italic">Chưa phân công</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* DYNAMIC FUTURE SPRINTS (Sprint 2, Sprint 3...) */}
        {sprints.slice(1).map((sprint) => {
          const sprintTasks = filteredTasks.filter((t) => taskSprintMapping[t.id] === sprint.id);
          const isOpen = openSections[sprint.id] ?? true;

          return (
            <div key={sprint.id} className="rounded-2xl border border-surface-border bg-surface overflow-hidden shadow-xs">
              <div className="flex items-center justify-between bg-surface-alt/70 px-4 py-3 border-b border-surface-border">
                <div className="flex items-center space-x-2.5">
                  <button
                    type="button"
                    onClick={() => toggleSection(sprint.id)}
                    className="text-text-secondary hover:text-text-primary"
                  >
                    {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>

                  <span className="text-xs font-bold text-text-primary font-heading uppercase tracking-wide">
                    {sprint.name}
                  </span>

                  <span className="text-[11px] text-text-muted">
                    {sprint.startDate} – {sprint.endDate} ({sprintTasks.length} công việc)
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {canManageSprint && (
                    <button
                      type="button"
                      className="rounded-xl border border-surface-border bg-surface px-3 py-1 text-xs font-bold text-text-secondary hover:bg-surface-alt transition active:scale-95"
                    >
                      Bắt đầu Sprint
                    </button>
                  )}
                </div>
              </div>

              {isOpen && (
                <div className="p-4 bg-surface-alt/20">
                  {sprintTasks.length === 0 ? (
                    <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-surface-border p-5 text-center text-xs text-text-muted">
                      Lập kế hoạch cho Sprint này bằng cách chọn từ danh sách Backlog bên dưới.
                    </div>
                  ) : (
                    <div className="divide-y divide-surface-border/60">
                      {sprintTasks.map((task) => (
                        <div key={task.id} className="flex items-center justify-between p-2.5 text-xs">
                          <span className="font-semibold text-text-primary">{task.title}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* BACKLOG POOL (Danh Sách Công Việc Tồn Đọng) */}
        {/* SCRUM RULE: ONLY UNCOMPLETED tasks (TODO) that belong to NO Sprint! */}
        <div className="rounded-2xl border border-surface-border bg-surface overflow-hidden shadow-xs">
          <div className="flex items-center justify-between bg-surface-alt/70 px-4 py-3 border-b border-surface-border">
            <div className="flex items-center space-x-2.5">
              <button
                type="button"
                onClick={() => toggleSection('backlogPool')}
                className="text-text-secondary hover:text-text-primary"
              >
                {openSections.backlogPool ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>

              <div className="flex items-center space-x-2">
                <Layers className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold text-text-primary font-heading uppercase tracking-wide">
                  Danh Sách Công Việc Tồn Đọng Backlog
                </span>
              </div>

              <span className="rounded-full border border-surface-border bg-surface px-2.5 py-0.5 text-[10px] font-bold text-text-muted">
                {backlogPoolTasks.length} {t('backlog.workItems', { defaultValue: 'công việc tồn đọng' })}
              </span>
            </div>

            {canCreateTask && (
              <button
                type="button"
                onClick={onOpenCreateTask}
                className="flex items-center space-x-1.5 rounded-xl bg-primary/10 px-3 py-1 text-xs font-bold text-primary hover:bg-primary hover:text-white transition"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Thêm vào Backlog</span>
              </button>
            )}
          </div>

          {openSections.backlogPool && (
            <div className="divide-y divide-surface-border/60">
              {backlogPoolTasks.length === 0 ? (
                <div className="p-6 text-center text-xs text-text-muted">
                  Danh sách Backlog tồn đọng trống. Tất cả công việc đã được đưa vào Sprint hoặc đã hoàn thành.
                </div>
              ) : (
                backlogPoolTasks.map((task) => {
                  const key = task.id.substring(0, 6).toUpperCase();
                  const dueDateFormatted = formatDueDate(task.dueDate);

                  return (
                    <div
                      key={task.id}
                      onClick={() => onSelectTask?.(task)}
                      className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-xs hover:bg-surface-alt/50 transition cursor-pointer group"
                    >
                      <div className="flex items-center space-x-3 truncate">
                        <input
                          type="checkbox"
                          checked={false}
                          onClick={(e) => e.stopPropagation()}
                          onChange={() => handleRequestStatusChange(task, 'DONE')}
                          className="h-4 w-4 rounded-xs border-surface-border text-primary focus:ring-primary cursor-pointer"
                        />

                        <div className="flex items-center space-x-2">
                          {getPriorityBadge(task.priority)}
                          <span className="font-mono text-[10px] font-bold text-text-muted">#{key}</span>
                        </div>

                        <span className="font-semibold text-text-primary truncate group-hover:text-primary transition">
                          {task.title}
                        </span>
                      </div>

                      <div className="flex items-center space-x-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                        {/* Quick Sprint Assignment Selector */}
                        <select
                          value={taskSprintMapping[task.id] || 'backlog'}
                          onChange={(e) => handleAssignTaskToSprint(task.id, e.target.value)}
                          className="rounded-xl border border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary focus:outline-none"
                        >
                          <option value="backlog">-- Chờ trong Backlog --</option>
                          <option value="sprint-1">Đưa vào Sprint 1</option>
                          <option value="sprint-2">Đưa vào Sprint 2</option>
                        </select>

                        {/* Status Selector (Triggers Confirmation Modal!) */}
                        <select
                          value={task.status || 'TODO'}
                          onChange={(e) => handleRequestStatusChange(task, e.target.value as TaskStatus)}
                          className="rounded-xl border border-surface-border bg-surface px-2.5 py-1 text-[11px] font-bold text-text-primary focus:border-primary focus:outline-none"
                        >
                          <option value="TODO">{tTask('statuses.TODO', { defaultValue: 'Cần làm' })}</option>
                          <option value="IN_PROGRESS">{tTask('statuses.IN_PROGRESS', { defaultValue: 'Đang làm' })}</option>
                          <option value="IN_REVIEW">{tTask('statuses.IN_REVIEW', { defaultValue: 'Đang xem xét' })}</option>
                          <option value="DONE">{tTask('statuses.DONE', { defaultValue: 'Hoàn thành' })}</option>
                        </select>

                        {task.assignee ? (
                          <div
                            className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-xs"
                            title={task.assignee.fullName || task.assignee.email}
                          >
                            {(task.assignee.fullName || task.assignee.email).substring(0, 1).toUpperCase()}
                          </div>
                        ) : (
                          <span className="text-[10px] text-text-muted italic">Chưa phân công</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal for Task Status Change */}
      <ConfirmStatusChangeModal
        isOpen={!!pendingStatusChange}
        onClose={() => setPendingStatusChange(null)}
        onConfirm={handleConfirmStatusChange}
        taskTitle={pendingStatusChange?.task.title || ''}
        currentStatus={pendingStatusChange?.task.status || 'TODO'}
        newStatus={pendingStatusChange?.newStatus || 'DONE'}
        isLoading={updateStatusMutation.isPending}
      />
    </div>
  );
}
