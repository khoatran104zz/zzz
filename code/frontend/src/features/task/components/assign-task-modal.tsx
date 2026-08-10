'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, UserCheck, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useWorkspaceMembers } from '@/features/workspace/hooks/use-workspace';
import { useWorkspaceTasks, useAssignTask } from '../hooks/use-task';

interface AssignTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
}

export function AssignTaskModal({ isOpen, onClose, workspaceId }: AssignTaskModalProps) {
  const { t: tTask } = useTranslation('task');
  const { t: tCommon } = useTranslation('common');

  const { data: members = [], isLoading: isLoadingMembers } = useWorkspaceMembers(workspaceId || null);
  const { data: tasks = [], isLoading: isLoadingTasks } = useWorkspaceTasks(workspaceId || null);

  const assignTaskMutation = useAssignTask();

  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string>('');

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    if (!selectedTaskId) {
      setErrorMsg('Vui lòng chọn công việc để giao');
      return;
    }

    if (!selectedAssigneeId) {
      setErrorMsg('Vui lòng chọn thành viên để nhận công việc');
      return;
    }

    assignTaskMutation.mutate(
      {
        taskId: selectedTaskId,
        assigneeId: selectedAssigneeId,
      },
      {
        onSuccess: () => {
          setSuccessMsg('Đã giao công việc thành công!');
          setTimeout(() => {
            handleClose();
          }, 1200);
        },
        onError: (err: any) => {
          setErrorMsg(err.response?.data?.message || tCommon('messages.genericError'));
        },
      }
    );
  };

  const handleClose = () => {
    setSuccessMsg(null);
    setErrorMsg(null);
    setSelectedTaskId('');
    setSelectedAssigneeId('');
    onClose();
  };

  const isPending = assignTaskMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className="w-full max-w-md rounded-2xl border border-surface-border bg-surface p-6 shadow-2xl text-text-primary space-y-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-surface-border pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary font-heading">
                {tTask('assignTaskModalTitle', { defaultValue: 'Giao công việc cho thành viên' })}
              </h3>
              <p className="text-[11px] text-text-secondary">
                {tTask('assignTaskModalSubtitle', { defaultValue: 'Chọn công việc và chỉ định thành viên nhận việc trong dự án' })}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-1.5 text-text-muted hover:bg-surface-alt hover:text-text-primary transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Feedback Alerts */}
        {errorMsg && (
          <div className="flex items-center space-x-2 rounded-xl border border-status-error/30 bg-status-error/10 p-3 text-xs text-status-error">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center space-x-2 rounded-xl border border-status-success/30 bg-status-success/10 p-3 text-xs text-status-success">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form Controls: Only Select Task & Select Member */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Select Task Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary">
              {tTask('selectTask', { defaultValue: 'Chọn công việc cần giao' })} *
            </label>
            <select
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              required
              className="w-full rounded-xl border border-surface-border bg-surface-alt p-2.5 text-xs text-text-primary focus:border-primary focus:outline-none"
            >
              <option value="" disabled className="bg-surface text-text-muted">
                -- Chọn công việc trong dự án --
              </option>
              {isLoadingTasks ? (
                <option disabled>Đang tải danh sách công việc...</option>
              ) : (
                tasks.map((task) => (
                  <option key={task.id} value={task.id} className="bg-surface text-text-primary">
                    [{task.status}] {task.title} {task.assignee ? `(Đã giao: ${task.assignee.fullName})` : '(Chưa phân công)'}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Select Member Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary">
              {tTask('fields.assignee', { defaultValue: 'Người thực hiện' })} *
            </label>
            <select
              value={selectedAssigneeId}
              onChange={(e) => setSelectedAssigneeId(e.target.value)}
              required
              className="w-full rounded-xl border border-surface-border bg-surface-alt p-2.5 text-xs text-text-primary focus:border-primary focus:outline-none"
            >
              <option value="" disabled className="bg-surface text-text-muted">
                -- Chọn thành viên trong dự án --
              </option>
              {isLoadingMembers ? (
                <option disabled>Đang tải thành viên...</option>
              ) : (
                members.map((m) => {
                  const name = m.fullName || m.email || 'Thành viên';
                  const roleBadge = m.role ? `[${m.role}]` : '';
                  return (
                    <option key={m.userId} value={m.userId} className="bg-surface text-text-primary">
                      👤 {name} {roleBadge} ({m.email || 'No email'})
                    </option>
                  );
                })
              )}
            </select>
          </div>

          {/* Actions Footer */}
          <div className="flex items-center justify-end space-x-2.5 border-t border-surface-border pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl border border-surface-border px-4 py-2 text-xs font-medium text-text-secondary hover:bg-surface-alt"
            >
              {tCommon('actions.cancel')}
            </button>

            <button
              type="submit"
              disabled={isPending || !selectedTaskId || !selectedAssigneeId}
              className="flex items-center space-x-2 rounded-xl bg-primary px-5 py-2 text-xs font-semibold text-white shadow-md transition hover:bg-primary-hover disabled:opacity-50 active:scale-95"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <UserCheck className="h-4 w-4" />
                  <span>{tTask('assignAction', { defaultValue: 'Phân công công việc' })}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
