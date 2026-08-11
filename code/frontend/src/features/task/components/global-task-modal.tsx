'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckSquare, Loader2, X, Plus, Folder } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/auth-store';
import { useWorkspaceStore } from '@/store/workspace-store';
import { useWorkspaces, useWorkspaceMembers } from '@/features/workspace/hooks/use-workspace';
import { useProjects } from '@/features/project/hooks/use-project';
import { useCreateWorkspaceTask } from '../hooks/use-task';
import type { TaskPriority, TaskStatus } from '../types';

const taskSchema = z.object({
  title: z.string().min(1, 'Tên công việc không được để trống'),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED', 'CANCELLED']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  dueDate: z.string().optional(),
  assigneeId: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface GlobalTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProjectId?: string;
}

export function GlobalTaskModal({ isOpen, onClose, defaultProjectId }: GlobalTaskModalProps) {
  const [mounted, setMounted] = useState(false);
  const { t: tTask } = useTranslation('task');
  const { t: tCommon } = useTranslation('common');
  const currentUser = useAuthStore((state) => state.user);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: workspaces = [] } = useWorkspaces();
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace);

  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  useEffect(() => {
    if (activeWorkspace?.id) {
      setSelectedWorkspaceId(activeWorkspace.id);
    } else if (workspaces.length > 0 && !selectedWorkspaceId) {
      setSelectedWorkspaceId(workspaces[0].id);
    }
  }, [activeWorkspace, workspaces]);

  const workspaceId = selectedWorkspaceId || activeWorkspace?.id || workspaces[0]?.id || '';
  const { data: members = [] } = useWorkspaceMembers(workspaceId || null);
  const { data: projects = [] } = useProjects(workspaceId || null);

  useEffect(() => {
    if (defaultProjectId) {
      setSelectedProjectId(defaultProjectId);
    }
  }, [defaultProjectId]);

  const isAdmin = currentUser?.roles?.includes('ROLE_ADMIN') || currentUser?.email === 'admin@gmail.com';
  const isManager = currentUser?.roles?.includes('ROLE_MANAGER') || currentUser?.email === 'manager@gmail.com';
  const isStaff = !isAdmin && !isManager;

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'TODO',
      priority: 'MEDIUM',
      dueDate: '',
      assigneeId: '',
    },
  });

  const createWorkspaceTaskMutation = useCreateWorkspaceTask(workspaceId);

  if (!isOpen || !mounted) return null;

  const onSubmit = (data: TaskFormData) => {
    setErrorMessage(null);

    if (!workspaceId) {
      setErrorMessage('Vui lòng chọn Workspace hợp lệ.');
      return;
    }

    const dueDateInstant = data.dueDate ? new Date(data.dueDate).toISOString() : undefined;

    createWorkspaceTaskMutation.mutate(
      {
        title: data.title,
        description: data.description || undefined,
        status: data.status as TaskStatus,
        priority: data.priority as TaskPriority,
        dueDate: dueDateInstant,
        assigneeId: data.assigneeId || undefined,
        projectId: selectedProjectId || defaultProjectId || undefined,
      },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
        onError: (err: any) => {
          setErrorMessage(err.response?.data?.message || tCommon('messages.genericError'));
        },
      }
    );
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative my-auto w-full max-w-lg rounded-2xl border border-surface-border bg-surface p-6 shadow-2xl space-y-4 text-text-primary max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-surface-border pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <CheckSquare className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-text-primary font-heading">
                {isStaff ? 'Yêu cầu tạo công việc mới' : tTask('createTask', { defaultValue: 'Tạo công việc mới' })}
              </h2>
              <p className="text-[11px] text-text-secondary">
                {isStaff ? 'Gửi đề xuất công việc tới Quản lý để phê duyệt' : 'Tạo công việc và chỉ định thuộc dự án nào'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-muted hover:bg-surface-alt hover:text-text-primary transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {errorMessage && (
          <div className="rounded-lg border border-status-error/30 bg-status-error/10 p-3 text-xs text-status-error">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Workspace & Project Pickers Grid */}
          <div className="grid gap-3 sm:grid-cols-2">
            {/* Workspace Picker */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary">Chọn Workspace *</label>
              <select
                value={selectedWorkspaceId}
                onChange={(e) => {
                  setSelectedWorkspaceId(e.target.value);
                  setSelectedProjectId('');
                }}
                required
                className="w-full rounded-xl border border-surface-border bg-surface-alt p-2.5 text-xs font-bold text-text-primary focus:border-primary focus:outline-none cursor-pointer"
              >
                <option value="">-- Chọn Workspace --</option>
                {workspaces.map((w) => (
                  <option key={w.id} value={w.id} className="bg-surface text-text-primary font-medium">
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Project Picker (Scrum Project Assignment) */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary">Chọn Dự án *</label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full rounded-xl border border-surface-border bg-surface-alt p-2.5 text-xs font-bold text-primary focus:border-primary focus:outline-none cursor-pointer"
              >
                <option value="">-- Chọn dự án trong Workspace --</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id} className="bg-surface text-text-primary font-medium">
                    {p.name} {p.key ? `#${p.key}` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Task Title */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-text-secondary">
              {isStaff ? 'Tên công việc đề xuất *' : 'Tên công việc *'}
            </label>
            <input
              {...register('title')}
              type="text"
              placeholder={isStaff ? 'Ví dụ: Đề xuất cập nhật lại quy trình tài liệu' : 'Ví dụ: Thiết kế giao diện Dashboard'}
              className="w-full rounded-xl border border-surface-border bg-surface-alt p-2.5 text-xs text-text-primary placeholder:text-text-muted transition focus:border-primary focus:outline-none"
            />
            {errors.title && <p className="text-[11px] text-status-error">{errors.title.message}</p>}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-text-secondary">
              {isStaff ? 'Mô tả chi tiết & Lý do đề xuất' : 'Mô tả công việc'}
            </label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder={isStaff ? 'Nêu chi tiết nội dung công việc và lý do đề xuất...' : 'Chi tiết công việc và yêu cầu...'}
              className="w-full rounded-xl border border-surface-border bg-surface-alt p-2.5 text-xs text-text-primary placeholder:text-text-muted transition focus:border-primary focus:outline-none"
            />
          </div>

          {/* Assignee Dropdown Picker */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-text-secondary">
              {tTask('fields.assignee', { defaultValue: 'Người thực hiện' })}
            </label>
            <select
              {...register('assigneeId')}
              className="w-full rounded-xl border border-surface-border bg-surface-alt p-2.5 text-xs text-text-primary focus:border-primary focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-surface text-text-muted">-- Chưa phân công --</option>
              {members.map((m) => (
                <option key={m.userId} value={m.userId} className="bg-surface text-text-primary">
                  {m.fullName || m.email}
                </option>
              ))}
            </select>
          </div>

          {/* Priority & Status Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-text-secondary">Độ ưu tiên</label>
              <select
                {...register('priority')}
                className="w-full rounded-xl border border-surface-border bg-surface-alt p-2.5 text-xs text-text-primary focus:border-primary focus:outline-none cursor-pointer"
              >
                <option value="LOW">Thấp</option>
                <option value="MEDIUM">Trung bình</option>
                <option value="HIGH">Cao</option>
                <option value="URGENT">Khẩn cấp</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-text-secondary">Trạng thái</label>
              <select
                {...register('status')}
                className="w-full rounded-xl border border-surface-border bg-surface-alt p-2.5 text-xs text-text-primary focus:border-primary focus:outline-none cursor-pointer"
              >
                <option value="TODO">Cần làm</option>
                <option value="IN_PROGRESS">Đang làm</option>
                <option value="IN_REVIEW">Đang xem xét</option>
                <option value="COMPLETED">Hoàn thành</option>
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-text-secondary">Hạn chót</label>
            <input
              {...register('dueDate')}
              type="date"
              className="w-full rounded-xl border border-surface-border bg-surface-alt p-2.5 text-xs text-text-primary transition focus:border-primary focus:outline-none"
            />
          </div>

          {/* Modal Action Buttons */}
          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-surface-border">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-surface-border px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-surface-alt hover:text-text-primary transition"
            >
              {tCommon('actions.cancel', { defaultValue: 'Hủy' })}
            </button>
            <button
              type="submit"
              disabled={createWorkspaceTaskMutation.isPending}
              className="flex items-center space-x-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-primary-hover transition active:scale-95 disabled:opacity-50"
            >
              {createWorkspaceTaskMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>{isStaff ? 'Gửi đề xuất công việc' : 'Tạo công việc'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
