'use client';

import React, { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Loader2, Trash2, Settings, ShieldAlert, Archive, Star, Folder } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  useDeleteProject,
  useProjectDetails,
  useToggleArchiveProject,
  useToggleFavoriteProject,
  useUpdateProject,
} from '@/features/project/hooks/use-project';

import { SuccessModal } from '@/components/success-modal';

const COLOR_OPTIONS = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#3b82f6'];

const updateProjectSchema = z.object({
  name: z.string().min(2, 'Tên dự án phải từ 2 ký tự trở lên'),
  key: z.string().optional(),
  description: z.string().optional(),
});

type UpdateProjectFormData = z.infer<typeof updateProjectSchema>;

export default function ProjectSettingsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.projectId;
  const router = useRouter();

  const { t } = useTranslation('project');
  const { t: tCommon } = useTranslation('common');

  const { data: project, isLoading } = useProjectDetails(projectId);
  const updateMutation = useUpdateProject(projectId);
  const deleteMutation = useDeleteProject();
  const toggleArchive = useToggleArchiveProject();
  const toggleFavorite = useToggleFavoriteProject();

  const [selectedColor, setSelectedColor] = useState('#6366f1');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<UpdateProjectFormData>({
    resolver: zodResolver(updateProjectSchema),
    values: {
      name: project?.name || '',
      key: project?.key || '',
      description: project?.description || '',
    },
  });

  useEffect(() => {
    if (project?.color) {
      setSelectedColor(project.color);
    }
  }, [project]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center text-xs text-text-muted">
        Project not found or access denied.
      </div>
    );
  }

  const onSubmit = (data: UpdateProjectFormData) => {
    setSuccessMsg(null);
    setErrorMsg(null);
    updateMutation.mutate(
      {
        name: data.name,
        key: data.key || undefined,
        description: data.description || undefined,
        color: selectedColor,
      },
      {
        onSuccess: () => {
          setIsSuccessModalOpen(true);
          setSuccessMsg(t('messages.updateSuccess', { defaultValue: 'Cập nhật dự án thành công!' }));
        },
        onError: (err: any) => {
          setErrorMsg(err.response?.data?.message || tCommon('messages.genericError', { defaultValue: 'Cập nhật dự án thất bại.' }));
        },
      }
    );
  };

  const handleDelete = () => {
    deleteMutation.mutate(projectId, {
      onSuccess: () => {
        router.push(`/workspaces/${project.workspaceId}` as any);
      },
    });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-6 text-text-primary">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary font-heading flex items-center space-x-2">
          <Settings className="h-6 w-6 text-primary" />
          <span>{t('editModalTitle', { defaultValue: 'Cài Đặt Dự Án' })}</span>
        </h1>
        <p className="text-xs text-text-muted">
          {t('subtitle', { defaultValue: 'Cập nhật thông tin dự án, mã viết tắt Key, màu đại diện và thiết lập trạng thái' })}
        </p>
      </div>

      {/* General Settings Card */}
      <div className="rounded-2xl border border-surface-border bg-surface p-6 shadow-xs space-y-5">
        <div className="flex items-center space-x-3 border-b border-surface-border pb-4">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl font-bold text-white shadow-md"
            style={{ backgroundColor: selectedColor }}
          >
            <Folder className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-text-primary font-heading">Thông tin chung về Dự án</h2>
            <p className="text-[11px] text-text-muted">Tên dự án, mã định danh Key và mô tả phạm vi thực thi</p>
          </div>
        </div>

        {successMsg && (
          <div className="flex items-center space-x-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-500 font-semibold">
            <Check className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="rounded-xl border border-status-error/30 bg-status-error/10 p-3 text-xs text-status-error">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-text-secondary">
                {t('nameLabel', { defaultValue: 'Tên dự án' })} <span className="text-red-500">*</span>
              </label>
              <input
                {...register('name')}
                type="text"
                className="w-full rounded-xl border border-surface-border bg-surface-alt p-2.5 text-xs text-text-primary placeholder:text-text-muted transition focus:border-primary focus:outline-none"
              />
              {errors.name && <p className="text-[11px] text-status-error">{errors.name.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary">
                {t('keyLabel', { defaultValue: 'Mã viết tắt (Key)' })}
              </label>
              <input
                {...register('key')}
                type="text"
                maxLength={6}
                className="w-full rounded-xl border border-surface-border bg-surface-alt p-2.5 text-xs font-bold text-primary uppercase placeholder:text-text-muted transition focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary">
              {t('descriptionLabel', { defaultValue: 'Mô tả dự án' })}
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full rounded-xl border border-surface-border bg-surface-alt p-2.5 text-xs text-text-primary placeholder:text-text-muted transition focus:border-primary focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary">
              {t('colorLabel', { defaultValue: 'Màu sắc đại diện' })}
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

          <div className="pt-2">
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="flex w-full items-center justify-center space-x-1.5 rounded-xl bg-primary py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-primary-hover active:scale-95 disabled:opacity-50"
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

      {/* Quick Actions Card */}
      <div className="rounded-2xl border border-surface-border bg-surface p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-text-primary font-heading border-b border-surface-border pb-3">Thao tác dự án nhanh</h2>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between border-b border-surface-border/60 pb-4">
          <div>
            <p className="text-xs font-semibold text-text-primary">Trạng thái lưu trữ (Archive)</p>
            <p className="text-[11px] text-text-muted">Lưu trữ dự án để ẩn khỏi danh sách làm việc chính</p>
          </div>
          <button
            type="button"
            onClick={() => toggleArchive.mutate(projectId)}
            className="flex items-center space-x-2 rounded-xl bg-purple-500/10 px-4 py-2 text-xs font-bold text-purple-400 border border-purple-500/30 hover:bg-purple-500/20 transition active:scale-95"
          >
            <Archive className="h-4 w-4" />
            <span>{project.isArchived ? 'Khôi phục dự án' : 'Lưu trữ dự án'}</span>
          </button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between pt-1">
          <div>
            <p className="text-xs font-semibold text-text-primary">Đánh dấu Yêu thích</p>
            <p className="text-[11px] text-text-muted">Gắn sao dự án để truy cập nhanh trên thanh điều hướng</p>
          </div>
          <button
            type="button"
            onClick={() => toggleFavorite.mutate(projectId)}
            className="flex items-center space-x-2 rounded-xl bg-amber-500/10 px-4 py-2 text-xs font-bold text-amber-500 border border-amber-500/30 hover:bg-amber-500/20 transition active:scale-95"
          >
            <Star className="h-4 w-4" />
            <span>{project.isFavorite ? 'Bỏ yêu thích' : 'Đánh dấu Yêu thích'}</span>
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-2xl border border-status-error/30 bg-status-error/5 p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-status-error flex items-center">
              <ShieldAlert className="mr-2 h-4 w-4" /> Vùng Nguy Hiểm (Danger Zone)
            </h3>
            <p className="text-xs text-text-muted">
              Xóa mềm dự án này khỏi Workspace. Các công việc thuộc dự án sẽ bị lưu trữ.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsConfirmDeleteOpen(true)}
            className="flex items-center space-x-2 rounded-xl bg-status-error/10 px-4 py-2 text-xs font-bold text-status-error border border-status-error/30 hover:bg-status-error hover:text-white transition active:scale-95"
          >
            <Trash2 className="h-4 w-4" />
            <span>Xóa Dự Án</span>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isConfirmDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-2xl border border-surface-border bg-surface p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-text-primary font-heading">Xác nhận xóa dự án</h3>
            <p className="text-xs text-text-muted">
              Bạn có chắc chắn muốn xóa dự án <span className="font-bold text-text-primary">{project.name}</span> không?
            </p>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmDeleteOpen(false)}
                className="rounded-xl border border-surface-border px-3.5 py-1.5 text-xs font-semibold text-text-secondary hover:bg-surface-alt"
              >
                {tCommon('actions.cancel', { defaultValue: 'Hủy' })}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="flex items-center rounded-xl bg-status-error px-3.5 py-1.5 text-xs font-bold text-white hover:bg-red-600 shadow-md"
              >
                {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Xóa ngay'}
              </button>
            </div>
          </div>
        </div>
      )}

      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="Cập nhật Dự án thành công!"
        description="Các thông số cài đặt của dự án đã được lưu và đồng bộ toàn hệ thống."
      />
    </div>
  );
}
