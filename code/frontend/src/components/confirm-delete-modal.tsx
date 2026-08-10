'use client';

import React from 'react';
import { X, AlertTriangle, Trash2, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  /** Tiêu đề hiển thị trong modal */
  title?: string;
  /** Mô tả chi tiết thao tác cần xác nhận */
  description?: string;
  /** Tên mục cụ thể cần xóa (sẽ được hiển thị in đậm) */
  itemName?: string;
  /** Nhãn nút Xác nhận xóa (mặc định: "Xóa") */
  confirmLabel?: string;
}

export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  title,
  description,
  itemName,
  confirmLabel,
}: ConfirmDeleteModalProps) {
  const { t } = useTranslation('common');

  if (!isOpen) return null;

  const defaultTitle = t('confirmDelete.title', { defaultValue: 'Xác nhận xóa' });
  const defaultDescription = itemName
    ? `Bạn có chắc chắn muốn xóa "${itemName}" không? Thao tác này không thể hoàn tác.`
    : t('messages.confirmDelete', { defaultValue: 'Bạn có chắc chắn muốn xóa không? Thao tác này không thể hoàn tác.' });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-sm rounded-2xl border border-surface-border bg-surface p-6 shadow-2xl text-text-primary space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-status-error/10 text-status-error">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h3 className="text-base font-extrabold text-text-primary font-heading">
              {title || defaultTitle}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-text-muted hover:bg-surface-alt hover:text-text-primary transition shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Description */}
        <p className="text-sm text-text-secondary leading-relaxed">
          {description || defaultDescription}
        </p>

        {/* Item Name Badge */}
        {itemName && (
          <div className="rounded-xl border border-status-error/20 bg-status-error/5 px-3 py-2.5">
            <p className="text-xs font-bold text-status-error truncate">
              🗑️ {itemName}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-2 border-t border-surface-border pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-xl border border-surface-border bg-surface-alt px-4 py-2 text-xs font-bold text-text-secondary hover:bg-surface hover:text-text-primary transition disabled:opacity-50"
          >
            {t('actions.cancel', { defaultValue: 'Hủy bỏ' })}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex items-center space-x-1.5 rounded-xl bg-status-error px-4 py-2 text-xs font-bold text-white shadow-xs hover:brightness-110 transition active:scale-95 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
            <span>{confirmLabel || t('actions.delete', { defaultValue: 'Xóa' })}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
