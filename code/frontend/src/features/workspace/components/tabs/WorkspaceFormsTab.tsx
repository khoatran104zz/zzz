'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Send, 
  Loader2, 
  CheckCircle2, 
  Paperclip, 
  X 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useWorkspaceStore } from '@/store/workspace-store';
import { useProjects } from '@/features/project/hooks/use-project';
import { useCreateWorkspaceTask } from '@/features/task/hooks/use-task';

interface WorkspaceFormsTabProps {
  workspaceId?: string;
}

const DEFAULT_FORM_TEMPLATES = [
  {
    id: 'feature',
    title: 'Biểu mẫu Yêu cầu Tính năng Mới (Feature Request)',
    desc: 'Thu thập thông số, mô tả sản phẩm và tiêu chí từ đối tác/khách hàng',
    type: 'FEATURE',
    priority: 'MEDIUM',
    fieldsCount: 5,
  },
  {
    id: 'bug',
    title: 'Biểu mẫu Báo Lỗi Kỹ thuật (Bug Report)',
    desc: 'Thu thập các bước tái hiện lỗi, thiết bị và mức độ ảnh hưởng của sự cố',
    type: 'BUG',
    priority: 'HIGH',
    fieldsCount: 6,
  },
  {
    id: 'support',
    title: 'Biểu mẫu Yêu cầu Hỗ trợ Kỹ thuật (Technical Support)',
    desc: 'Tiếp nhận các câu hỏi, sự cố vận hành và phản hồi từ hệ thống',
    type: 'SUPPORT',
    priority: 'MEDIUM',
    fieldsCount: 4,
  },
  {
    id: 'task',
    title: 'Biểu mẫu Đề xuất Công việc Tùy chỉnh (Custom Work Proposal)',
    desc: 'Khởi tạo công việc mới trực tiếp từ form khảo sát người dùng',
    type: 'TASK',
    priority: 'LOW',
    fieldsCount: 5,
  },
];

export function WorkspaceFormsTab({ workspaceId }: WorkspaceFormsTabProps) {
  const { t } = useTranslation('workspace');
  const { t: tCommon } = useTranslation('common');
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace);
  const targetWorkspaceId = workspaceId || activeWorkspace?.id || '';

  const { data: projects = [] } = useProjects(targetWorkspaceId || null);

  const [activeFormTemplate, setActiveFormTemplate] = useState<typeof DEFAULT_FORM_TEMPLATES[0] | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // Form State
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [requestTitle, setRequestTitle] = useState('');
  const [requestType, setRequestType] = useState('FEATURE');
  const [requesterName, setRequesterName] = useState('');
  const [requesterEmail, setRequesterEmail] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [details, setDetails] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const createTaskMutation = useCreateWorkspaceTask(targetWorkspaceId);

  const handleOpenForm = (tmpl: typeof DEFAULT_FORM_TEMPLATES[0]) => {
    setActiveFormTemplate(tmpl);
    setRequestTitle(tmpl.title);
    setRequestType(tmpl.type);
    setPriority(tmpl.priority as any);
    if (projects.length > 0) {
      setSelectedProjectId(projects[0].id);
    }
    setIsSubmitModalOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestTitle.trim() || !targetWorkspaceId) return;

    const fullDescription = `[Biểu mẫu Yêu cầu - ${requestType}]
Người gửi: ${requesterName || 'Khách hàng'} (${requesterEmail || 'Chưa cung cấp email'})
Dự án áp dụng: ${projects.find((p) => p.id === selectedProjectId)?.name || 'Dùng chung Workspace'}
Đính kèm: ${attachmentName || 'Không có'}

Chi tiết nội dung yêu cầu:
${details || 'Không có mô tả chi tiết'}`;

    createTaskMutation.mutate(
      {
        title: `[Form] ${requestTitle.trim()}`,
        description: fullDescription,
        status: 'TODO',
        priority: priority,
        projectId: selectedProjectId || undefined,
      },
      {
        onSuccess: () => {
          setSubmitSuccess(true);
          toast.success('Đã tự động chuyển đổi biểu mẫu thành Task trong Backlog!');
          setTimeout(() => {
            setSubmitSuccess(false);
            setIsSubmitModalOpen(false);
            setRequestTitle('');
            setDetails('');
            setRequesterName('');
            setRequesterEmail('');
            setAttachmentName('');
          }, 1800);
        },
        onError: () => {
          toast.error('Không thể gửi biểu mẫu, vui lòng thử lại.');
        },
      }
    );
  };

  return (
    <div className="space-y-6 text-text-primary">
      {/* Header Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-surface-border pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-text-primary font-heading flex items-center space-x-2">
            <span>{t('forms.title', { defaultValue: 'Biểu mẫu thu thập yêu cầu' })}</span>
            {activeWorkspace && (
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary border border-primary/20">
                {activeWorkspace.name}
              </span>
            )}
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            {t('forms.subtitle', { defaultValue: 'Tự động chuyển đổi thông tin yêu cầu từ người dùng/đối tác thành công việc trong danh sách Backlog' })}
          </p>
        </div>

        <button
          onClick={() => handleOpenForm(DEFAULT_FORM_TEMPLATES[0])}
          className="flex items-center space-x-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-primary-hover active:scale-95 transition cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>{t('forms.createForm', { defaultValue: 'Tạo biểu mẫu mới' })}</span>
        </button>
      </div>

      {/* Overview Stat Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-surface-border bg-surface p-4 space-y-1 shadow-xs">
          <p className="text-[11px] text-text-muted font-medium">Mẫu biểu mẫu sẵn có</p>
          <p className="text-lg font-extrabold text-text-primary font-heading">
            {DEFAULT_FORM_TEMPLATES.length} Mẫu hoạt động
          </p>
        </div>

        <div className="rounded-2xl border border-surface-border bg-surface p-4 space-y-1 shadow-xs">
          <p className="text-[11px] text-text-muted font-medium">Dự án tiếp nhận yêu cầu</p>
          <p className="text-lg font-extrabold text-primary font-heading">
            {projects.length} Dự án khả dụng
          </p>
        </div>

        <div className="rounded-2xl border border-surface-border bg-surface p-4 space-y-1 shadow-xs">
          <p className="text-[11px] text-text-muted font-medium">Quy trình tự động hóa</p>
          <p className="text-lg font-extrabold text-emerald-500 font-heading">
            Chuyển thành Task 100%
          </p>
        </div>
      </div>

      {/* Form Template List Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">
          Danh sách Mẫu biểu mẫu thu thập dữ liệu
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          {DEFAULT_FORM_TEMPLATES.map((tmpl) => (
            <div
              key={tmpl.id}
              onClick={() => handleOpenForm(tmpl)}
              className="group cursor-pointer rounded-2xl border border-surface-border bg-surface p-5 hover:border-primary/50 hover:shadow-md transition-all space-y-3 shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <span className="rounded-lg bg-surface-alt px-2.5 py-1 text-[10px] font-bold text-text-secondary border border-surface-border">
                    {tmpl.fieldsCount} trường dữ liệu
                  </span>
                </div>

                <h4 className="text-sm font-bold text-text-primary font-heading group-hover:text-primary transition">
                  {tmpl.title}
                </h4>
                <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
                  {tmpl.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-surface-border/60 text-xs font-bold text-primary flex items-center justify-between">
                <span className="text-[11px] text-text-muted font-medium">Click để mở Form điền thông tin</span>
                <span className="group-hover:translate-x-0.5 transition-transform">Sử dụng Form →</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submit Work Request Form Modal */}
      {isSubmitModalOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsSubmitModalOpen(false)}
        >
          <div
            className="relative my-auto w-full max-w-lg rounded-2xl border border-surface-border bg-surface p-6 shadow-2xl space-y-4 text-text-primary max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-surface-border pb-4">
              <div className="flex items-center space-x-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-primary font-heading">
                    {activeFormTemplate ? activeFormTemplate.title : 'Điền biểu mẫu gửi yêu cầu công việc'}
                  </h3>
                  <p className="text-[11px] text-text-secondary">
                    Thông tin sẽ được tự động lưu và khởi tạo thành Task trong Backlog
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className="rounded-lg p-1.5 text-text-muted hover:bg-surface-alt hover:text-text-primary transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {submitSuccess ? (
              <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
                <CheckCircle2 className="h-12 w-12 text-emerald-500 animate-bounce" />
                <h4 className="text-base font-bold text-text-primary font-heading">Gửi biểu mẫu thành công!</h4>
                <p className="text-xs text-text-secondary max-w-xs">
                  Yêu cầu đã được chuyển đổi thành công việc mới và cập nhật trực tiếp vào danh sách đọng Backlog.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
                {/* Project Selection */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-text-secondary">
                    Dự án tiếp nhận công việc *
                  </label>
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    required
                    className="w-full rounded-xl border border-surface-border bg-surface-alt p-2.5 text-xs font-bold text-primary focus:border-primary focus:outline-none cursor-pointer"
                  >
                    <option value="">-- Chọn dự án trong Workspace --</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id} className="bg-surface text-text-primary font-medium">
                        {p.name} {p.key ? `#${p.key}` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Title */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-text-secondary">Tiêu đề yêu cầu / công việc *</label>
                  <input
                    type="text"
                    required
                    value={requestTitle}
                    onChange={(e) => setRequestTitle(e.target.value)}
                    placeholder="Ví dụ: Tích hợp cổng thanh toán VNPay cho ứng dụng Web"
                    className="w-full rounded-xl border border-surface-border bg-surface-alt p-2.5 text-xs text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
                  />
                </div>

                {/* Requester Info */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-text-secondary">Tên người yêu cầu</label>
                    <input
                      type="text"
                      value={requesterName}
                      onChange={(e) => setRequesterName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className="w-full rounded-xl border border-surface-border bg-surface-alt p-2.5 text-xs text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-text-secondary">Email liên hệ</label>
                    <input
                      type="email"
                      value={requesterEmail}
                      onChange={(e) => setRequesterEmail(e.target.value)}
                      placeholder="nguyenvana@example.com"
                      className="w-full rounded-xl border border-surface-border bg-surface-alt p-2.5 text-xs text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                {/* Type & Priority */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-text-secondary">Phân loại yêu cầu</label>
                    <select
                      value={requestType}
                      onChange={(e) => setRequestType(e.target.value)}
                      className="w-full rounded-xl border border-surface-border bg-surface-alt p-2.5 text-xs font-semibold text-text-primary focus:border-primary focus:outline-none cursor-pointer"
                    >
                      <option value="FEATURE">Yêu cầu Tính năng Mới</option>
                      <option value="BUG">Báo Lỗi Kỹ Thuật (Bug)</option>
                      <option value="SUPPORT">Yêu cầu Hỗ trợ Kỹ thuật</option>
                      <option value="TASK">Đề xuất Công việc Tùy chỉnh</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-text-secondary">Mức độ khẩn cấp</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as any)}
                      className="w-full rounded-xl border border-surface-border bg-surface-alt p-2.5 text-xs font-semibold text-text-primary focus:border-primary focus:outline-none cursor-pointer"
                    >
                      <option value="LOW">Thấp (Low)</option>
                      <option value="MEDIUM">Trung bình (Medium)</option>
                      <option value="HIGH">Cao (High)</option>
                      <option value="URGENT">Khẩn cấp (Urgent)</option>
                    </select>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-text-secondary">Nội dung chi tiết & tiêu chí nghiệm thu</label>
                  <textarea
                    rows={4}
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Mô tả cụ thể các yêu cầu, các bước tái hiện sự cố hoặc tài liệu tham khảo..."
                    className="w-full rounded-xl border border-surface-border bg-surface-alt p-2.5 text-xs text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
                  />
                </div>

                {/* File Attachment Input */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-text-secondary">Tệp tin đính kèm (nếu có)</label>
                  <div className="flex items-center space-x-2">
                    <label className="flex items-center space-x-1.5 rounded-xl border border-surface-border bg-surface-alt px-3 py-2 text-xs font-medium text-text-secondary hover:bg-surface-border transition cursor-pointer">
                      <Paperclip className="h-3.5 w-3.5 text-primary" />
                      <span>Chọn tệp tin...</span>
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setAttachmentName(e.target.files[0].name);
                          }
                        }}
                      />
                    </label>
                    {attachmentName && (
                      <span className="text-xs text-primary font-semibold truncate max-w-[200px]">
                        📎 {attachmentName}
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end space-x-2 border-t border-surface-border pt-4">
                  <button
                    type="button"
                    onClick={() => setIsSubmitModalOpen(false)}
                    className="rounded-xl border border-surface-border px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-surface-alt transition cursor-pointer"
                  >
                    {tCommon('actions.cancel', { defaultValue: 'Hủy' })}
                  </button>
                  <button
                    type="submit"
                    disabled={createTaskMutation.isPending || !requestTitle.trim() || !selectedProjectId}
                    className="flex items-center space-x-1.5 rounded-xl bg-primary px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-primary-hover transition active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {createTaskMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>{t('forms.submitForm', { defaultValue: 'Gửi biểu mẫu ngay' })}</span>
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
