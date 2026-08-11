'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, X, Edit3, Palette, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useUpdateWorkspace } from '../hooks/use-workspace';
import type { WorkspaceDto } from '../types';

const editWorkspaceSchema = z.object({
  name: z.string().min(2, 'Tên Workspace phải chứa ít nhất 2 ký tự'),
  slug: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
});

type EditWorkspaceFormData = z.infer<typeof editWorkspaceSchema>;

interface EditWorkspaceDialogProps {
  workspace: WorkspaceDto | null;
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_COLORS = [
  '#ea580c', // Workspace Orange
  '#6366f1', // Indigo
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#0891b2', // Cyan
  '#ec4899', // Pink
];

export function EditWorkspaceDialog({ workspace, isOpen, onClose }: EditWorkspaceDialogProps) {
  const { t } = useTranslation('workspace');
  const { t: tCommon } = useTranslation('common');

  const updateMutation = useUpdateWorkspace(workspace?.id || '');
  const [themeColor, setThemeColor] = useState<string>('#ea580c');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditWorkspaceFormData>({
    resolver: zodResolver(editWorkspaceSchema),
  });

  useEffect(() => {
    if (workspace) {
      reset({
        name: workspace.name,
        slug: workspace.slug || '',
        description: workspace.description || '',
      });
      setThemeColor(workspace.themeColor || '#ea580c');
    }
  }, [workspace, reset]);

  if (!isOpen || !workspace) return null;

  const onSubmit = (data: EditWorkspaceFormData) => {
    setErrorMessage(null);
    updateMutation.mutate(
      {
        name: data.name,
        slug: data.slug || undefined,
        description: data.description || undefined,
        themeColor,
      },
      {
        onSuccess: () => {
          onClose();
        },
        onError: (err: any) => {
          setErrorMessage(err.response?.data?.message || tCommon('messages.genericError', { defaultValue: 'Cập nhật thất bại.' }));
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
      <div className="w-full max-w-lg rounded-2xl border border-surface-border bg-surface p-6 shadow-2xl text-text-primary space-y-5 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b border-surface-border pb-4">
          <div className="flex items-center space-x-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white font-bold shadow-md"
              style={{ backgroundColor: themeColor }}
            >
              <Edit3 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text-primary font-heading">
                {t('editWorkspace', { defaultValue: 'Chỉnh sửa Workspace' })}
              </h2>
              <p className="text-xs text-text-muted">
                Cập nhật thông tin nhận diện và mô tả cho không gian làm việc
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
          <div className="rounded-xl border border-status-error/30 bg-status-error/10 p-3 text-xs text-status-error">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary">
                {t('nameLabel', { defaultValue: 'Tên Không gian làm việc' })} <span className="text-red-500">*</span>
              </label>
              <input
                {...register('name')}
                type="text"
                placeholder={t('namePlaceholder')}
                className="w-full rounded-xl border border-surface-border bg-surface-alt p-2.5 text-xs text-text-primary placeholder:text-text-muted transition focus:border-primary focus:outline-none"
              />
              {errors.name && (
                <p className="text-[11px] text-status-error">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary">
                {t('slugLabel', { defaultValue: 'Mã định danh (Slug)' })}
              </label>
              <input
                {...register('slug')}
                type="text"
                placeholder="tech-dept"
                className="w-full rounded-xl border border-surface-border bg-surface-alt p-2.5 text-xs text-text-primary placeholder:text-text-muted transition focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary">
              {t('descriptionLabel', { defaultValue: 'Mô tả mục đích sử dụng' })}
            </label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder={t('descriptionPlaceholder')}
              className="w-full rounded-xl border border-surface-border bg-surface-alt p-2.5 text-xs text-text-primary placeholder:text-text-muted transition focus:border-primary focus:outline-none"
            />
          </div>

          {/* Theme Color Picker */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-text-secondary flex items-center space-x-1.5">
              <Palette className="h-4 w-4 text-primary" />
              <span>Màu chủ đề Workspace (Theme Color)</span>
            </label>
            <div className="flex items-center space-x-2.5">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setThemeColor(color)}
                  style={{ backgroundColor: color }}
                  className={`flex h-7 w-7 items-center justify-center rounded-full transition-transform shadow-xs ${
                    themeColor === color ? 'scale-110 ring-2 ring-primary ring-offset-2 ring-offset-surface' : 'hover:scale-105'
                  }`}
                >
                  {themeColor === color && <Check className="h-4 w-4 text-white" />}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 border-t border-surface-border pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-surface-border px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-surface-alt transition"
            >
              {tCommon('actions.cancel', { defaultValue: 'Hủy' })}
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="flex items-center space-x-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-md transition hover:bg-primary-hover active:scale-95 disabled:opacity-50"
            >
              {updateMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <span>{tCommon('actions.save', { defaultValue: 'Lưu thay đổi' })}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
