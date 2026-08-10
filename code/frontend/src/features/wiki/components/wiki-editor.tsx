'use client';

import React, { useState } from 'react';
import { Eye, Edit3, Save, History, Trash2, FileText, Loader2, Paperclip, Download, ExternalLink, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { WikiPageDto, UpdateWikiPagePayload } from '../types';
import { ConfirmDeleteModal } from '@/components/confirm-delete-modal';

interface WikiEditorProps {
  page: WikiPageDto;
  onSave: (payload: UpdateWikiPagePayload) => void;
  onDelete: (pageId: string) => void;
  onOpenVersions: () => void;
  isSaving?: boolean;
}

// Simple local attachment type for wiki docs
interface WikiAttachment {
  id: string;
  name: string;
  url: string;
  size?: string;
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
  const [title, setTitle] = useState(page.title);
  const [content, setContent] = useState(page.content || '');
  const [changeSummary, setChangeSummary] = useState('');
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');

  // Attachment state
  const [attachments, setAttachments] = useState<WikiAttachment[]>([]);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  // Delete confirm modal
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

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

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    const files = Array.from(e.dataTransfer.files);
    const newAttachments: WikiAttachment[] = files.map((file) => ({
      id: `local-${Date.now()}-${file.name}`,
      name: file.name,
      url: URL.createObjectURL(file),
      size: formatFileSize(file.size),
    }));
    setAttachments((prev) => [...prev, ...newAttachments]);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newAttachments: WikiAttachment[] = files.map((file) => ({
      id: `local-${Date.now()}-${file.name}`,
      name: file.name,
      url: URL.createObjectURL(file),
      size: formatFileSize(file.size),
    }));
    setAttachments((prev) => [...prev, ...newAttachments]);
    e.target.value = '';
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const charCount = content.length;

  return (
    <div className="flex-1 space-y-4 rounded-2xl border border-surface-border bg-surface p-6 shadow-xs">
      {/* Editor Header Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between border-b border-surface-border pb-4">
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          <FileText className="h-5 w-5 shrink-0 text-primary" />
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
            className="flex items-center space-x-1.5 rounded-xl bg-primary px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-primary-hover disabled:opacity-50 transition active:scale-95"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>Lưu</span>
          </button>
        </div>
      </div>

      {/* Editor / Preview Area */}
      {mode === 'edit' ? (
        <div className="space-y-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Viết nội dung tài liệu bằng Markdown tại đây..."
            className="min-h-[400px] w-full resize-y rounded-xl border border-surface-border bg-surface-alt p-4 text-xs font-mono text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none transition"
          />

          {/* Editor Status Bar */}
          <div className="flex items-center justify-between">
            <input
              type="text"
              value={changeSummary}
              onChange={(e) => setChangeSummary(e.target.value)}
              placeholder="Tóm tắt thay đổi (tùy chọn)..."
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
            <span className="text-text-muted italic">Không có nội dung để xem trước. Hãy viết tài liệu ở chế độ Chỉnh sửa.</span>
          )}
        </div>
      )}

      {/* Attachments Section */}
      <div className="space-y-3 rounded-xl border border-surface-border bg-surface-alt/30 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Paperclip className="h-4 w-4 text-primary" />
            <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Tài liệu đính kèm ({attachments.length})
            </h4>
          </div>
          <label className="flex items-center space-x-1.5 rounded-xl border border-surface-border bg-surface px-3 py-1.5 text-xs font-semibold text-text-secondary cursor-pointer hover:bg-surface-alt hover:text-text-primary transition">
            <Paperclip className="h-3.5 w-3.5" />
            <span>Đính kèm tài liệu</span>
            <input
              type="file"
              multiple
              className="hidden"
              onChange={handleFileInput}
            />
          </label>
        </div>

        {/* Drag & Drop Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDraggingFile(true); }}
          onDragLeave={() => setIsDraggingFile(false)}
          onDrop={handleFileDrop}
          className={`rounded-xl border-2 border-dashed p-4 text-center transition ${
            isDraggingFile
              ? 'border-primary bg-primary/5 text-primary'
              : 'border-surface-border text-text-muted'
          }`}
        >
          <p className="text-xs font-medium">
            {isDraggingFile ? 'Thả tệp vào đây để đính kèm' : 'Kéo và thả tệp vào đây hoặc nhấn "Đính kèm tài liệu"'}
          </p>
        </div>

        {/* Attachment List */}
        {attachments.length > 0 && (
          <div className="space-y-2">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center justify-between rounded-xl border border-surface-border bg-surface px-3 py-2 text-xs shadow-xs hover:border-primary/30 transition"
              >
                <div className="flex items-center space-x-2 min-w-0 flex-1">
                  <FileText className="h-4 w-4 shrink-0 text-primary" />
                  <span className="font-semibold text-text-primary truncate">{att.name}</span>
                  {att.size && (
                    <span className="text-text-muted font-medium shrink-0">{att.size}</span>
                  )}
                </div>
                <div className="flex items-center space-x-1.5 shrink-0 ml-2">
                  <a
                    href={att.url}
                    download={att.name}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg p-1 text-text-muted hover:text-primary hover:bg-primary/10 transition"
                    title="Tải xuống"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </a>
                  <button
                    onClick={() => handleRemoveAttachment(att.id)}
                    className="rounded-lg p-1 text-text-muted hover:text-status-error hover:bg-status-error/10 transition"
                    title="Xóa đính kèm"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => {
          setIsDeleteOpen(false);
          onDelete(page.id);
        }}
        itemName={page.title}
        title="Xóa trang tài liệu"
        description="Trang tài liệu và toàn bộ nội dung sẽ bị xóa vĩnh viễn, bao gồm lịch sử phiên bản."
        confirmLabel="Xóa trang"
      />
    </div>
  );
}
