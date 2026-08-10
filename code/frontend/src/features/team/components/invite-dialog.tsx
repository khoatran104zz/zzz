'use client';

import React, { useState } from 'react';
import { X, UserPlus, Mail, Shield, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { InviteMemberPayload, WorkspaceRole } from '../types';

interface InviteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    payload: InviteMemberPayload,
    callbacks?: { onSuccess?: () => void; onError?: (err: any) => void }
  ) => void;
  isLoading?: boolean;
}

export function InviteDialog({ isOpen, onClose, onSubmit, isLoading }: InviteDialogProps) {
  const { t } = useTranslation('team');
  const { t: tCommon } = useTranslation('common');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<WorkspaceRole>('MEMBER');

  // Feedback State: 'IDLE' | 'SUCCESS' | 'ERROR'
  const [status, setStatus] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [errorMessage, setErrorMessage] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [submittedRole, setSubmittedRole] = useState('');

  if (!isOpen) return null;

  const handleClose = () => {
    setStatus('IDLE');
    setErrorMessage('');
    setEmail('');
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = email.trim();
    if (!targetEmail) return;

    setSubmittedEmail(targetEmail);
    setSubmittedRole(role);
    setErrorMessage('');

    onSubmit(
      { email: targetEmail, role },
      {
        onSuccess: () => {
          setStatus('SUCCESS');
          setEmail('');
        },
        onError: (err: any) => {
          let msg = err.response?.data?.message || err.message;
          if (!msg) msg = 'Không thể gửi lời mời. Vui lòng kiểm tra địa chỉ Email và thử lại.';
          setErrorMessage(msg);
          setStatus('ERROR');
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl border border-surface-border bg-surface p-6 shadow-2xl text-text-primary space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-border pb-4">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <UserPlus className="h-4 w-4" />
            </div>
            <h3 className="text-base font-bold text-text-primary font-heading">
              {t('inviteModalTitle', { defaultValue: 'Mời thành viên mới' })}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-1.5 text-text-muted hover:bg-surface-alt hover:text-text-primary transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* FEEDBACK STATE: SUCCESS */}
        {status === 'SUCCESS' && (
          <div className="space-y-4 py-2 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-text-primary font-heading">
                Đã gửi lời mời tham gia!
              </h4>
              <p className="text-xs text-text-secondary leading-relaxed px-2">
                Đã gửi lời mời tới <strong className="text-primary font-semibold">{submittedEmail}</strong> với vai trò <strong className="text-text-primary">{submittedRole}</strong>.
              </p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium pt-1">
                🔔 Thông báo kèm nút Chấp nhận tham gia đã được gửi trực tiếp tới tài khoản của người dùng.
              </p>
            </div>

            <div className="border-t border-surface-border pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="w-full rounded-xl bg-primary py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary-hover transition"
              >
                Hoàn tất
              </button>
            </div>
          </div>
        )}

        {/* FEEDBACK STATE: ERROR */}
        {status === 'ERROR' && (
          <div className="space-y-4 py-2 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-status-error/10 text-status-error">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-status-error font-heading">
                Không thể thêm thành viên!
              </h4>
              <div className="rounded-xl border border-status-error/20 bg-status-error/5 p-3 text-xs text-status-error text-left">
                {errorMessage}
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 border-t border-surface-border pt-4">
              <button
                type="button"
                onClick={() => setStatus('IDLE')}
                className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-hover transition"
              >
                Thử lại
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-xl border border-surface-border bg-surface-alt px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-surface hover:text-text-primary transition"
              >
                Đóng
              </button>
            </div>
          </div>
        )}

        {/* NORMAL STATE: IDLE (FORM) */}
        {status === 'IDLE' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary">
                {t('emailLabel', { defaultValue: 'Địa chỉ Email *' })}
              </label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3.5 top-2.5 h-4 w-4 text-text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('emailPlaceholder', { defaultValue: 'nhanvien@congty.com' })}
                  required
                  className="w-full rounded-xl border border-surface-border bg-surface-alt pl-10 pr-3.5 py-2 text-xs text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary">
                {t('roleLabel', { defaultValue: 'Vai trò trong dự án' })}
              </label>
              <div className="relative mt-1.5">
                <Shield className="absolute left-3.5 top-2.5 h-4 w-4 text-text-muted" />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as WorkspaceRole)}
                  className="w-full rounded-xl border border-surface-border bg-surface-alt pl-10 pr-3.5 py-2 text-xs text-text-primary focus:border-primary focus:outline-none transition"
                >
                  <option value="MEMBER" className="bg-surface text-text-primary">
                    {t('roles.MEMBER', { defaultValue: 'Nhân viên (MEMBER)' })}
                  </option>
                  <option value="MANAGER" className="bg-surface text-text-primary">
                    {t('roles.MANAGER', { defaultValue: 'Quản lý (MANAGER)' })}
                  </option>
                  <option value="ADMIN" className="bg-surface text-text-primary">
                    {t('roles.ADMIN', { defaultValue: 'Quản trị viên (ADMIN)' })}
                  </option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end space-x-3 border-t border-surface-border pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-xl border border-surface-border bg-surface-alt px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-surface hover:text-text-primary transition"
              >
                {tCommon('actions.cancel', { defaultValue: 'Hủy' })}
              </button>
              <button
                type="submit"
                disabled={isLoading || !email.trim()}
                className="flex items-center space-x-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary-hover disabled:opacity-50 transition"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    <span>{t('actions.sendInvite', { defaultValue: 'Gửi lời mời' })}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
