'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Trash2, 
  Edit3, 
  X, 
  CheckSquare, 
  User, 
  Clock, 
  Lock, 
  ShieldAlert, 
  Save, 
  Loader2,
  ListChecks,
  Plus,
  MessageSquare,
  Paperclip,
  CheckCircle2,
  AlertCircle,
  PlayCircle
} from 'lucide-react';
import type { TaskDto, TaskPriority, TaskStatus } from '../types';
import { TaskStatusBadge } from './task-status-badge';
import { TaskPriorityBadge } from './task-priority-badge';
import { useAssignTask, useDeleteTask, useUpdateTaskStatus } from '../hooks/use-task';
import { AttachmentList } from '@/features/attachment/components/attachment-list';
import { useWorkspaceStore } from '@/store/workspace-store';
import { useWorkspaceMembers } from '@/features/workspace/hooks/use-workspace';
import { useAuthStore } from '@/store/auth-store';
import { ConfirmStatusChangeModal } from './confirm-status-change-modal';

interface TaskDetailModalProps {
  task: TaskDto | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (task: TaskDto) => void;
}

interface ChecklistItem {
  id: string;
  title: string;
  isCompleted: boolean;
}

export function TaskDetailModal({ task, isOpen, onClose, onEdit }: TaskDetailModalProps) {
  const updateStatus = useUpdateTaskStatus();
  const deleteTask = useDeleteTask();
  const assignTask = useAssignTask();
  const activeWorkspaceId = useWorkspaceStore((state) => state.activeWorkspaceId);
  const { data: members = [] } = useWorkspaceMembers(activeWorkspaceId);
  const currentUser = useAuthStore((state) => state.user);

  // Local state for deferred saving & editing
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus>('TODO');
  const [selectedPriority, setSelectedPriority] = useState<TaskPriority>('MEDIUM');
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string>('');

  // Status Change Confirmation Modal State
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    newStatus: TaskStatus;
  } | null>(null);

  // Checklist Items State
  const [checklists, setChecklists] = useState<ChecklistItem[]>([
    { id: '1', title: 'Phân tích yêu cầu chức năng', isCompleted: true },
    { id: '2', title: 'Thiết kế giao diện và luồng dữ liệu', isCompleted: true },
    { id: '3', title: 'Kiểm thử unit test và xác nhận với team', isCompleted: false },
  ]);
  const [newChecklistTitle, setNewChecklistTitle] = useState('');

  useEffect(() => {
    if (task) {
      setSelectedStatus(task.status);
      setSelectedPriority(task.priority || 'MEDIUM');
      setSelectedAssigneeId(task.assigneeId || '');
    }
  }, [task]);

  // Role Permissions
  const currentMember = members.find((m) => m.userId === currentUser?.id);
  const isManagerOrAdmin = currentMember
    ? ['OWNER', 'ADMIN', 'MANAGER'].includes(currentMember.role.toUpperCase())
    : currentUser?.roles?.some((r) => ['ADMIN', 'MANAGER', 'ROLE_ADMIN', 'ROLE_MANAGER'].includes(r.toUpperCase()));
  const isStaff = !isManagerOrAdmin;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !task) return null;

  const handleDelete = () => {
    if (confirm('Bạn có chắc chắn muốn xóa công việc này?')) {
      deleteTask.mutate(task.id, {
        onSuccess: () => {
          onClose();
        },
      });
    }
  };

  // Status Click Handler -> Triggers Confirmation Modal!
  const handleRequestStatusChange = (newStatus: TaskStatus) => {
    if (newStatus === task.status) return;
    setPendingStatusChange({ newStatus });
  };

  // Confirm Status Mutation Execution
  const handleConfirmStatusChange = () => {
    if (!pendingStatusChange) return;
    updateStatus.mutate(
      { taskId: task.id, status: pendingStatusChange.newStatus },
      {
        onSuccess: () => {
          setSelectedStatus(pendingStatusChange.newStatus);
          setPendingStatusChange(null);
        },
      }
    );
  };

  // Toggle Checklist Item
  const toggleChecklist = (id: string) => {
    setChecklists((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isCompleted: !item.isCompleted } : item))
    );
  };

  // Add Checklist Item
  const handleAddChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistTitle.trim()) return;
    setChecklists((prev) => [
      ...prev,
      { id: Date.now().toString(), title: newChecklistTitle.trim(), isCompleted: false },
    ]);
    setNewChecklistTitle('');
  };

  // Save Assignee or Status changes
  const handleSave = () => {
    const promises: Promise<any>[] = [];

    if (isManagerOrAdmin && selectedAssigneeId !== (task.assigneeId || '')) {
      const val = selectedAssigneeId || null;
      promises.push(assignTask.mutateAsync({ taskId: task.id, assigneeId: val }));
    }

    if (promises.length > 0) {
      Promise.all(promises)
        .then(() => {
          onClose();
        })
        .catch(() => {});
    } else {
      onClose();
    }
  };

  const completedChecklistCount = checklists.filter((c) => c.isCompleted).length;
  const checklistPercentage =
    checklists.length > 0 ? Math.round((completedChecklistCount / checklists.length) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="flex flex-col h-full w-full sm:h-auto sm:max-w-4xl rounded-2xl border border-surface-border bg-surface text-text-primary shadow-2xl max-h-[90vh] overflow-hidden">
        
        {/* Modal Header Bar */}
        <div className="flex items-center justify-between border-b border-surface-border px-6 py-4 bg-surface-alt/40">
          <div className="flex items-center space-x-3.5 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-xs">
              <CheckSquare className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <span className="rounded-md border border-primary/20 bg-primary/10 px-2 py-0.5 text-xs font-mono font-bold text-primary">
                  #{task.id.substring(0, 6).toUpperCase()}
                </span>
                <TaskStatusBadge status={task.status} />
                <TaskPriorityBadge priority={task.priority} />
              </div>
              <h2 className="mt-1 text-base sm:text-lg font-extrabold text-text-primary font-heading truncate">
                {task.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 shrink-0 ml-4">
            {isManagerOrAdmin && (
              <button
                type="button"
                onClick={handleDelete}
                className="rounded-xl p-2 text-text-muted hover:bg-status-error/10 hover:text-status-error transition"
                title="Xóa công việc"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-text-muted hover:bg-surface-alt hover:text-text-primary transition"
              title="Đóng"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Content (2-Column Grid) */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            
            {/* Left 2 Columns: Description, Checklist & Attachments */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Description Card */}
              <div className="rounded-2xl border border-surface-border bg-surface-alt/30 p-5 space-y-2.5 shadow-xs">
                <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">
                  Mô tả công việc
                </h3>
                <div className="text-xs text-text-primary leading-relaxed whitespace-pre-wrap">
                  {task.description || (
                    <span className="text-text-muted italic">Chưa có mô tả chi tiết cho công việc này.</span>
                  )}
                </div>
              </div>

              {/* Interactive Subtask Checklist Section */}
              <div className="rounded-2xl border border-surface-border bg-surface-alt/30 p-5 space-y-3.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-text-primary font-heading uppercase tracking-wider flex items-center space-x-2">
                    <ListChecks className="h-4 w-4 text-primary" />
                    <span>Danh sách công việc phụ (Checklist)</span>
                  </h3>
                  <span className="text-[11px] font-bold text-primary">
                    {completedChecklistCount}/{checklists.length} ({checklistPercentage}%)
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="h-1.5 w-full rounded-full bg-surface-alt overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${checklistPercentage}%` }}
                  />
                </div>

                {/* Checklist Items Stream */}
                <div className="space-y-2 pt-1">
                  {checklists.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => toggleChecklist(item.id)}
                      className="flex items-center space-x-3 rounded-xl border border-surface-border bg-surface p-2.5 text-xs hover:border-primary/40 transition cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={item.isCompleted}
                        onChange={() => toggleChecklist(item.id)}
                        className="h-4 w-4 rounded-xs border-surface-border text-primary focus:ring-primary cursor-pointer"
                      />
                      <span
                        className={`font-medium transition ${
                          item.isCompleted ? 'line-through text-text-muted decoration-emerald-500 decoration-2' : 'text-text-primary'
                        }`}
                      >
                        {item.title}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Add New Checklist Item Form */}
                <form onSubmit={handleAddChecklist} className="flex items-center space-x-2 pt-2">
                  <input
                    type="text"
                    placeholder="Thêm mục cần làm..."
                    value={newChecklistTitle}
                    onChange={(e) => setNewChecklistTitle(e.target.value)}
                    className="flex-1 rounded-xl border border-surface-border bg-surface px-3 py-1.5 text-xs text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="flex items-center space-x-1 rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-white hover:bg-primary-hover transition"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Thêm</span>
                  </button>
                </form>
              </div>

              {/* Synchronized Attachment Component */}
              <AttachmentList taskId={task.id} />
            </div>

            {/* Right 1 Column Sidebar: Assignee, Status Switcher (With Modal Confirmation!) & Dates */}
            <div className="space-y-6 border-t lg:border-t-0 lg:border-l border-surface-border lg:pl-6 pt-5 lg:pt-0">
              
              {/* Assignee Card with Role Restriction */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center space-x-1.5">
                    <User className="h-3.5 w-3.5 text-primary" />
                    <span>Người thực hiện</span>
                  </label>
                  {isStaff && (
                    <span className="flex items-center space-x-1 text-[10px] font-semibold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md">
                      <Lock className="h-2.5 w-2.5" />
                      <span>Chỉ đọc</span>
                    </span>
                  )}
                </div>

                <div className="relative">
                  <select
                    disabled={isStaff}
                    value={selectedAssigneeId}
                    onChange={(e) => setSelectedAssigneeId(e.target.value)}
                    className={`w-full rounded-xl border border-surface-border p-2.5 text-xs font-semibold transition shadow-xs ${
                      isStaff
                        ? 'bg-surface-alt/70 text-text-muted cursor-not-allowed opacity-80'
                        : 'bg-surface-alt text-text-primary focus:border-primary focus:outline-none'
                    }`}
                  >
                    <option value="" className="bg-surface text-text-muted">-- Chưa phân công --</option>
                    {members.map((m) => (
                      <option key={m.userId} value={m.userId} className="bg-surface text-text-primary">
                        {m.fullName || m.email}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status Switcher (CLICKING TRIGGERS CONFIRMATION MODAL!) */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
                  Chuyển trạng thái công việc
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'] as TaskStatus[]).map((s) => {
                    const statusLabels: Record<string, string> = {
                      TODO: 'Cần làm',
                      IN_PROGRESS: 'Đang làm',
                      IN_REVIEW: 'Đang xem xét',
                      DONE: 'Hoàn thành',
                    };

                    const isCurrent = task.status === s || (s === 'DONE' && task.status === 'COMPLETED');

                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleRequestStatusChange(s)}
                        className={`rounded-xl py-2 px-2.5 text-xs font-bold border text-center transition duration-150 active:scale-95 ${
                          isCurrent
                            ? 'border-primary bg-primary text-white shadow-xs'
                            : 'border-surface-border bg-surface-alt text-text-secondary hover:border-primary/40 hover:text-text-primary'
                        }`}
                      >
                        {statusLabels[s] || s}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dates & Milestones Card */}
              <div className="space-y-3 rounded-2xl border border-surface-border bg-surface-alt/40 p-4 text-xs shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-text-muted flex items-center space-x-1.5 font-medium">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    <span>Hạn chót:</span>
                  </span>
                  <span className="font-bold text-text-primary">
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString('vi-VN') : 'Chưa đặt hạn'}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-surface-border/60 pt-2.5">
                  <span className="text-text-muted flex items-center space-x-1.5 font-medium">
                    <Clock className="h-3.5 w-3.5 text-text-muted" />
                    <span>Ngày tạo:</span>
                  </span>
                  <span className="font-semibold text-text-muted">
                    {task.createdAt ? new Date(task.createdAt).toLocaleDateString('vi-VN') : '---'}
                  </span>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* Modal Footer Bar */}
        <div className="flex items-center justify-between border-t border-surface-border px-6 py-4 bg-surface-alt/40">
          <span className="text-xs text-text-muted font-medium">
            Mã công việc: <code className="rounded-md bg-surface-alt border border-surface-border px-2 py-0.5 text-[11px] font-mono text-text-secondary">{task.id.substring(0, 8)}</code>
          </span>

          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-surface-border bg-surface px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-surface-alt hover:text-text-primary transition shadow-xs"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={assignTask.isPending}
              className="flex items-center space-x-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-hover disabled:opacity-50 transition shadow-xs"
            >
              {assignTask.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Lưu</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>

      {/* Status Change Confirmation Modal Inside TaskDetailModal */}
      <ConfirmStatusChangeModal
        isOpen={!!pendingStatusChange}
        onClose={() => setPendingStatusChange(null)}
        onConfirm={handleConfirmStatusChange}
        taskTitle={task.title}
        currentStatus={task.status}
        newStatus={pendingStatusChange?.newStatus || 'DONE'}
        isLoading={updateStatus.isPending}
      />
    </div>
  );
}
