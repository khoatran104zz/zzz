'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Folder, Loader2, X, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCreateProject } from '../hooks/use-project';

const COLOR_OPTIONS = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#3b82f6'];

const createProjectSchema = z.object({
  name: z.string().min(2, 'Tên dự án phải từ 2 ký tự trở lên'),
  key: z.string().max(3, 'Tên viết tắt tối đa 3 ký tự').optional(),
  description: z.string().optional(),
});

type CreateProjectFormData = z.infer<typeof createProjectSchema>;

interface CreateProjectDialogProps {
  workspaceId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function CreateProjectDialog({ workspaceId, isOpen, onClose }: CreateProjectDialogProps) {
  const { t } = useTranslation('project');
  const { t: tCommon } = useTranslation('common');
  const createMutation = useCreateProject(workspaceId);
  const [selectedColor, setSelectedColor] = useState('#6366f1');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: '',
      key: '',
      description: '',
    },
  });

  const projectName = watch('name');

  // Auto suggest 3-letter Project Key from Project Name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue('name', val);
    if (val.trim()) {
      const words = val.trim().split(/\s+/);
      let suggestedKey = '';
      if (words.length === 1) {
        suggestedKey = words[0].substring(0, 3).toUpperCase();
      } else {
        suggestedKey = words.slice(0, 3).map(w => w[0]).join('').toUpperCase();
      }
      if (suggestedKey) {
        setValue('key', suggestedKey);
      }
    }
  };

  if (!isOpen && !isSuccessModalOpen) return null;

  const onSubmit = (data: CreateProjectFormData) => {
    setErrorMessage(null);

    const projectKey = data.key
      ? data.key.trim().toUpperCase().substring(0, 3)
      : projectName
      ? projectName.substring(0, 3).toUpperCase()
      : 'PRJ';

    createMutation.mutate(
      {
        name: data.name.trim(),
        key: projectKey,
        description: data.description || undefined,
        color: selectedColor,
      },
      {
        onSuccess: () => {
          setIsSuccessModalOpen(true);
          setTimeout(() => {
            reset();
            setIsSuccessModalOpen(false);
            onClose();
          }, 1500);
        },
        onError: (err: any) => {
          setErrorMessage(err.response?.data?.message || tCommon('messages.genericError', { defaultValue: 'Tạo dự án thất bại.' }));
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
      <div className="w-full max-w-md rounded-2xl border border-surface-border bg-surface p-6 shadow-2xl space-y-4 text-text-primary animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-border pb-4">
          <div className="flex items-center space-x-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl text-white font-bold shadow-md"
              style={{ backgroundColor: selectedColor }}
            >
              <Folder className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-text-primary font-heading">
                {t('createModalTitle', { defaultValue: 'Tạo dự án mới' })}
              </h2>
              <p className="text-[11px] text-text-secondary">
                {t('subtitle', { defaultValue: 'Theo dõi và quản lý các dự án trong không gian làm việc' })}
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

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-text-secondary">
                Tên dự án <span className="text-red-500">*</span>
              </label>
              <input
                {...register('name')}
                onChange={handleNameChange}
                type="text"
                placeholder="Ví dụ: Thiết kế lại Website, Phát triển Mobile App..."
                className="w-full rounded-xl border border-surface-border bg-surface-alt p-2.5 text-xs text-text-primary placeholder:text-text-muted transition focus:border-primary focus:outline-none"
              />
              {errors.name && <p className="text-[11px] text-status-error">{errors.name.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary">
                Mã viết tắt dự án (Tối đa 3 ký tự)
              </label>
              <input
                {...register('key')}
                type="text"
                placeholder="PRJ"
                maxLength={3}
                className="w-full rounded-xl border border-surface-border bg-surface-alt p-2.5 text-xs text-primary font-bold uppercase placeholder:text-text-muted transition focus:border-primary focus:outline-none"
              />
              {errors.key && <p className="text-[11px] text-status-error">{errors.key.message}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary">
              Mô tả dự án
            </label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="Tóm tắt mục tiêu và phạm vi của dự án..."
              className="w-full rounded-xl border border-surface-border bg-surface-alt p-2.5 text-xs text-text-primary placeholder:text-text-muted transition focus:border-primary focus:outline-none"
            />
          </div>

          {/* Color Palette Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary">
              Màu sắc đại diện
            </label>
            <div className="flex items-center space-x-2.5">
              {COLOR_OPTIONS.map((c) => (
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

          {/* Actions */}
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
                  <span>Tạo dự án mới</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="Tạo dự án mới thành công!"
        description="Dự án mới đã được khởi tạo và sẵn sàng lập kế hoạch công việc."
      />
    </div>
  );
}
