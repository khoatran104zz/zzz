'use client';

import React, { useState } from 'react';
import { 
  Eye, 
  Edit3, 
  Save, 
  History, 
  Trash2, 
  FileText, 
  Loader2, 
  Building2, 
  Folder, 
  User, 
  Clock, 
  ShieldCheck,
  BookOpen
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { WikiPageDto, UpdateWikiPagePayload } from '../types';
import { ConfirmDeleteModal } from '@/components/confirm-delete-modal';
import { useWorkspaceStore } from '@/store/workspace-store';
import { useAuthStore } from '@/store/auth-store';
import { useProjects } from '@/features/project/hooks/use-project';

interface WikiEditorProps {
  page: WikiPageDto;
  onSave: (payload: UpdateWikiPagePayload) => void;
  onDelete: (pageId: string) => void;
  onOpenVersions: () => void;
  isSaving?: boolean;
}

export function WikiEditor({
  page,
  onSave,
  onDelete,
  onOpenVersions,
  isSaving,
}: WikiEditorProps) {
  const { t } = useTranslation('wiki');
  const { t: tCommon } = useTranslation('common');
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace);
  const currentUser = useAuthStore((state) => state.user);

  const formatCreatorName = (createdBy?: string) => {
    if (!createdBy) return currentUser?.fullName || currentUser?.username || 'Bạn (Quản lý hệ thống)';
    // Check if UUID pattern or mock UUID
    const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(createdBy) || createdBy.includes('-0000-');
    if (isUuid) {
      if (currentUser && (currentUser.id === createdBy || createdBy.startsWith('a1000000'))) {
        return currentUser.fullName || currentUser.username || 'Bạn (Quản lý hệ thống)';
      }
      return 'Quản trị viên hệ thống';
    }
    return createdBy;
  };

  const [title, setTitle] = useState(page.title);
  const [content, setContent] = useState(page.content || '');
  const [changeSummary, setChangeSummary] = useState('');
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const { data: projects = [] } = useProjects(page.workspaceId || activeWorkspace?.id || null);
  const matchedProject = projects.find((p) => p.id === page.projectId);

  React.useEffect(() => {
    setTitle(page.title);
    setContent(page.content || '');
  }, [page]);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      content,
      changeSummary: changeSummary.trim() || 'Cập nhật nội dung',
    });
    setChangeSummary('');
  };

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const charCount = content.length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="flex-1 space-y-4 rounded-2xl border border-surface-border bg-surface p-6 shadow-xs">
      {/* Editor Header Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between border-b border-surface-border pb-4">
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          <BookOpen className="h-5 w-5 shrink-0 text-primary" />
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('pageTitlePlaceholder', { defaultValue: 'Nhập tiêu đề trang tài liệu...' })}
            className="bg-transparent text-lg font-extrabold text-text-primary font-heading focus:outline-none placeholder-text-muted w-full"
          />
        </div>

        <div className="flex items-center space-x-2 shrink-0 flex-wrap gap-y-1">
          {/* Edit / Preview Toggle */}
          <div className="flex items-center rounded-xl border border-surface-border bg-surface-alt p-1">
            <button
              onClick={() => setMode('edit')}
              className={`flex items-center space-x-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                mode === 'edit' ? 'bg-primary text-white shadow-xs' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Chỉnh sửa</span>
            </button>
            <button
              onClick={() => setMode('preview')}
              className={`flex items-center space-x-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                mode === 'preview' ? 'bg-primary text-white shadow-xs' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Xem trước</span>
            </button>
          </div>

          {/* Version Button */}
          <button
            onClick={onOpenVersions}
            className="flex items-center space-x-1 rounded-xl border border-surface-border bg-surface-alt px-3 py-1.5 text-xs font-semibold text-text-secondary hover:bg-surface-alt/80 hover:text-text-primary transition"
            title="Lịch sử phiên bản"
          >
            <History className="h-3.5 w-3.5 text-primary" />
            <span>v{page.version}</span>
          </button>

          {/* Delete Button */}
          <button
            onClick={() => setIsDeleteOpen(true)}
            className="rounded-xl border border-status-error/30 bg-status-error/10 p-1.5 text-status-error hover:bg-status-error/20 transition"
            title="Xóa trang"
          >
            <Trash2 className="h-4 w-4" />
          </button>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving || !title.trim()}
            className="flex items-center space-x-1.5 rounded-xl bg-primary px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-primary-hover disabled:opacity-50 transition active:scale-95 cursor-pointer"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>Lưu tài liệu</span>
          </button>
        </div>
      </div>

      {/* Document Detailed Metadata & Scope Panel */}
      <div className="rounded-xl border border-surface-border bg-surface-alt/60 p-4 text-xs text-text-secondary space-y-3">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Workspace Info */}
          <div className="flex items-center space-x-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
              <Building2 className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-text-muted font-medium">Workspace (Không gian)</p>
              <p className="font-bold text-text-primary truncate">
                {activeWorkspace?.name || 'Workspace làm việc'}
              </p>
            </div>
          </div>

          {/* Project Info */}
          <div className="flex items-center space-x-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
              <Folder className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-text-muted font-medium">Dự án áp dụng</p>
              <p className="font-bold text-primary truncate">
                {matchedProject ? `${matchedProject.name} #${matchedProject.key || 'PRJ'}` : 'Tài liệu dùng chung'}
              </p>
            </div>
          </div>

          {/* Creator Info */}
          <div className="flex items-center space-x-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
              <User className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-text-muted font-medium">Người khởi tạo</p>
              <p className="font-bold text-text-primary truncate">
                {formatCreatorName(page.createdBy)}
              </p>
            </div>
          </div>

          {/* Reading Time & Word Count */}
          <div className="flex items-center space-x-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
              <Clock className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-text-muted font-medium">Độ dài & Thời gian đọc</p>
              <p className="font-bold text-text-primary truncate">
                ~{readingTime} phút đọc ({wordCount} từ)
              </p>
            </div>
          </div>
        </div>

        {/* Footer Meta Row */}
        <div className="flex items-center justify-between border-t border-surface-border/60 pt-2.5 text-[11px] text-text-muted font-medium">
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span>Quyền xem: Thành viên thuộc Dự án</span>
            </span>
            <span>•</span>
            <span>Phiên bản phát hành: <strong className="text-primary font-bold">v{page.version}.0</strong></span>
          </div>

          <div>
            Cập nhật lần cuối: {page.updatedAt ? new Date(page.updatedAt).toLocaleString('vi-VN') : 'Vừa cập nhật'}
          </div>
        </div>
      </div>

      {/* Editor / Preview Area */}
      {mode === 'edit' ? (
        <div className="space-y-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Viết nội dung tài liệu tri thức bằng Markdown tại đây..."
            className="min-h-[400px] w-full resize-y rounded-xl border border-surface-border bg-surface-alt p-4 text-xs font-mono text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none transition"
          />

          {/* Editor Status Bar */}
          <div className="flex items-center justify-between">
            <input
              type="text"
              value={changeSummary}
              onChange={(e) => setChangeSummary(e.target.value)}
              placeholder="Ghi chú tóm tắt lý do cập nhật phiên bản..."
              className="flex-1 mr-4 rounded-xl border border-surface-border bg-surface-alt px-3.5 py-2 text-xs text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none transition"
            />
            <div className="text-[11px] text-text-muted font-medium shrink-0">
              {wordCount} từ · {charCount} ký tự
            </div>
          </div>
        </div>
      ) : (
        <div className="min-h-[400px] rounded-xl border border-surface-border bg-surface-alt p-6 text-sm text-text-primary whitespace-pre-wrap font-sans leading-relaxed">
          {content || (
            <span className="text-text-muted italic">Không có nội dung để xem trước. Hãy nhập tài liệu ở chế độ Chỉnh sửa.</span>
          )}
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => {
          setIsDeleteOpen(false);
          onDelete(page.id);
        }}
        itemName={page.title}
        title="Xóa tài liệu"
        description="Tài liệu và toàn bộ nội dung lịch sử phiên bản sẽ bị xóa vĩnh viễn khỏi dự án."
        confirmLabel="Xóa tài liệu"
      />
    </div>
  );
}
