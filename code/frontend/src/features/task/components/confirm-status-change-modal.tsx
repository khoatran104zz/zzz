'use client';

import React from 'react';
import { Loader2, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { TaskStatus } from '../types';

interface ConfirmStatusChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  taskTitle: string;
  currentStatus: TaskStatus | string;
  newStatus: TaskStatus | string;
  isLoading?: boolean;
}

export function ConfirmStatusChangeModal({
  isOpen,
  onClose,
  onConfirm,
  taskTitle,
  currentStatus,
  newStatus,
  isLoading = false,
}: ConfirmStatusChangeModalProps) {
  const { t: tTask } = useTranslation('task');
  const { t: tCommon } = useTranslation('common');

  if (!isOpen) return null;

  const getStatusLabel = (st: string) => {
    switch (st) {
      case 'TODO':
        return tTask('statuses.TODO', { defaultValue: 'Cần làm' });
      case 'IN_PROGRESS':
        return tTask('statuses.IN_PROGRESS', { defaultValue: 'Đang làm' });
      case 'IN_REVIEW':
        return tTask('statuses.IN_REVIEW', { defaultValue: 'Đang xem xét' });
      case 'DONE':
      case 'COMPLETED':
        return tTask('statuses.DONE', { defaultValue: 'Hoàn thành' });
      default:
        return st;
    }
  };

  const getStatusColor = (st: string) => {
    switch (st) {
      case 'TODO':
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
      case 'IN_PROGRESS':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'IN_REVIEW':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'DONE':
      case 'COMPLETED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      default:
        return 'bg-primary/10 text-primary border-primary/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
      <div className="w-full max-w-md rounded-2xl border border-surface-border bg-surface p-6 shadow-2xl text-text-primary space-y-4 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center space-x-3 border-b border-surface-border pb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-500">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-text-primary font-heading">
              Xác Nhận Thay Đổi Trạng Thái
            </h3>
            <p className="text-xs text-text-muted">
              Xác nhận cập nhật tiến độ công việc trong dự án
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs text-text-secondary">
            Bạn có chắc chắn muốn chuyển trạng thái công việc <span className="font-bold text-text-primary">"{taskTitle}"</span> không?
          </p>

          <div className="flex items-center justify-center space-x-3 rounded-xl border border-surface-border bg-surface-alt/60 p-3.5 text-xs font-bold">
            <span className={`rounded-lg border px-2.5 py-1 ${getStatusColor(currentStatus)}`}>
              {getStatusLabel(currentStatus)}
            </span>

            <ArrowRight className="h-4 w-4 text-text-muted" />

            <span className={`rounded-lg border px-2.5 py-1 ${getStatusColor(newStatus)}`}>
              {getStatusLabel(newStatus)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-2 border-t border-surface-border pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-xl border border-surface-border px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-surface-alt transition"
          >
            {tCommon('actions.cancel', { defaultValue: 'Hủy' })}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex items-center space-x-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-md transition hover:bg-primary-hover active:scale-95 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>Xác Nhận Thay Đổi</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
