import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  CheckCircle2, 
  Clock, 
  PlusCircle, 
  Calendar, 
  Activity,
  CheckSquare,
  Bookmark
} from 'lucide-react';
import type { TaskDto } from '@/features/task/types';

interface WorkspaceSummaryTabProps {
  workspaceName: string;
  tasks: TaskDto[];
  isLoading: boolean;
  onOpenCreateTask: () => void;
}

export function WorkspaceSummaryTab({
  workspaceName,
  tasks,
  isLoading,
  onOpenCreateTask,
}: WorkspaceSummaryTabProps) {
  const { t } = useTranslation('workspace');

  // Compute Statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'DONE' || t.status === 'COMPLETED').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const todoTasks = tasks.filter((t) => t.status === 'TODO' || !t.status).length;

  const dueSoonTasks = tasks.filter((t) => {
    if (!t.dueDate) return false;
    const due = new Date(t.dueDate).getTime();
    const now = Date.now();
    const in7Days = now + 7 * 24 * 60 * 60 * 1000;
    return due >= now && due <= in7Days && t.status !== 'DONE' && t.status !== 'COMPLETED';
  }).length;

  // Percentage calculations
  const completedPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const inProgressPct = totalTasks > 0 ? Math.round((inProgressTasks / totalTasks) * 100) : 0;
  const todoPct = totalTasks > 0 ? Math.round((todoTasks / totalTasks) * 100) : 0;

  // Compute real Assignee Workload Breakdown
  const assigneeCounts: Record<string, { name: string; count: number }> = {};
  let unassignedCount = 0;

  tasks.forEach((t) => {
    if (t.assignee?.fullName || t.assigneeId) {
      const key = t.assigneeId || t.assignee?.fullName || 'other';
      const name = t.assignee?.fullName || t.assignee?.email || 'Thành viên';
      if (!assigneeCounts[key]) {
        assigneeCounts[key] = { name, count: 0 };
      }
      assigneeCounts[key].count += 1;
    } else {
      unassignedCount += 1;
    }
  });

  const assigneeList = Object.values(assigneeCounts);
  if (unassignedCount > 0) {
    assigneeList.push({ name: 'Chưa phân công', count: unassignedCount });
  }

  return (
    <div className="space-y-6 pb-12 text-text-primary">
      {/* 4 Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Completed */}
        <div className="flex items-center space-x-4 rounded-xl border border-surface-border bg-surface p-4 shadow-xs transition hover:border-primary/30">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold font-heading text-text-primary">
              {completedTasks} {t('summary.completed7d', { defaultValue: 'completed' })}
            </div>
            <div className="text-[11px] text-text-muted">
              {t('summary.last7days', { defaultValue: 'in the last 7 days' })}
            </div>
          </div>
        </div>

        {/* Updated */}
        <div className="flex items-center space-x-4 rounded-xl border border-surface-border bg-surface p-4 shadow-xs transition hover:border-primary/30">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold font-heading text-text-primary">
              {inProgressTasks} {t('summary.updated7d', { defaultValue: 'updated' })}
            </div>
            <div className="text-[11px] text-text-muted">
              {t('summary.last7days', { defaultValue: 'in the last 7 days' })}
            </div>
          </div>
        </div>

        {/* Created */}
        <div className="flex items-center space-x-4 rounded-xl border border-surface-border bg-surface p-4 shadow-xs transition hover:border-primary/30">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
            <PlusCircle className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold font-heading text-text-primary">
              {totalTasks} {t('summary.created7d', { defaultValue: 'created' })}
            </div>
            <div className="text-[11px] text-text-muted">
              {t('summary.last7days', { defaultValue: 'in the last 7 days' })}
            </div>
          </div>
        </div>

        {/* Due soon */}
        <div className="flex items-center space-x-4 rounded-xl border border-surface-border bg-surface p-4 shadow-xs transition hover:border-primary/30">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold font-heading text-text-primary">
              {dueSoonTasks} {t('summary.dueSoon7d', { defaultValue: 'due soon' })}
            </div>
            <div className="text-[11px] text-text-muted">
              {t('summary.next7days', { defaultValue: 'in the next 7 days' })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Overview */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Status Overview Card */}
        <div className="rounded-xl border border-surface-border bg-surface p-5 shadow-xs">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-text-primary font-heading">
              {t('summary.statusOverview', { defaultValue: 'Status overview' })}
            </h3>
            <p className="text-xs text-text-secondary">
              {t('summary.statusOverviewSubtitle', { defaultValue: 'Get a snapshot of the status of your work items.' })}{' '}
              <button onClick={onOpenCreateTask} className="text-primary hover:underline font-medium">
                View all work items
              </button>
            </p>
          </div>

          <div className="flex flex-col items-center justify-center sm:flex-row sm:space-x-8 py-4">
            {/* Donut Visual */}
            <div className="relative flex h-36 w-36 items-center justify-center">
              <svg className="h-full w-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-surface-alt stroke-current"
                  strokeWidth="3.8"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Completed (Green) */}
                <path
                  className="text-emerald-500 stroke-current transition-all duration-500"
                  strokeDasharray={`${completedPct}, 100`}
                  strokeWidth="3.8"
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* In Progress (Blue) */}
                <path
                  className="text-blue-500 stroke-current transition-all duration-500"
                  strokeDasharray={`${inProgressPct}, 100`}
                  strokeDashoffset={`-${completedPct}`}
                  strokeWidth="3.8"
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* To Do (Lime/Yellow) */}
                <path
                  className="text-lime-500 stroke-current transition-all duration-500"
                  strokeDasharray={`${todoPct}, 100`}
                  strokeDashoffset={`-${completedPct + inProgressPct}`}
                  strokeWidth="3.8"
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-extrabold text-text-primary font-heading">{totalTasks}</span>
                <span className="text-[10px] text-text-muted">
                  {t('summary.totalWorkItems', { defaultValue: 'Total work items' })}
                </span>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-4 space-y-2 text-xs font-medium sm:mt-0">
              <div className="flex items-center space-x-2">
                <span className="h-3 w-3 rounded-xs bg-blue-500"></span>
                <span className="text-text-secondary">In Progress:</span>
                <span className="font-bold text-text-primary">{inProgressTasks}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="h-3 w-3 rounded-xs bg-lime-500"></span>
                <span className="text-text-secondary">To Do:</span>
                <span className="font-bold text-text-primary">{todoTasks}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="h-3 w-3 rounded-xs bg-emerald-500"></span>
                <span className="text-text-secondary">Done:</span>
                <span className="font-bold text-text-primary">{completedTasks}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Space Activity Feed Card */}
        <div className="flex flex-col justify-between rounded-xl border border-surface-border bg-surface p-5 shadow-xs">
          <div>
            <h3 className="text-sm font-bold text-text-primary font-heading">
              {t('summary.spaceActivity', { defaultValue: 'Space activity' })}
            </h3>
            <p className="text-xs text-text-secondary">Track real-time actions and changes across your team.</p>
          </div>

          {tasks.length === 0 ? (
            <div className="my-6 flex flex-col items-center justify-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-alt text-primary">
                <Activity className="h-6 w-6" />
              </div>
              <h4 className="mt-3 text-xs font-bold text-text-primary">
                {t('summary.noActivityYet', { defaultValue: 'No activity yet' })}
              </h4>
              <p className="mt-1 max-w-xs text-[11px] text-text-muted">
                {t('summary.noActivityDesc', { defaultValue: 'Create a few work items and invite some teammates to your space to see your space activity.' })}
              </p>
            </div>
          ) : (
            <div className="my-3 space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {tasks.slice(0, 4).map((task) => (
                <div key={task.id} className="flex items-center justify-between rounded-lg bg-surface-alt p-2.5 text-xs">
                  <div className="flex items-center space-x-2.5 truncate">
                    <CheckSquare className="h-4 w-4 shrink-0 text-primary" />
                    <span className="font-medium text-text-primary truncate">{task.title}</span>
                  </div>
                  <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-semibold text-text-secondary uppercase">
                    {task.status || 'TODO'}
                  </span>
                </div>
              ))}
            </div>
          )}
          <div />
        </div>

        {/* Priority Breakdown Card */}
        <div className="rounded-xl border border-surface-border bg-surface p-5 shadow-xs">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-text-primary font-heading">
              {t('summary.priorityBreakdown', { defaultValue: 'Priority breakdown' })}
            </h3>
            <p className="text-xs text-text-secondary">
              Get a holistic view of how work is being prioritized.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {['HIGH', 'MEDIUM', 'LOW'].map((prio) => {
              const count = tasks.filter((t) => t.priority === prio).length;
              const pct = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
              const color = prio === 'HIGH' ? 'bg-red-500' : prio === 'MEDIUM' ? 'bg-amber-500' : 'bg-blue-500';

              return (
                <div key={prio} className="space-y-1 text-xs">
                  <div className="flex justify-between font-medium">
                    <span className="capitalize text-text-secondary">{prio.toLowerCase()} priority</span>
                    <span className="font-bold text-text-primary">{count} items ({pct}%)</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-surface-alt">
                    <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Assignee Workload Breakdown Card (REAL DATA) */}
        <div className="rounded-xl border border-surface-border bg-surface p-5 shadow-xs">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-text-primary font-heading">
              {t('summary.assigneeWorkload', { defaultValue: 'Phân công công việc nhóm' })}
            </h3>
            <p className="text-xs text-text-secondary">
              {t('summary.assigneeWorkloadSubtitle', { defaultValue: 'Thống kê phân bổ công việc theo người thực hiện' })}
            </p>
          </div>

          <div className="space-y-3 pt-1 max-h-48 overflow-y-auto pr-1">
            {assigneeList.length === 0 ? (
              <p className="text-xs text-text-muted italic py-6 text-center">Chưa có dữ liệu phân công công việc</p>
            ) : (
              assigneeList.map((item, idx) => {
                const pct = totalTasks > 0 ? Math.round((item.count / totalTasks) * 100) : 0;
                const colors = ['bg-indigo-500', 'bg-purple-500', 'bg-emerald-500', 'bg-amber-500', 'bg-sky-500', 'bg-gray-500'];
                const barColor = colors[idx % colors.length];

                return (
                  <div key={item.name} className="space-y-1 text-xs">
                    <div className="flex justify-between font-medium">
                      <span className="text-text-primary font-semibold flex items-center space-x-1">
                        <span>👤</span>
                        <span>{item.name}</span>
                      </span>
                      <span className="font-bold text-text-primary">{item.count} ({pct}%)</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-surface-alt">
                      <div className={`h-full ${barColor} transition-all duration-500`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
