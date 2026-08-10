'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, UserPlus, Mail, Lock, UserCheck, Shield, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { adminService, type CreateUserPayload } from '../services/admin-service';
import { toast } from 'sonner';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateUserModal({ isOpen, onClose, onSuccess }: CreateUserModalProps) {
  const [mounted, setMounted] = useState(false);
  const { t: tTeam } = useTranslation('team');
  const { t: tCommon } = useTranslation('common');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'ROLE_STAFF' | 'ROLE_MANAGER' | 'ROLE_ADMIN'>('ROLE_STAFF');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password) return;

    if (password.length < 6) {
      toast.error(tTeam('createUserModal.passwordMinError', { defaultValue: 'Mật khẩu phải từ 6 ký tự trở lên' }));
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateUserPayload = {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
      };

      await adminService.createUser(payload);
      toast.success(tTeam('createUserModal.success', { email: email.trim().toLowerCase(), defaultValue: `Đã tạo tài khoản thành công cho ${email}` }));
      
      // Reset form
      setFullName('');
      setEmail('');
      setPassword('');
      setRole('ROLE_STAFF');

      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      const msg = error.response?.data?.message || tCommon('messages.genericError', { defaultValue: 'Không thể tạo tài khoản, vui lòng thử lại.' });
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative my-auto w-full max-w-md rounded-2xl border border-surface-border bg-surface p-6 shadow-2xl space-y-4 text-text-primary max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-surface-border pb-3.5">
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-xs">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary font-heading">
                {tTeam('createUserModal.title', { defaultValue: 'Tạo tài khoản mới' })}
              </h3>
              <p className="text-[11px] text-text-muted mt-0.5">
                {tTeam('createUserModal.subtitle', { defaultValue: 'Cấp quyền hệ thống cho thành viên mới' })}
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-text-secondary font-semibold flex items-center">
              <UserCheck className="mr-1.5 h-3.5 w-3.5 text-primary" />
              <span>{tTeam('createUserModal.fullNameLabel', { defaultValue: 'Họ và tên' })} *</span>
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={tTeam('createUserModal.fullNamePlaceholder', { defaultValue: 'Ví dụ: Nguyễn Văn A...' })}
              className="w-full rounded-xl border border-surface-border bg-surface-alt px-3.5 py-2 text-xs text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition"
            />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-text-secondary font-semibold flex items-center">
              <Mail className="mr-1.5 h-3.5 w-3.5 text-blue-500" />
              <span>{tTeam('createUserModal.emailLabel', { defaultValue: 'Địa chỉ Email' })} *</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={tTeam('createUserModal.emailPlaceholder', { defaultValue: 'user@example.com' })}
              className="w-full rounded-xl border border-surface-border bg-surface-alt px-3.5 py-2 text-xs text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition"
            />
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-text-secondary font-semibold flex items-center">
              <Lock className="mr-1.5 h-3.5 w-3.5 text-amber-500" />
              <span>{tTeam('createUserModal.passwordLabel', { defaultValue: 'Mật khẩu ban đầu' })} *</span>
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={tTeam('createUserModal.passwordPlaceholder', { defaultValue: 'Tối thiểu 6 ký tự...' })}
              className="w-full rounded-xl border border-surface-border bg-surface-alt px-3.5 py-2 text-xs text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition"
            />
          </div>

          {/* System Role Selection */}
          <div className="space-y-1.5">
            <label className="text-text-secondary font-semibold flex items-center">
              <Shield className="mr-1.5 h-3.5 w-3.5 text-red-500" />
              <span>{tTeam('createUserModal.roleLabel', { defaultValue: 'Vai trò & Phân quyền' })} *</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRole('ROLE_STAFF')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition ${
                  role === 'ROLE_STAFF'
                    ? 'border-emerald-500/70 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold shadow-xs'
                    : 'border-surface-border bg-surface-alt text-text-secondary hover:bg-surface'
                }`}
              >
                <span className="text-base mb-0.5">🧑‍💻</span>
                <span className="text-[11px]">Staff</span>
                <span className="text-[9px] text-text-muted">Nhân viên</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('ROLE_MANAGER')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition ${
                  role === 'ROLE_MANAGER'
                    ? 'border-amber-500/70 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold shadow-xs'
                    : 'border-surface-border bg-surface-alt text-text-secondary hover:bg-surface'
                }`}
              >
                <span className="text-base mb-0.5">👔</span>
                <span className="text-[11px]">Manager</span>
                <span className="text-[9px] text-text-muted">Quản lý</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('ROLE_ADMIN')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition ${
                  role === 'ROLE_ADMIN'
                    ? 'border-red-500/70 bg-red-500/10 text-red-600 dark:text-red-400 font-bold shadow-xs'
                    : 'border-surface-border bg-surface-alt text-text-secondary hover:bg-surface'
                }`}
              >
                <span className="text-base mb-0.5">🛡️</span>
                <span className="text-[11px]">Admin</span>
                <span className="text-[9px] text-text-muted">Quản trị viên</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-2 border-t border-surface-border pt-4 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-surface-border bg-surface-alt px-4 py-2 font-semibold text-text-secondary hover:bg-surface hover:text-text-primary transition"
            >
              {tCommon('actions.cancel', { defaultValue: 'Hủy' })}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-1.5 rounded-xl bg-primary px-4 py-2 font-semibold text-white shadow-xs hover:bg-primary-hover disabled:opacity-50 transition active:scale-95"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  <span>{tTeam('createUserModal.submit', { defaultValue: 'Xác nhận tạo' })}</span>
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
