'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { PenTool, Plus, X, Loader2, LayoutGrid } from 'lucide-react';
import { useWorkspaces } from '@/features/workspace/hooks/use-workspace';
import { useProjects } from '@/features/project/hooks/use-project';
import { useWorkspaceStore } from '@/store/workspace-store';
import { SuccessModal } from '@/components/success-modal';

export interface WhiteboardItem {
  id: string;
  title: string;
  status: string;
  description: string;
  workspaceId: string;
  projectId: string;
  updatedAt: string;
  activeMembersCount: number;
}

interface CreateWhiteboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultWorkspaceId?: string;
  defaultProjectId?: string;
  initialTitle?: string;
  initialDescription?: string;
  initialElements?: any[];
  onCreated: (wb: WhiteboardItem, elements?: any[]) => void;
}

export function CreateWhiteboardModal({
  isOpen,
  onClose,
  defaultWorkspaceId,
  defaultProjectId,
  initialTitle = '',
  initialDescription = '',
  initialElements,
  onCreated,
}: CreateWhiteboardModalProps) {
  const [mounted, setMounted] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const { data: workspaces = [] } = useWorkspaces();
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (initialTitle) setTitle(initialTitle);
    if (initialDescription) setDescription(initialDescription);
  }, [initialTitle, initialDescription]);

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

  useEffect(() => {
    if (projects.length > 0 && (!selectedProjectId || !projects.some((p) => p.id === selectedProjectId))) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  if ((!isOpen && !isSuccessModalOpen) || !mounted) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedWorkspaceId || !selectedProjectId) return;

    setIsLoading(true);
    setTimeout(() => {
      const newWb: WhiteboardItem = {
        id: `wb-${Date.now()}`,
        title: title.trim(),
        status: 'Đang hoạt động',
        description: description.trim() || 'Bảng vẽ trực quan hỗ trợ phác thảo sơ đồ và ý tưởng cho dự án.',
        workspaceId: selectedWorkspaceId,
        projectId: selectedProjectId,
        updatedAt: 'Vừa xong',
        activeMembersCount: 1,
      };

      onCreated(newWb, initialElements);
      setIsLoading(false);
      setIsSuccessModalOpen(true);
      setTimeout(() => {
        setIsSuccessModalOpen(false);
        setTitle('');
        setDescription('');
        onClose();
      }, 1500);
    }, 300);
  };

  const modalContent = (
    <>
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
                <PenTool className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-text-primary font-heading">
                  {initialElements && initialElements.length > 0 ? 'Tạo Bảng vẽ từ Sơ đồ Mẫu' : 'Tạo Bảng vẽ phác thảo mới'}
                </h2>
                <p className="text-[11px] text-text-secondary">
                  Chọn Workspace và Dự án để phân công và lưu trữ bảng vẽ
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-text-muted hover:bg-surface-alt hover:text-text-primary transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Preset Badge Banner if created from Template */}
            {initialElements && initialElements.length > 0 && (
              <div className="flex items-center space-x-2 rounded-xl border border-primary/30 bg-primary/10 p-2.5 text-[11px] text-primary font-semibold">
                <LayoutGrid className="h-4 w-4 shrink-0 text-primary" />
                <span>Đã nạp sẵn {initialElements.length} đối tượng sơ đồ mẫu. Bạn có thể tùy chỉnh thông tin bên dưới.</span>
              </div>
            )}

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

            {/* Whiteboard Title */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary">Tên bảng vẽ phác thảo *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Sơ đồ luồng người dùng (User Flow), Phác thảo giao diện..."
                className="w-full rounded-xl border border-surface-border bg-surface-alt p-2.5 text-xs text-text-primary placeholder:text-text-muted transition focus:border-primary focus:outline-none"
              />
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary">Mô tả ý tưởng / mục đích</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả mục tiêu của bảng vẽ tư duy cộng tác này..."
                className="w-full rounded-xl border border-surface-border bg-surface-alt p-2.5 text-xs text-text-primary placeholder:text-text-muted transition focus:border-primary focus:outline-none"
              />
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end space-x-2 border-t border-surface-border pt-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-surface-border px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-surface-alt transition cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isLoading || !title.trim() || !selectedWorkspaceId || !selectedProjectId}
                className="flex items-center space-x-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-primary-hover transition active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    <span>{initialElements && initialElements.length > 0 ? 'Khởi tạo từ sơ đồ mẫu' : 'Tạo bảng vẽ mới'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="Tạo Bảng vẽ thành công!"
        description="Bảng vẽ phác thảo tư duy mới đã được khởi tạo cho dự án."
      />
    </>
  );

  return createPortal(modalContent, document.body);
}
