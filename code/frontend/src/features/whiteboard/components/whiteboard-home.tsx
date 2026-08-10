'use client';

import React, { useState } from 'react';
import { PenLine, Plus, Loader2, Trash2, ArrowLeft, Grid, Search, Network, GitMerge, Lightbulb, LayoutGrid, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  useWorkspaceWhiteboards,
  useWhiteboardDetails,
  useCreateWhiteboard,
  useSyncWhiteboardElements,
  useDeleteWhiteboard,
} from '../hooks/use-whiteboard';
import { whiteboardService } from '../services/whiteboard-service';
import { WhiteboardCanvas } from './whiteboard-canvas';
import { ConfirmDeleteModal } from '@/components/confirm-delete-modal';
import { useWorkspaceStore } from '@/store/workspace-store';
import type { WhiteboardElementDto } from '../types';

interface WhiteboardHomeProps {
  workspaceId: string;
}

const WHITEBOARD_TEMPLATES = [
  {
    id: 'architecture',
    title: '🏗️ Sơ đồ Kiến trúc Hệ thống',
    desc: 'Phác thảo các thành phần Client, Server, Database và kết nối',
    icon: Network,
    elements: [
      { id: 't1', whiteboardId: '', type: 'SHAPE_RECT', x: 80, y: 120, width: 140, height: 80, rotation: 0, content: '📱 Web / Mobile Client', zIndex: 1 },
      { id: 't2', whiteboardId: '', type: 'SHAPE_RECT', x: 300, y: 120, width: 150, height: 80, rotation: 0, content: '⚡ Backend API Service', zIndex: 2 },
      { id: 't3', whiteboardId: '', type: 'SHAPE_CIRCLE', x: 540, y: 110, width: 100, height: 100, rotation: 0, content: '🗄️ PostgreSQL DB', zIndex: 3 },
      { id: 'c1', whiteboardId: '', type: 'CONNECTOR', x: 0, y: 0, width: 0, height: 0, rotation: 0, content: '', zIndex: 4, fromElementId: 't1', toElementId: 't2' },
      { id: 'c2', whiteboardId: '', type: 'CONNECTOR', x: 0, y: 0, width: 0, height: 0, rotation: 0, content: '', zIndex: 5, fromElementId: 't2', toElementId: 't3' },
    ] as WhiteboardElementDto[],
  },
  {
    id: 'flowchart',
    title: '🔄 Sơ đồ Quy trình Nghiệp vụ',
    desc: 'Sơ đồ luồng quyết định (Start -> Process -> Decision -> End)',
    icon: GitMerge,
    elements: [
      { id: 'f1', whiteboardId: '', type: 'SHAPE_CIRCLE', x: 100, y: 140, width: 80, height: 80, rotation: 0, content: '▶️ Bắt đầu', zIndex: 1 },
      { id: 'f2', whiteboardId: '', type: 'SHAPE_RECT', x: 240, y: 130, width: 140, height: 100, rotation: 0, content: '⚙️ Xử lý Yêu cầu', zIndex: 2 },
      { id: 'f3', whiteboardId: '', type: 'SHAPE_CIRCLE', x: 440, y: 140, width: 80, height: 80, rotation: 0, content: '✅ Kết thúc', zIndex: 3 },
      { id: 'fc1', whiteboardId: '', type: 'CONNECTOR', x: 0, y: 0, width: 0, height: 0, rotation: 0, content: '', zIndex: 4, fromElementId: 'f1', toElementId: 'f2' },
      { id: 'fc2', whiteboardId: '', type: 'CONNECTOR', x: 0, y: 0, width: 0, height: 0, rotation: 0, content: '', zIndex: 5, fromElementId: 'f2', toElementId: 'f3' },
    ] as WhiteboardElementDto[],
  },
  {
    id: 'brainstorm',
    title: '💡 Bảng Động não Ý tưởng',
    desc: 'Tập hợp các thẻ ghi chú màu sắc để thu thập ý tưởng sáng tạo',
    icon: Lightbulb,
    elements: [
      { id: 'b1', whiteboardId: '', type: 'STICKY_NOTE', x: 100, y: 100, width: 170, height: 170, rotation: 0, content: '💡 Ý tưởng 1: Tối ưu hóa UI/UX ứng dụng', zIndex: 1 },
      { id: 'b2', whiteboardId: '', type: 'STICKY_NOTE', x: 300, y: 100, width: 170, height: 170, rotation: 0, content: '🚀 Ý tưởng 2: Tích hợp thông báo đẩy Push Noti', zIndex: 2 },
      { id: 'b3', whiteboardId: '', type: 'STICKY_NOTE', x: 500, y: 100, width: 170, height: 170, rotation: 0, content: '🎯 Cần nghiên cứu: Bảo mật OAuth2 & JWT', zIndex: 3 },
    ] as WhiteboardElementDto[],
  },
  {
    id: 'swot',
    title: '🎯 Phân tích Ma trận SWOT',
    desc: '4 góc phân tích Điểm mạnh, Điểm yếu, Cơ hội & Thách thức',
    icon: LayoutGrid,
    elements: [
      { id: 's1', whiteboardId: '', type: 'STICKY_NOTE', x: 100, y: 100, width: 180, height: 160, rotation: 0, content: '💪 Điểm mạnh (Strengths):\n- Đội ngũ nhanh nhẹn\n- Giao diện đẹp', zIndex: 1 },
      { id: 's2', whiteboardId: '', type: 'STICKY_NOTE', x: 310, y: 100, width: 180, height: 160, rotation: 0, content: '⚠️ Điểm yếu (Weaknesses):\n- Thiếu tài liệu API\n- Kiểm thử chưa đủ', zIndex: 2 },
      { id: 's3', whiteboardId: '', type: 'STICKY_NOTE', x: 100, y: 280, width: 180, height: 160, rotation: 0, content: '🌟 Cơ hội (Opportunities):\n- Nhu cầu thị trường cao\n- Mở rộng tính năng AI', zIndex: 3 },
      { id: 's4', whiteboardId: '', type: 'STICKY_NOTE', x: 310, y: 280, width: 180, height: 160, rotation: 0, content: '🛡️ Thách thức (Threats):\n- Cạnh tranh gay gắt\n- Chi phí vận hành', zIndex: 4 },
    ] as WhiteboardElementDto[],
  },
];

export function WhiteboardHome({ workspaceId }: WhiteboardHomeProps) {
  const { t: tNav } = useTranslation('navigation');
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace);
  const { data: boards = [], isLoading: isLoadingList } = useWorkspaceWhiteboards(workspaceId);
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Delete confirm state
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  const { data: activeBoard, isLoading: isLoadingBoard } = useWhiteboardDetails(activeBoardId);

  const createMutation = useCreateWhiteboard(workspaceId);
  const syncMutation = useSyncWhiteboardElements(activeBoardId || '');
  const deleteMutation = useDeleteWhiteboard(workspaceId);

  const handleCreateBoard = (title?: string, description?: string, templateElements?: WhiteboardElementDto[]) => {
    createMutation.mutate(
      {
        title: title || 'Bảng vẽ ý tưởng & Sơ đồ kiến trúc mới',
        description: description || 'Bảng trắng trực quan để vẽ ý tưởng, sơ đồ quy trình và kiến trúc hệ thống',
      },
      {
        onSuccess: async (newBoard) => {
          setActiveBoardId(newBoard.id);
          // If template elements provided, sync them immediately
          if (templateElements && templateElements.length > 0) {
            const elementsWithBoardId = templateElements.map((el) => ({ ...el, whiteboardId: newBoard.id }));
            try {
              await whiteboardService.syncElements(newBoard.id, { elements: elementsWithBoardId });
            } catch (e) {
              console.error('Failed to sync template elements', e);
            }
          }
          toast.success('Tạo bảng vẽ mới thành công!');
        },
        onError: (err: any) => {
          const msg = err.response?.data?.message || 'Không thể tạo bảng vẽ mới, vui lòng thử lại.';
          toast.error(msg);
        },
      }
    );
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        if (activeBoardId === deleteTarget.id) setActiveBoardId(null);
        setDeleteTarget(null);
      },
    });
  };

  const filteredBoards = boards.filter(
    (b) =>
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.description && b.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoadingList) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-5 text-text-primary">
      {/* Header Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-surface-border pb-4">
        <div className="flex items-center space-x-3">
          {activeBoardId && (
            <button
              onClick={() => setActiveBoardId(null)}
              className="rounded-xl border border-surface-border bg-surface p-2 text-text-secondary hover:bg-surface-alt hover:text-text-primary transition shadow-xs"
              title="Quay lại danh sách Bảng vẽ"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-xs">
            <PenLine className="h-5.5 w-5.5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-text-primary font-heading flex items-center space-x-2">
              <span>{activeBoard ? activeBoard.title : tNav('menu.whiteboard', { defaultValue: 'Bảng vẽ Whiteboard' })}</span>
              {!activeBoardId && activeWorkspace && (
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary border border-primary/20">
                  {activeWorkspace.name}
                </span>
              )}
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              {activeBoard
                ? `${activeBoard.elements.length} phần tử sơ đồ`
                : 'Vẽ ý tưởng, sơ đồ quy trình và kiến trúc hệ thống nhóm theo thời gian thực'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Delete active board button */}
          {activeBoardId && activeBoard && (
            <button
              onClick={() => setDeleteTarget({ id: activeBoard.id, title: activeBoard.title })}
              className="flex items-center space-x-1.5 rounded-xl border border-status-error/30 bg-status-error/10 px-3 py-2 text-xs font-bold text-status-error hover:bg-status-error/20 transition"
              title="Xóa bảng vẽ này"
            >
              <Trash2 className="h-4 w-4" />
              <span>Xóa bảng vẽ</span>
            </button>
          )}

          {!activeBoardId && (
            <button
              onClick={() => handleCreateBoard()}
              disabled={createMutation.isPending}
              className="flex items-center space-x-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-primary-hover active:scale-95 transition"
            >
              {createMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              <span>Tạo bảng vẽ mới</span>
            </button>
          )}
        </div>
      </div>

      {/* Live Search Bar for Boards */}
      {!activeBoardId && boards.length > 0 && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-text-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm bảng vẽ..."
            className="w-full rounded-xl border border-surface-border bg-surface pl-9 pr-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none transition shadow-xs"
          />
        </div>
      )}

      {/* Main Content Area */}
      {activeBoardId ? (
        isLoadingBoard || !activeBoard ? (
          <div className="flex h-64 items-center justify-center rounded-2xl border border-surface-border bg-surface">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <WhiteboardCanvas
            initialElements={activeBoard.elements || []}
            onSave={(elements) => syncMutation.mutate({ elements })}
            isSaving={syncMutation.isPending}
          />
        )
      ) : boards.length === 0 ? (
        <div className="space-y-6">
          <div className="flex h-60 flex-col items-center justify-center rounded-2xl border border-surface-border bg-surface p-6 text-center shadow-xs">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-xs">
              <Grid className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-base font-extrabold text-text-primary font-heading">Chưa có Bảng vẽ nào</h3>
            <p className="mt-1 text-xs text-text-secondary max-w-sm">
              Tạo bảng vẽ mới hoặc chọn một bộ mẫu sơ đồ chuẩn bên dưới để bắt đầu phác thảo ý tưởng nhóm
            </p>
          </div>

          {/* Quick Diagram Templates */}
          <div>
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">
              Mẫu sơ đồ vẽ nhanh (1-Click Diagram Presets)
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {WHITEBOARD_TEMPLATES.map((tmpl) => {
                const Icon = tmpl.icon;
                return (
                  <div
                    key={tmpl.id}
                    onClick={() => handleCreateBoard(tmpl.title, tmpl.desc, tmpl.elements)}
                    className="group cursor-pointer rounded-2xl border border-surface-border bg-surface p-4 hover:border-primary/50 hover:shadow-md transition-all shadow-xs space-y-2 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <Icon className="h-5 w-5" />
                        </div>
                        <ArrowRight className="h-4 w-4 text-text-muted group-hover:text-primary transition-transform group-hover:translate-x-1" />
                      </div>
                      <h4 className="text-xs font-bold text-text-primary font-heading">{tmpl.title}</h4>
                      <p className="text-[11px] text-text-secondary leading-relaxed">{tmpl.desc}</p>
                    </div>
                    <div className="pt-2 text-[10px] font-bold text-primary">
                      + Nạp sẵn {tmpl.elements.length} phần tử
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredBoards.map((board) => (
              <div
                key={board.id}
                onClick={() => setActiveBoardId(board.id)}
                className="group relative cursor-pointer rounded-2xl border border-surface-border bg-surface p-5 hover:border-primary/50 hover:shadow-md transition-all shadow-xs"
              >
                {/* Board Thumbnail Preview */}
                <div
                  className="mb-4 h-24 w-full rounded-xl border border-surface-border/60 bg-surface-alt/60 overflow-hidden flex items-center justify-center"
                  style={{
                    backgroundImage: 'radial-gradient(circle, rgba(100, 80, 240, 0.15) 1px, transparent 1px)',
                    backgroundSize: '16px 16px',
                  }}
                >
                  <PenLine className="h-6 w-6 text-primary/40 group-hover:scale-110 transition-transform" />
                </div>

                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <PenLine className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-text-primary font-heading truncate">{board.title}</h4>
                      <p className="text-[10px] text-text-muted mt-0.5">
                        {board.elements.length} phần tử sơ đồ
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTarget({ id: board.id, title: board.title });
                    }}
                    className="opacity-0 group-hover:opacity-100 rounded-xl p-1.5 text-text-muted hover:bg-status-error/10 hover:text-status-error transition shrink-0 ml-2"
                    title="Xóa Bảng vẽ"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <p className="mt-2 text-xs text-text-secondary line-clamp-2">
                  {board.description || 'Bảng vẽ trực quan tương tác nhóm'}
                </p>
              </div>
            ))}
          </div>

          {/* Quick Diagram Templates Row at the bottom of list */}
          <div className="pt-4 border-t border-surface-border">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">
              Tạo nhanh từ Mẫu sơ đồ (Quick Diagram Presets)
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {WHITEBOARD_TEMPLATES.map((tmpl) => {
                const Icon = tmpl.icon;
                return (
                  <div
                    key={tmpl.id}
                    onClick={() => handleCreateBoard(tmpl.title, tmpl.desc, tmpl.elements)}
                    className="group cursor-pointer rounded-2xl border border-surface-border bg-surface p-4 hover:border-primary/50 hover:shadow-md transition-all shadow-xs space-y-2 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <Icon className="h-5 w-5" />
                        </div>
                        <ArrowRight className="h-4 w-4 text-text-muted group-hover:text-primary transition-transform group-hover:translate-x-1" />
                      </div>
                      <h4 className="text-xs font-bold text-text-primary font-heading">{tmpl.title}</h4>
                      <p className="text-[11px] text-text-secondary leading-relaxed">{tmpl.desc}</p>
                    </div>
                    <div className="pt-2 text-[10px] font-bold text-primary">
                      + Nạp sẵn {tmpl.elements.length} phần tử
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
        itemName={deleteTarget?.title}
        title="Xóa Bảng vẽ"
        description="Toàn bộ phần tử sơ đồ và dữ liệu của bảng vẽ sẽ bị xóa vĩnh viễn."
        confirmLabel="Xóa bảng vẽ"
      />
    </div>
  );
}
