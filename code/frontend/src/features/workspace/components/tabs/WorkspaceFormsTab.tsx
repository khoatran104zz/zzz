'use client';

import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Plus, 
  ArrowRight, 
  CheckCircle, 
  Send, 
  Loader2, 
  Sparkles, 
  CheckCircle2, 
  HelpCircle,
  FormInput
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useWorkspaceStore } from '@/store/workspace-store';
import { useCreateWorkspaceTask } from '@/features/task/hooks/use-task';

interface WorkspaceFormsTabProps {
  workspaceId?: string;
}

export function WorkspaceFormsTab({ workspaceId }: WorkspaceFormsTabProps) {
  const { t } = useTranslation('workspace');
  const { t: tCommon } = useTranslation('common');
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace);
  const targetWorkspaceId = workspaceId || activeWorkspace?.id || '';

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [requestTitle, setRequestTitle] = useState('');
  const [requestType, setRequestType] = useState('FEATURE');
  const [requesterName, setRequesterName] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [details, setDetails] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const createTaskMutation = useCreateWorkspaceTask(targetWorkspaceId);

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestTitle.trim() || !targetWorkspaceId) return;

    const fullDescription = `[Form Request - ${requestType}]\nFrom: ${requesterName || 'Anonymous'}\n\nDetails:\n${details}`;

    createTaskMutation.mutate(
      {
        title: `[Form] ${requestTitle}`,
        description: fullDescription,
        status: 'TODO',
        priority: priority,
      },
      {
        onSuccess: () => {
          setSubmitSuccess(true);
          setRequestTitle('');
          setDetails('');
          setRequesterName('');
          setTimeout(() => {
            setSubmitSuccess(false);
            setShowSubmitModal(false);
          }, 2000);
        },
      }
    );
  };

  return (
    <div className="space-y-8 py-4 text-text-primary max-w-4xl mx-auto pb-12">
      {/* Title & Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary border border-primary/20">
          <FormInput className="h-4 w-4" />
          <span>Biểu mẫu thu thập yêu cầu</span>
        </div>
        <h2 className="text-xl font-extrabold tracking-tight font-heading text-text-primary sm:text-2xl">
          {t('forms.title', { defaultValue: 'Giải pháp thu thập và theo dõi yêu cầu công việc' })}
        </h2>
        <p className="text-xs text-text-secondary max-w-xl mx-auto sm:text-sm leading-relaxed">
          {t('forms.subtitle', { defaultValue: 'Sử dụng biểu mẫu để chuyển đổi yêu cầu từ đối tác/khách hàng thành công việc.' })}
        </p>
      </div>

      {/* Hero Visual Workflow Card */}
      <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 p-6 sm:p-8 rounded-2xl border border-surface-border bg-surface shadow-sm">
        {/* Left Form Box */}
        <div className="w-full md:w-1/2 rounded-xl border border-surface-border bg-surface-alt/60 p-4 shadow-sm text-left space-y-3">
          <div className="flex items-center justify-between border-b border-surface-border pb-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-text-primary">
              <FileSpreadsheet className="h-4 w-4 text-primary" />
              <span>{t('forms.submitForm', { defaultValue: 'Gửi biểu mẫu yêu cầu' })}</span>
            </div>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold text-primary">Active Form</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="rounded-lg border border-surface-border bg-surface p-2 text-text-secondary truncate">
              📌 Tên yêu cầu: Cần tích hợp thanh toán VnPay
            </div>
            <div className="rounded-lg border border-surface-border bg-surface p-2 text-text-secondary truncate">
              👤 Người gửi: Partner Client A (marketing@client.com)
            </div>
            <div className="flex justify-between items-center text-[10px] text-text-muted pt-1">
              <span>Độ ưu tiên: Cao</span>
              <span className="font-bold text-primary">Ready to submit</span>
            </div>
          </div>
        </div>

        <ArrowRight className="h-6 w-6 text-primary shrink-0 hidden md:block" />

        {/* Right Track Requests Box */}
        <div className="w-full md:w-1/2 rounded-xl border border-surface-border bg-surface-alt/60 p-4 shadow-sm text-left space-y-3">
          <div className="flex items-center justify-between border-b border-surface-border pb-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-text-primary">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              <span>{t('forms.trackRequests', { defaultValue: 'Tự động tạo Task trong Backlog' })}</span>
            </div>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-500">Auto Sync</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-lg bg-surface p-2 text-[11px] border border-surface-border">
              <span className="font-medium text-text-primary truncate">Tích hợp thanh toán VnPay</span>
              <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[9px] font-bold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                To Do
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Bullet Points */}
      <div className="grid gap-6 sm:grid-cols-2 text-left">
        <div className="flex items-start space-x-3 rounded-xl border border-surface-border bg-surface p-4 shadow-xs">
          <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-text-primary">{t('forms.captureDetails', { defaultValue: 'Thu thập chi tiết' })}</h4>
            <p className="text-[11px] text-text-muted mt-1">{t('forms.captureDesc', { defaultValue: 'Thu thập đầy đủ thông tin và yêu cầu trực tiếp từ người dùng.' })}</p>
          </div>
        </div>

        <div className="flex items-start space-x-3 rounded-xl border border-surface-border bg-surface p-4 shadow-xs">
          <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-text-primary">{t('forms.prioritizeWork', { defaultValue: 'Ưu tiên xử lý' })}</h4>
            <p className="text-[11px] text-text-muted mt-1">{t('forms.prioritizeDesc', { defaultValue: 'Tự động chuyển đổi yêu cầu thành công việc trong danh sách đọng.' })}</p>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-center pt-2">
        <button
          onClick={() => setShowSubmitModal(true)}
          className="flex items-center space-x-2 rounded-xl bg-primary px-6 py-3 text-xs font-bold text-white shadow-lg hover:bg-primary-hover active:scale-95 transition"
        >
          <Send className="h-4 w-4" />
          <span>{t('forms.submitForm', { defaultValue: 'Mở Form Gửi Yêu Cầu Mới' })}</span>
        </button>
      </div>

      {/* Modal Submit Work Request Form */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative my-auto w-full max-w-md rounded-2xl border border-surface-border bg-surface p-6 shadow-2xl space-y-4 text-text-primary">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-bold font-heading text-text-primary">Gửi Yêu Cầu Công Việc Mới</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="rounded-lg p-1 text-text-muted hover:bg-surface-alt transition"
              >
                ✕
              </button>
            </div>

            {submitSuccess ? (
              <div className="flex flex-col items-center justify-center py-6 text-center space-y-2">
                <CheckCircle2 className="h-12 w-12 text-status-success animate-bounce" />
                <h4 className="text-sm font-bold text-text-primary">Gửi Yêu Cầu Thành Công!</h4>
                <p className="text-xs text-text-muted">Yêu cầu của bạn đã được tự động thêm vào Backlog của Workspace.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitForm} className="space-y-3.5 text-xs text-left">
                <div className="space-y-1">
                  <label className="font-semibold text-text-secondary">Tiêu đề yêu cầu *</label>
                  <input
                    type="text"
                    required
                    value={requestTitle}
                    onChange={(e) => setRequestTitle(e.target.value)}
                    placeholder="Ví dụ: Bổ sung tính năng Xuất báo cáo PDF"
                    className="w-full rounded-xl border border-surface-border bg-surface-alt p-2.5 text-xs focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-text-secondary">Họ tên người gửi</label>
                    <input
                      type="text"
                      value={requesterName}
                      onChange={(e) => setRequesterName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className="w-full rounded-xl border border-surface-border bg-surface-alt p-2 text-xs focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-text-secondary">Mức độ ưu tiên</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as any)}
                      className="w-full rounded-xl border border-surface-border bg-surface-alt p-2 text-xs focus:border-primary focus:outline-none"
                    >
                      <option value="LOW">Thấp</option>
                      <option value="MEDIUM">Trung bình</option>
                      <option value="HIGH">Cao</option>
                      <option value="URGENT">Khẩn cấp</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-text-secondary">Chi tiết yêu cầu & thông số</label>
                  <textarea
                    rows={3}
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Nhập nội dung yêu cầu cụ thể..."
                    className="w-full rounded-xl border border-surface-border bg-surface-alt p-2.5 text-xs focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="flex justify-end space-x-2 border-t border-surface-border pt-3">
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(false)}
                    className="rounded-xl border border-surface-border px-4 py-2 text-xs font-medium text-text-secondary hover:bg-surface-alt transition"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={createTaskMutation.isPending}
                    className="flex items-center space-x-1.5 rounded-xl bg-primary px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary-hover transition disabled:opacity-50"
                  >
                    {createTaskMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        <span>Gửi yêu cầu ngay</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
