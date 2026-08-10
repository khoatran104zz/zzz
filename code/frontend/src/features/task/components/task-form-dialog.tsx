'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckSquare, Loader2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { TaskDto, TaskPriority, TaskStatus } from '../types';
import { useCreateTask, useCreateWorkspaceTask, useUpdateTask } from '../hooks/use-task';
import { useWorkspaceStore } from '@/store/workspace-store';
import { useWorkspaceMembers } from '@/features/workspace/hooks/use-workspace';

const taskSchema = z.object({
  title: z.string().min(1, 'Tên công việc không được để trống'),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED', 'DONE', 'CANCELLED']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  dueDate: z.string().optional(),
  assigneeId: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormDialogProps {
  projectId?: string;
  workspaceId?: string;
  task?: TaskDto | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TaskFormDialog({ projectId = '', workspaceId = '', task, isOpen, onClose }: TaskFormDialogProps) {
  const { t: tTask } = useTranslation('task');
  const { t: tCommon } = useTranslation('common');
  const isEditing = !!task;

  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace);
  const targetWorkspaceId = workspaceId || activeWorkspace?.id || '';
  const { data: members = [] } = useWorkspaceMembers(targetWorkspaceId || null);

  const createProjectTaskMutation = useCreateTask(projectId);
  const createWorkspaceTaskMutation = useCreateWorkspaceTask(targetWorkspaceId);
  const updateMutation = useUpdateTask(task?.id || '');

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

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        assigneeId: task.assigneeId || '',
      });
    } else {
      reset({
        title: '',
        description: '',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: '',
        assigneeId: '',
      });
    }
  }, [task, reset, isOpen]);

  if (!isOpen) return null;

  const onSubmit = (data: TaskFormData) => {
    setErrorMessage(null);
    const dueDateInstant = data.dueDate ? new Date(data.dueDate).toISOString() : undefined;
    const assigneeIdVal = data.assigneeId || undefined;

    if (isEditing) {
      updateMutation.mutate(
        {
          title: data.title,
          description: data.description || undefined,
          status: data.status as TaskStatus,
          priority: data.priority as TaskPriority,
          dueDate: dueDateInstant,
          assigneeId: assigneeIdVal,
        },
        {
          onSuccess: () => {
            onClose();
          },
          onError: (err: any) => {
            setErrorMessage(err.response?.data?.message || 'Cập nhật công việc thất bại.');
          },
        }
      );
    } else if (targetWorkspaceId) {
      createWorkspaceTaskMutation.mutate(
        {
          title: data.title,
          description: data.description || undefined,
          status: data.status as TaskStatus,
          priority: data.priority as TaskPriority,
          dueDate: dueDateInstant,
          assigneeId: assigneeIdVal,
        },
        {
          onSuccess: () => {
            reset();
            onClose();
          },
          onError: (err: any) => {
            setErrorMessage(err.response?.data?.message || 'Tạo công việc thất bại.');
          },
        }
      );
    } else {
      createProjectTaskMutation.mutate(
        {
          title: data.title,
          description: data.description || undefined,
          status: data.status as TaskStatus,
          priority: data.priority as TaskPriority,
          dueDate: dueDateInstant,
          assigneeId: assigneeIdVal,
        },
        {
          onSuccess: () => {
            reset();
            onClose();
          },
          onError: (err: any) => {
            setErrorMessage(err.response?.data?.message || 'Tạo công việc thất bại.');
          },
        }
      );
    }
  };

  const isPending = createProjectTaskMutation.isPending || createWorkspaceTaskMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
      <div className="w-full max-w-lg rounded-2xl border border-surface-border bg-surface p-6 shadow-2xl space-y-4 text-text-primary">
        <div className="flex items-center justify-between border-b border-surface-border pb-4">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CheckSquare className="h-4 w-4" />
            </div>
            <h2 className="text-sm font-semibold text-text-primary font-heading">
              {isEditing ? 'Chỉnh sửa công việc' : tTask('createTask', { defaultValue: 'Tạo công việc mới' })}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-text-muted hover:bg-surface-alt hover:text-text-primary transition"
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
          <div className="space-y-1">
            <label className="text-xs font-medium text-text-secondary">Tên công việc *</label>
            <input
              {...register('title')}
              type="text"
              placeholder="Ví dụ: Triển khai luồng đăng nhập"
              className="w-full rounded-lg border border-surface-border bg-surface-alt p-2.5 text-xs text-text-primary placeholder:text-text-muted transition focus:border-primary focus:outline-none"
            />
            {errors.title && <p className="text-[11px] text-status-error">{errors.title.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-text-secondary">Mô tả</label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="Chi tiết công việc và tiêu chuẩn hoàn thành..."
              className="w-full rounded-lg border border-surface-border bg-surface-alt p-2.5 text-xs text-text-primary placeholder:text-text-muted transition focus:border-primary focus:outline-none"
            />
          </div>

          {/* Assignee Selection Picker */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-text-secondary">
              {tTask('fields.assignee', { defaultValue: 'Người thực hiện' })} (Chỉ định người làm)
            </label>
            <select
              {...register('assigneeId')}
              className="w-full rounded-lg border border-surface-border bg-surface-alt p-2.5 text-xs text-text-primary transition focus:border-primary focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-surface text-text-muted">
                {tTask('fields.unassigned', { defaultValue: '-- Chưa phân công --' })}
              </option>
              {members.map((m) => {
                const name = m.fullName || m.email || 'Thành viên';
                const roleBadge = m.role ? `[${m.role}]` : '';
                return (
                  <option key={m.userId} value={m.userId} className="bg-surface text-text-primary">
                    👤 {name} {roleBadge} ({m.email || 'No email'})
                  </option>
                );
              })}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-text-secondary">Trạng thái</label>
              <select
                {...register('status')}
                className="w-full rounded-lg border border-surface-border bg-surface-alt p-2 text-xs text-text-primary transition focus:border-primary focus:outline-none cursor-pointer"
              >
                <option value="TODO" className="bg-surface text-text-primary">{tTask('statuses.TODO', { defaultValue: 'Cần làm' })}</option>
                <option value="IN_PROGRESS" className="bg-surface text-text-primary">{tTask('statuses.IN_PROGRESS', { defaultValue: 'Đang làm' })}</option>
                <option value="IN_REVIEW" className="bg-surface text-text-primary">{tTask('statuses.IN_REVIEW', { defaultValue: 'Đang xem xét' })}</option>
                <option value="DONE" className="bg-surface text-text-primary">{tTask('statuses.DONE', { defaultValue: 'Hoàn thành' })}</option>
                <option value="COMPLETED" className="bg-surface text-text-primary">{tTask('statuses.DONE', { defaultValue: 'Hoàn thành' })}</option>
                <option value="CANCELLED" className="bg-surface text-text-primary">{tTask('statuses.CANCELLED', { defaultValue: 'Đã hủy' })}</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-text-secondary">Độ ưu tiên</label>
              <select
                {...register('priority')}
                className="w-full rounded-lg border border-surface-border bg-surface-alt p-2 text-xs text-text-primary transition focus:border-primary focus:outline-none cursor-pointer"
              >
                <option value="LOW" className="bg-surface text-text-primary">{tTask('priorities.LOW', { defaultValue: 'Thấp' })}</option>
                <option value="MEDIUM" className="bg-surface text-text-primary">{tTask('priorities.MEDIUM', { defaultValue: 'Trung bình' })}</option>
                <option value="HIGH" className="bg-surface text-text-primary">{tTask('priorities.HIGH', { defaultValue: 'Cao' })}</option>
                <option value="URGENT" className="bg-surface text-text-primary">{tTask('priorities.URGENT', { defaultValue: 'Khẩn cấp' })}</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-text-secondary">Hạn chót</label>
              <input
                {...register('dueDate')}
                type="date"
                className="w-full rounded-lg border border-surface-border bg-surface-alt p-2 text-xs text-text-primary transition focus:border-primary focus:outline-none cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 border-t border-surface-border pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-surface-border px-4 py-2 text-xs font-medium text-text-secondary hover:bg-surface-alt transition"
            >
              {tCommon('actions.cancel')}
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-primary-hover active:scale-95 disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isEditing ? (
                'Lưu công việc'
              ) : (
                tTask('createTask', { defaultValue: 'Tạo công việc' })
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
