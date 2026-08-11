'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, BookOpen, Loader2, Plus, Paperclip } from 'lucide-react';
import { useWorkspaces } from '@/features/workspace/hooks/use-workspace';
import { useProjects } from '@/features/project/hooks/use-project';
import { useWorkspaceStore } from '@/store/workspace-store';

export interface WikiDocItem {
  id: string;
  title: string;
  category: string;
  version: string;
  summary: string;
  workspaceId: string;
  projectId: string;
  updatedAt: string;
  updatedBy: string;
  attachedFilesCount?: number;
}

interface CreateWikiDocModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultWorkspaceId?: string;
  defaultProjectId?: string;
  onCreated: (doc: WikiDocItem) => void;
}

export function CreateWikiDocModal({
  isOpen,
  onClose,
  defaultWorkspaceId,
  defaultProjectId,
  onCreated,
}: CreateWikiDocModalProps) {
  const [mounted, setMounted] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Kỹ thuật');
  const [summary, setSummary] = useState('');
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { data: workspaces = [] } = useWorkspaces();
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (defaultWorkspaceId) {
      setSelectedWorkspaceId(defaultWorkspaceId);
    } else if (activeWorkspace?.id) {
      setSelectedWorkspaceId(activeWorkspace.id);
    } else if (workspaces.length > 0) {
      setSelectedWorkspaceId(workspaces[0].id);
    }

    if (defaultProjectId) {
      setSelectedProjectId(defaultProjectId);
    }
  }, [defaultWorkspaceId, defaultProjectId, activeWorkspace, workspaces, isOpen]);

  const workspaceId = selectedWorkspaceId || activeWorkspace?.id || workspaces[0]?.id || '';
  const { data: projects = [] } = useProjects(workspaceId || null);

  if (!isOpen || !mounted) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedWorkspaceId || !selectedProjectId) return;

    setIsLoading(true);
    setTimeout(() => {
      const newDoc: WikiDocItem = {
        id: `wiki-${Date.now()}`,
        title: title.trim(),
        category,
        version: 'v1.0',
        summary: summary.trim() || 'Tài liệu hướng dẫn và quy trình tác nghiệp cho dự án.',
        workspaceId: selectedWorkspaceId,
        projectId: selectedProjectId,
        updatedAt: 'Vừa xong',
        updatedBy: 'Bạn (Quản lý)',
        attachedFilesCount: attachedFiles.length,
      };

      onCreated(newDoc);
      setIsLoading(false);
      setTitle('');
      setSummary('');
      setAttachedFiles([]);
      onClose();
    }, 300);
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative my-auto w-full max-w-lg rounded-2xl border border-surface-border bg-surface p-6 shadow-2xl space-y-4 text-text-primary max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-border pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-text-primary font-heading">
                Tạo tài liệu Tri thức mới
              </h2>
              <p className="text-[11px] text-text-secondary">
                Chọn Workspace và Dự án để lưu trữ tài liệu
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

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Workspace & Project Selectors Grid */}
          <div className="grid gap-3 sm:grid-cols-2">
            {/* Workspace Selector */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary">
                Chọn Workspace *
              </label>
              <select
                value={selectedWorkspaceId}
                onChange={(e) => {
                  setSelectedWorkspaceId(e.target.value);
                  setSelectedProjectId('');
                }}
                required
                className="w-full rounded-xl border border-surface-border bg-surface-alt p-2.5 text-xs font-bold text-text-primary focus:border-primary focus:outline-none cursor-pointer"
              >
                <option value="">-- Chọn Workspace --</option>
                {workspaces.map((w) => (
                  <option key={w.id} value={w.id} className="bg-surface text-text-primary font-medium">
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Project Selector */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary">
                Chọn Dự án *
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
          </div>

          {/* Document Title */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary">Tên tài liệu tri thức *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Hướng dẫn Kiến trúc Microservices, Quy trình Deployment..."
              className="w-full rounded-xl border border-surface-border bg-surface-alt p-2.5 text-xs text-text-primary placeholder:text-text-muted transition focus:border-primary focus:outline-none"
            />
          </div>

          {/* Category */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary">Phân loại tài liệu</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-surface-border bg-surface-alt p-2.5 text-xs text-text-primary focus:border-primary focus:outline-none cursor-pointer"
            >
              <option value="Kỹ thuật">Kỹ thuật & Kiến trúc Hệ thống</option>
              <option value="Quy trình">Quy trình & Vận hành dự án</option>
              <option value="Thiết kế">Thiết kế UI/UX & Sản phẩm</option>
              <option value="Đào tạo">Tài liệu Onboarding & Đào tạo</option>
            </select>
          </div>

          {/* Summary */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary">Tóm tắt nội dung tài liệu</label>
            <textarea
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Nhập tóm tắt mục đích và nội dung cốt lõi của tài liệu tri thức..."
              className="w-full rounded-xl border border-surface-border bg-surface-alt p-2.5 text-xs text-text-primary placeholder:text-text-muted transition focus:border-primary focus:outline-none"
            />
          </div>

          {/* File Attachment Field inside Modal */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary flex items-center justify-between">
              <span>Đính kèm tập tin tài liệu (PDF, Word, Ảnh, Zip...)</span>
              {attachedFiles.length > 0 && (
                <span className="text-primary font-bold">{attachedFiles.length} tệp đã chọn</span>
              )}
            </label>
            <input
              type="file"
              multiple
              onChange={(e) => setAttachedFiles(Array.from(e.target.files || []))}
              className="w-full rounded-xl border border-surface-border bg-surface-alt p-2 text-xs text-text-primary file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white hover:file:bg-primary-hover cursor-pointer"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end space-x-2 border-t border-surface-border pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-surface-border px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-surface-alt transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading || !title.trim() || !selectedWorkspaceId || !selectedProjectId}
              className="flex items-center space-x-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-primary-hover transition active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Tạo tài liệu mới</span>
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
