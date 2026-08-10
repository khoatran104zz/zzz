'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Search, X, FolderKanban, CheckSquare, CornerDownLeft, Building2, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { useWorkspaceStore } from '@/store/workspace-store';
import { useWorkspaces } from '@/features/workspace/hooks/use-workspace';
import { useWorkspaceTasks } from '@/features/task/hooks/use-task';
import { TaskDetailModal } from '@/features/task/components/task-detail-modal';
import type { TaskDto } from '@/features/task/types';

export function SearchBar() {
  const { t } = useTranslation('search');
  const router = useRouter();
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace);
  const setActiveWorkspace = useWorkspaceStore((state) => state.setActiveWorkspace);

  // Real DB Data
  const { data: workspaces = [] } = useWorkspaces();
  const { data: tasks = [], isLoading: isTasksLoading } = useWorkspaceTasks(activeWorkspace?.id || null);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'TASK' | 'WORKSPACE'>('ALL');
  const [selectedTask, setSelectedTask] = useState<TaskDto | null>(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut Ctrl + K & Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Realtime search filtering
  const matchingTasks = tasks.filter(
    (t) =>
      t.title.toLowerCase().includes(query.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(query.toLowerCase()))
  );

  const matchingWorkspaces = workspaces.filter(
    (w) =>
      w.name.toLowerCase().includes(query.toLowerCase()) ||
      (w.description && w.description.toLowerCase().includes(query.toLowerCase()))
  );

  const displayTasks = categoryFilter === 'WORKSPACE' ? [] : matchingTasks.slice(0, 5);
  const displayWorkspaces = categoryFilter === 'TASK' ? [] : matchingWorkspaces.slice(0, 3);
  const totalResultsCount = displayTasks.length + displayWorkspaces.length;

  return (
    <div ref={containerRef} className="relative text-text-primary">
      {/* Search Input Box */}
      <div
        className={`flex h-9 w-64 md:w-80 lg:w-96 items-center justify-between rounded-xl border bg-surface-alt px-3 text-xs transition ${
          isOpen
            ? 'border-primary ring-2 ring-primary/20 bg-surface shadow-sm'
            : 'border-surface-border hover:border-primary/50 text-text-secondary'
        }`}
      >
        <div className="flex items-center space-x-2 w-full">
          <Search className="h-4 w-4 text-text-muted shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onFocus={() => setIsOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              if (!isOpen) setIsOpen(true);
            }}
            placeholder={t('placeholder', { defaultValue: 'Tìm kiếm công việc, dự án hoặc workspace... (Ctrl + K)' })}
            className="w-full bg-transparent text-xs text-text-primary placeholder:text-text-muted outline-none"
          />
        </div>
        {query ? (
          <button
            onClick={() => setQuery('')}
            className="text-text-muted hover:text-text-primary p-0.5"
            title="Xóa nội dung tìm kiếm"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <kbd className="hidden sm:inline-block rounded-md border border-surface-border bg-surface px-1.5 py-0.5 text-[10px] font-mono font-bold text-text-muted shrink-0 shadow-2xs">
            Ctrl K
          </kbd>
        )}
      </div>

      {/* Realtime Search Results Popover Dropdown */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-[600px] max-w-[92vw] z-50 rounded-2xl border border-surface-border bg-surface shadow-2xl overflow-hidden flex flex-col max-h-[80vh] text-text-primary animate-in fade-in duration-150">
          
          {/* Category Filter Pills */}
          <div className="flex items-center justify-between border-b border-surface-border px-4 py-2.5 bg-surface-alt/40">
            <div className="flex items-center space-x-1.5 text-xs">
              <button
                onClick={() => setCategoryFilter('ALL')}
                className={`rounded-xl px-3 py-1 font-bold transition ${
                  categoryFilter === 'ALL'
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-text-secondary hover:bg-surface-alt hover:text-text-primary'
                }`}
              >
                Tất cả ({matchingTasks.length + matchingWorkspaces.length})
              </button>
              <button
                onClick={() => setCategoryFilter('TASK')}
                className={`rounded-xl px-3 py-1 font-bold transition ${
                  categoryFilter === 'TASK'
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-text-secondary hover:bg-surface-alt hover:text-text-primary'
                }`}
              >
                Công việc ({matchingTasks.length})
              </button>
              <button
                onClick={() => setCategoryFilter('WORKSPACE')}
                className={`rounded-xl px-3 py-1 font-bold transition ${
                  categoryFilter === 'WORKSPACE'
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-text-secondary hover:bg-surface-alt hover:text-text-primary'
                }`}
              >
                Workspace ({matchingWorkspaces.length})
              </button>
            </div>

            <span className="text-[11px] font-semibold text-text-muted">Dữ liệu thực tế CSDL</span>
          </div>

          {/* Results Scroll Area */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4 max-h-[420px] scrollbar-none">
            {isTasksLoading ? (
              <div className="p-4 space-y-2">
                <div className="h-10 animate-pulse rounded-xl bg-surface-alt" />
                <div className="h-10 animate-pulse rounded-xl bg-surface-alt" />
              </div>
            ) : totalResultsCount === 0 ? (
              <div className="p-8 text-center text-xs text-text-muted italic space-y-1">
                <Search className="h-6 w-6 mx-auto text-text-muted opacity-60" />
                <p>Không tìm thấy kết quả phù hợp cho từ khóa &quot;{query}&quot;</p>
              </div>
            ) : (
              <>
                {/* Workspaces Section */}
                {displayWorkspaces.length > 0 && (
                  <div className="space-y-1.5">
                    <h4 className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider px-2">
                      Không gian làm việc (Workspace)
                    </h4>
                    {displayWorkspaces.map((ws) => (
                      <div
                        key={ws.id}
                        onClick={() => {
                          setIsOpen(false);
                          setActiveWorkspace(ws);
                          router.push(`/workspaces/${ws.id}`);
                        }}
                        className="flex items-center justify-between rounded-xl px-3 py-2 text-xs cursor-pointer transition hover:bg-surface-alt/80 border border-transparent hover:border-primary/20 group"
                      >
                        <div className="flex items-center space-x-3 truncate min-w-0">
                          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500 shrink-0 font-bold">
                            <Building2 className="h-4 w-4" />
                          </div>
                          <div className="truncate min-w-0">
                            <p className="font-bold text-text-primary font-heading group-hover:text-primary transition truncate">
                              {ws.name}
                            </p>
                            <p className="text-[10px] text-text-secondary truncate">
                              {ws.description || `${ws.memberCount || 1} thành viên`}
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full shrink-0">
                          Mở Workspace ➔
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tasks Section */}
                {displayTasks.length > 0 && (
                  <div className="space-y-1.5">
                    <h4 className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider px-2">
                      Công việc (Tasks)
                    </h4>
                    {displayTasks.map((task) => {
                      const isCompleted = task.status === 'COMPLETED' || task.status === 'DONE';
                      return (
                        <div
                          key={task.id}
                          onClick={() => {
                            setIsOpen(false);
                            setSelectedTask(task);
                          }}
                          className="flex items-center justify-between rounded-xl px-3 py-2.5 text-xs cursor-pointer transition hover:bg-primary/5 border border-transparent hover:border-primary/30 group"
                        >
                          <div className="flex items-center space-x-3 truncate min-w-0">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-xl shrink-0 font-bold ${
                              isCompleted ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary/10 text-primary'
                            }`}>
                              <CheckSquare className="h-4 w-4" />
                            </div>
                            <div className="truncate min-w-0">
                              <p className="font-bold text-text-primary font-heading group-hover:text-primary transition truncate">
                                {task.title}
                              </p>
                              <div className="flex items-center space-x-2 text-[10px] text-text-muted mt-0.5">
                                <span className="font-semibold text-text-secondary uppercase">
                                  {task.status || 'TODO'}
                                </span>
                                {task.assignee && (
                                  <span>• Người làm: {task.assignee.fullName || task.assignee.email}</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <span className="text-[10px] font-bold text-text-muted group-hover:text-primary transition shrink-0 pl-2">
                            Bấm để xem ➔
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Quick Footer Bar */}
          <div className="flex items-center justify-between border-t border-surface-border px-4 py-2.5 bg-surface-alt/30 text-xs">
            <span className="text-[11px] text-text-secondary">
              Mẹo: Nhấn <kbd className="font-mono font-bold text-primary">Esc</kbd> để đóng nhanh
            </span>
            <button
              onClick={() => {
                setIsOpen(false);
                router.push('/tasks');
              }}
              className="flex items-center space-x-1 font-bold text-primary hover:underline text-xs"
            >
              <span>Xem tất cả công việc</span>
              <CornerDownLeft className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Task Detail Modal for Search Clicks */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
      />
    </div>
  );
}
