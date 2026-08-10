'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Loader2, Lock, User, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useChangePassword, useUpdateProfile } from '@/features/auth/hooks/use-auth';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Họ và tên phải có ít nhất 2 ký tự'),
  avatarUrl: z.string().url('Định dạng URL không hợp lệ').or(z.literal('')),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Mật khẩu hiện tại không được để trống'),
    newPassword: z.string().min(8, 'Mật khẩu mới phải dài ít nhất 8 ký tự'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp với mật khẩu mới',
    path: ['confirmPassword'],
  });

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();

  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);
  const [profileErrorMsg, setProfileErrorMsg] = useState<string | null>(null);

  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState<string | null>(null);
  const [passwordErrorMsg, setPasswordErrorMsg] = useState<string | null>(null);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || '',
      avatarUrl: user?.avatarUrl || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileSubmit = (data: ProfileFormData) => {
    setProfileSuccessMsg(null);
    setProfileErrorMsg(null);
    updateProfileMutation.mutate(
      {
        fullName: data.fullName,
        avatarUrl: data.avatarUrl || undefined,
      },
      {
        onSuccess: () => {
          setProfileSuccessMsg('Cập nhật hồ sơ cá nhân thành công!');
          setTimeout(() => setProfileSuccessMsg(null), 3000);
        },
        onError: (err: any) => {
          setProfileErrorMsg(err.response?.data?.message || 'Không thể cập nhật hồ sơ cá nhân.');
        },
      }
    );
  };

  const onPasswordSubmit = (data: PasswordFormData) => {
    setPasswordSuccessMsg(null);
    setPasswordErrorMsg(null);
    changePasswordMutation.mutate(
      {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      },
      {
        onSuccess: () => {
          setPasswordSuccessMsg('Đổi mật khẩu thành công!');
          resetPasswordForm();
          setTimeout(() => setPasswordSuccessMsg(null), 3000);
        },
        onError: (err: any) => {
          setPasswordErrorMsg(err.response?.data?.message || 'Mật khẩu hiện tại không đúng hoặc đã xảy ra lỗi.');
        },
      }
    );
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6 text-text-primary">
      <div className="border-b border-surface-border pb-4">
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-text-primary font-heading">
          Hồ sơ & Tài khoản
        </h1>
        <p className="text-xs text-text-secondary mt-1">Quản lý thông tin hồ sơ cá nhân và bảo mật mật khẩu truy cập</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Details Card */}
        <div className="rounded-2xl border border-surface-border bg-surface p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-3 border-b border-surface-border pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-text-primary font-heading">Thông tin cá nhân</h2>
              <p className="text-[11px] text-text-secondary">Cập nhật họ tên hiển thị và ảnh đại diện</p>
            </div>
          </div>

          {profileSuccessMsg && (
            <div className="flex items-center space-x-2 rounded-xl bg-emerald-500/10 p-3 text-xs text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Check className="h-4 w-4" />
              <span>{profileSuccessMsg}</span>
            </div>
          )}

          {profileErrorMsg && (
            <div className="rounded-xl bg-status-error/10 p-3 text-xs text-status-error border border-status-error/20">
              {profileErrorMsg}
            </div>
          )}

          <form onSubmit={handleSubmitProfile(onProfileSubmit)} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary">Địa chỉ Email (Chỉ đọc)</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full cursor-not-allowed rounded-xl border border-surface-border bg-surface-alt p-2.5 text-xs text-text-muted font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary">Họ và tên *</label>
              <input
                {...registerProfile('fullName')}
                type="text"
                className="w-full rounded-xl border border-surface-border bg-surface-alt p-2.5 text-xs text-text-primary transition focus:border-primary focus:outline-none"
              />
              {profileErrors.fullName && (
                <p className="text-[11px] text-status-error">{profileErrors.fullName.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary">Đường dẫn ảnh đại diện (URL)</label>
              <input
                {...registerProfile('avatarUrl')}
                type="text"
                placeholder="https://example.com/avatar.jpg"
                className="w-full rounded-xl border border-surface-border bg-surface-alt p-2.5 text-xs text-text-primary transition focus:border-primary focus:outline-none"
              />
              {profileErrors.avatarUrl && (
                <p className="text-[11px] text-status-error">{profileErrors.avatarUrl.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="flex w-full items-center justify-center rounded-xl bg-primary py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-primary-hover active:scale-95 disabled:opacity-50"
            >
              {updateProfileMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Lưu thay đổi hồ sơ'
              )}
            </button>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="rounded-2xl border border-surface-border bg-surface p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-3 border-b border-surface-border pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-text-primary font-heading">Đổi mật khẩu truy cập</h2>
              <p className="text-[11px] text-text-secondary">Cập nhật mật khẩu bảo vệ tài khoản</p>
            </div>
          </div>

          {passwordSuccessMsg && (
            <div className="flex items-center space-x-2 rounded-xl bg-emerald-500/10 p-3 text-xs text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Check className="h-4 w-4" />
              <span>{passwordSuccessMsg}</span>
            </div>
          )}

          {passwordErrorMsg && (
            <div className="rounded-xl bg-status-error/10 p-3 text-xs text-status-error border border-status-error/20">
              {passwordErrorMsg}
            </div>
          )}

          <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary">Mật khẩu hiện tại *</label>
              <input
                {...registerPassword('currentPassword')}
                type="password"
                className="w-full rounded-xl border border-surface-border bg-surface-alt p-2.5 text-xs text-text-primary transition focus:border-primary focus:outline-none"
              />
              {passwordErrors.currentPassword && (
                <p className="text-[11px] text-status-error">{passwordErrors.currentPassword.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary">Mật khẩu mới *</label>
              <input
                {...registerPassword('newPassword')}
                type="password"
                className="w-full rounded-xl border border-surface-border bg-surface-alt p-2.5 text-xs text-text-primary transition focus:border-primary focus:outline-none"
              />
              {passwordErrors.newPassword && (
                <p className="text-[11px] text-status-error">{passwordErrors.newPassword.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary">Xác nhận mật khẩu mới *</label>
              <input
                {...registerPassword('confirmPassword')}
                type="password"
                className="w-full rounded-xl border border-surface-border bg-surface-alt p-2.5 text-xs text-text-primary transition focus:border-primary focus:outline-none"
              />
              {passwordErrors.confirmPassword && (
                <p className="text-[11px] text-status-error">{passwordErrors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={changePasswordMutation.isPending}
              className="flex w-full items-center justify-center rounded-xl bg-purple-600 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-purple-700 active:scale-95 disabled:opacity-50"
            >
              {changePasswordMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Cập nhật mật khẩu'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
