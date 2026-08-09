'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Search, 
  Filter, 
  Plus, 
  Calendar as CalendarIcon, 
  User, 
  ChevronRight,
  Info
} from 'lucide-react';
import type { TaskDto } from '@/features/task/types';
import { useAuthStore } from '@/store/auth-store';

interface WorkspaceTimelineTabProps {
  tasks: TaskDto[];
  isLoading: boolean;
  onOpenCreateTask: () => void;
}

export function WorkspaceTimelineTab({
  tasks,
  isLoading,
  onOpenCreateTask,
}: WorkspaceTimelineTabProps) {
  const { t } = useTranslation('workspace');
  const { t: tTask } = useTranslation('task');
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.roles?.includes('ROLE_ADMIN') || user?.email === 'admin@gmail.com';
  const isManager = user?.roles?.includes('ROLE_MANAGER') || user?.email === 'manager@gmail.com';
  const canManageTasks = isAdmin || isManager;

  const [searchTerm, setSearchTerm] = useState('');
  const [period, setPeriod] = useState<'Today' | 'Weeks' | 'Months' | 'Quarters'>('Months');

  const filteredTasks = tasks.filter((t) =>
    t.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPeriodLabel = (p: 'Today' | 'Weeks' | 'Months' | 'Quarters') => {
    switch (p) {
      case 'Today': return t('timeline.today', { defaultValue: 'Hôm nay' });
      case 'Weeks': return t('timeline.weeks', { defaultValue: 'Tuần' });
      case 'Months': return t('timeline.months', { defaultValue: 'Tháng' });
      case 'Quarters': return t('timeline.quarters', { defaultValue: 'Quý' });
    }
  };

  return (
    <div className="space-y-4 text-text-primary pb-12">
      {/* Top Search & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-border pb-3">
        <div className="flex items-center space-x-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-text-muted" />
            <input
              type="text"
              placeholder={t('timeline.searchTimeline', { defaultValue: 'Tìm kiếm trên tiến độ...' })}
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

      {/* Timeline Gantt Grid Component */}
      <div className="relative rounded-xl border border-surface-border bg-surface overflow-hidden shadow-xs flex flex-col min-h-[460px]">
        <div className="flex flex-1 overflow-x-auto">
          {/* Left Table Panel */}
          <div className="w-80 shrink-0 border-r border-surface-border bg-surface">
            {/* Table Header */}
            <div className="grid grid-cols-3 gap-2 bg-surface-alt/70 px-4 py-3 text-[11px] font-bold text-text-muted border-b border-surface-border uppercase">
              <span className="col-span-1">{t('timeline.work', { defaultValue: 'Công việc' })}</span>
              <span className="text-center">{t('timeline.status', { defaultValue: 'Trạng thái' })}</span>
              <span className="text-right">{t('timeline.assignee', { defaultValue: 'Người thực hiện' })}</span>
            </div>

            {/* Sprints Group */}
            <div className="p-3 text-xs font-bold text-text-primary font-heading border-b border-surface-border/50 bg-surface-alt/20">
              {t('timeline.sprints', { defaultValue: 'Chuỗi Sprints' })}
            </div>

            {/* Task Rows */}
            <div className="divide-y divide-surface-border/40">
              {filteredTasks.length === 0 ? (
                <div className="p-4 text-xs text-text-muted text-center">{t('timeline.noTasks', { defaultValue: 'Không tìm thấy công việc nào trên tiến độ.' })}</div>
              ) : (
                filteredTasks.map((task) => (
                  <div key={task.id} className="grid grid-cols-3 gap-2 items-center px-4 py-2.5 text-xs hover:bg-surface-alt/40 transition">
                    <span className="font-semibold text-text-primary truncate">{task.title}</span>
                    <span className="text-center font-medium text-[10px] uppercase rounded-full bg-surface-alt py-0.5 text-text-secondary">
                      {tTask(`statuses.${task.status || 'TODO'}`, { defaultValue: task.status || 'TODO' })}
                    </span>
                    <div className="flex justify-end">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white">
                        {task.assignee?.fullName?.substring(0, 1).toUpperCase() || 'U'}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add Task Button - Admin & Manager only */}
            {canManageTasks && (
              <div className="p-2 border-t border-surface-border">
                <button
                  onClick={onOpenCreateTask}
                  className="flex items-center space-x-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10 transition"
                >
                  <Plus className="h-4 w-4" />
                  <span>{t('timeline.create', { defaultValue: 'Tạo công việc' })}</span>
                </button>
              </div>
            )}
          </div>

          {/* Right Gantt Calendar View */}
          <div className="flex-1 relative min-w-[500px] bg-surface">
            {/* Calendar Headers */}
            <div className="grid grid-cols-3 bg-surface-alt/70 text-center text-xs font-bold text-text-muted border-b border-surface-border py-3">
              <span>August</span>
              <span>September</span>
              <span>October</span>
            </div>

            {/* Today Vertical Line Indicator */}
            <div className="absolute top-0 bottom-0 left-1/3 w-0.5 bg-blue-500 z-10 shadow-xs">
              <div className="absolute top-2 -left-1.5 h-3 w-3 rounded-full bg-blue-500 border-2 border-white" />
            </div>

            {/* Timeline Task Bars Visual */}
            <div className="pt-10 px-4 space-y-7">
              {filteredTasks.map((t, idx) => (
                <div key={t.id} className="relative h-6 flex items-center">
                  <div
                    className="absolute h-5 rounded-lg bg-primary/80 text-white px-2 text-[10px] font-bold flex items-center shadow-xs truncate"
                    style={{
                      left: `${(idx % 3) * 25 + 10}%`,
                      width: '35%',
                    }}
                  >
                    {t.title}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Time Period Switcher Toolbar */}
        <div className="absolute bottom-3 right-3 flex items-center space-x-1 rounded-xl border border-surface-border bg-surface p-1 shadow-lg backdrop-blur-md">
          {(['Today', 'Weeks', 'Months', 'Quarters'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                period === p
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-text-secondary hover:bg-surface-alt hover:text-text-primary'
              }`}
            >
              {getPeriodLabel(p)}
            </button>
          ))}
          <div className="h-4 w-px bg-surface-border mx-1" />
          <button className="p-1 text-text-muted hover:text-text-primary">
            <Info className="h-3.5 w-3.5" />
          </button>
          <button className="p-1 text-text-muted hover:text-text-primary">
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
