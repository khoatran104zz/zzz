'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, X, Layers, Check, Sparkles, Building2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCreateWorkspace } from '../hooks/use-workspace';

const WORKSPACE_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#ea580c'];

const createWorkspaceSchema = z.object({
  name: z.string().min(2, 'Tên Workspace phải chứa ít nhất 2 ký tự'),
  slug: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
});

type CreateWorkspaceFormData = z.infer<typeof createWorkspaceSchema>;

interface CreateWorkspaceDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateWorkspaceDialog({ isOpen, onClose }: CreateWorkspaceDialogProps) {
  const { t } = useTranslation('workspace');
  const { t: tCommon } = useTranslation('common');
  const createMutation = useCreateWorkspace();
  const [selectedColor, setSelectedColor] = useState('#ea580c');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateWorkspaceFormData>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: {
      category: 'Software Engineering',
    },
  });

  if (!isOpen) return null;

  const onSubmit = (data: CreateWorkspaceFormData) => {
    setErrorMessage(null);
    createMutation.mutate(
      {
        name: data.name,
        slug: data.slug || undefined,
        description: data.description || undefined,
        themeColor: selectedColor,
      },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
        onError: (err: any) => {
          setErrorMessage(err.response?.data?.message || tCommon('messages.genericError', { defaultValue: 'Đã có lỗi xảy ra. Vui lòng thử lại.' }));
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
      <div className="w-full max-w-lg rounded-2xl border border-surface-border bg-surface p-6 shadow-2xl text-text-primary space-y-5 animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-surface-border pb-4">
          <div className="flex items-center space-x-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white font-bold shadow-md"
              style={{ backgroundColor: selectedColor }}
            >
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text-primary font-heading">
                {t('createModalTitle', { defaultValue: 'Tạo Không Gian Làm Việc Mới' })}
              </h2>
              <p className="text-xs text-text-muted">
                {t('createModalSubtitle', { defaultValue: 'Tạo không gian làm việc nhóm chuyên nghiệp cho phòng ban hoặc doanh nghiệp' })}
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Workspace Name & Slug Row */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary">
                {t('nameLabel', { defaultValue: 'Tên Không gian làm việc' })} <span className="text-red-500">*</span>
              </label>
              <input
                {...register('name')}
                type="text"
                placeholder={t('namePlaceholder', { defaultValue: 'Ví dụ: Phòng Công Nghệ, Marketing Team...' })}
                className="w-full rounded-xl border border-surface-border bg-surface-alt p-2.5 text-xs text-text-primary placeholder:text-text-muted transition focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {errors.name && (
                <p className="text-[11px] text-status-error">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary">
                {t('slugLabel', { defaultValue: 'Mã định danh' })}
              </label>
              <input
                {...register('slug')}
                type="text"
                placeholder="tech-dept"
                className="w-full rounded-xl border border-surface-border bg-surface-alt p-2.5 text-xs text-text-primary placeholder:text-text-muted transition focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Category / Department Selection */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary">Loại hình / Phòng ban</label>
            <select
              {...register('category')}
              className="w-full rounded-xl border border-surface-border bg-surface-alt p-2.5 text-xs text-text-primary transition focus:border-primary focus:outline-none"
            >
              <option value="Software Engineering">Công nghệ & Phát triển Phần mềm</option>
              <option value="Marketing & Growth">Marketing & Tiếp thị truyền thông</option>
              <option value="Business & Sales">Kinh doanh & Bán hàng</option>
              <option value="Design & Creative">Thiết kế & Sáng tạo UI/UX</option>
              <option value="Operations & HR">Vận hành & Nhân sự</option>
            </select>
          </div>

          {/* Theme Color Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary">Màu chủ đạo đại diện</label>
            <div className="flex items-center space-x-2.5">
              {WORKSPACE_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedColor(c)}
                  className="flex h-7 w-7 items-center justify-center rounded-full transition transform hover:scale-110 shadow-xs"
                  style={{ backgroundColor: c }}
                >
                  {selectedColor === c && <Check className="h-4 w-4 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary">
              {t('descriptionLabel', { defaultValue: 'Mô tả mục đích sử dụng' })}
            </label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder={t('descriptionPlaceholder', { defaultValue: 'Mô tả mục tiêu và phạm vi làm việc của Workspace này...' })}
              className="w-full rounded-xl border border-surface-border bg-surface-alt p-2.5 text-xs text-text-primary placeholder:text-text-muted transition focus:border-primary focus:outline-none"
            />
          </div>

          {/* Action Footer */}
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
              disabled={createMutation.isPending}
              className="flex items-center space-x-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-md transition hover:bg-primary-hover active:scale-95 disabled:opacity-50"
            >
              {createMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{t('createWorkspace', { defaultValue: 'Tạo Không Gian Làm Việc' })}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
