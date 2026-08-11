'use client';

import React, { useState } from 'react';
import { 
  PenLine, 
  Plus, 
  Loader2, 
  Trash2, 
  ArrowLeft, 
  Grid, 
  Search, 
  Network, 
  GitMerge, 
  Lightbulb, 
  LayoutGrid, 
  Database,
  Workflow,
  ArrowRight,
  Edit3,
  Building2,
  Folder,
  Clock,
  Layers,
  Sparkles
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
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
import { useProjects } from '@/features/project/hooks/use-project';
import { CreateWhiteboardModal, WhiteboardItem } from '@/features/project/components/create-whiteboard-modal';
import type { WhiteboardElementDto } from '../types';

interface WhiteboardHomeProps {
  workspaceId: string;
}

const WHITEBOARD_TEMPLATES = [
  {
    id: 'architecture',
    title: 'Sơ đồ Kiến trúc Hệ thống',
    desc: 'Phác thảo sẵn các khối Client, API Gateway, Backend Microservices, DB & Caching',
    icon: Network,
    badge: 'Kiến trúc & Hạ tầng',
    elements: [
      { id: 't1', type: 'SHAPE_RECT', x: 60, y: 120, width: 150, height: 80, rotation: 0, content: '📱 Client App (Web / Mobile)', zIndex: 1 },
      { id: 't2', type: 'CONNECTOR', x: 210, y: 160, width: 90, height: 2, rotation: 0, content: 'HTTPS / REST', zIndex: 2 },
      { id: 't3', type: 'SHAPE_RECT', x: 300, y: 120, width: 150, height: 80, rotation: 0, content: '⚡ API Gateway & Auth', zIndex: 3 },
      { id: 't4', type: 'CONNECTOR', x: 450, y: 160, width: 90, height: 2, rotation: 0, content: 'gRPC / Internal', zIndex: 4 },
      { id: 't5', type: 'SHAPE_RECT', x: 540, y: 120, width: 160, height: 80, rotation: 0, content: '⚙️ Core Microservice', zIndex: 5 },
      { id: 't6', type: 'SHAPE_CIRCLE', x: 750, y: 110, width: 100, height: 100, rotation: 0, content: '🗄️ PostgreSQL DB', zIndex: 6 },
      { id: 't7', type: 'STICKY_NOTE', x: 300, y: 240, width: 190, height: 130, rotation: 0, content: '📌 Yêu cầu Hạ tầng:\n- SLA Uptime > 99.9%\n- Redis Cache độ trễ < 10ms', zIndex: 7 },
    ],
  },
  {
    id: 'userflow',
    title: 'Sơ đồ Luồng Người dùng',
    desc: 'Thiết kế các bước trải nghiệm người dùng từ Đăng nhập đến Thanh toán',
    icon: GitMerge,
    badge: 'Quy trình UX/UI',
    elements: [
      { id: 'u1', type: 'SHAPE_CIRCLE', x: 60, y: 140, width: 80, height: 80, rotation: 0, content: 'Trang chủ', zIndex: 1 },
      { id: 'u2', type: 'CONNECTOR', x: 140, y: 180, width: 80, height: 2, rotation: 0, content: 'Click Đăng nhập', zIndex: 2 },
      { id: 'u3', type: 'SHAPE_RECT', x: 220, y: 140, width: 140, height: 80, rotation: 0, content: '🔑 Form Đăng nhập', zIndex: 3 },
      { id: 'u4', type: 'CONNECTOR', x: 360, y: 180, width: 80, height: 2, rotation: 0, content: 'Xác thực OTP', zIndex: 4 },
      { id: 'u5', type: 'SHAPE_RECT', x: 440, y: 140, width: 150, height: 80, rotation: 0, content: '📊 Dashboard Chính', zIndex: 5 },
      { id: 'u6', type: 'CONNECTOR', x: 590, y: 180, width: 80, height: 2, rotation: 0, content: 'Chọn gói', zIndex: 6 },
      { id: 'u7', type: 'SHAPE_RECT', x: 670, y: 140, width: 140, height: 80, rotation: 0, content: '💳 Thanh toán VNPay', zIndex: 7 },
      { id: 'u8', type: 'STICKY_NOTE', x: 220, y: 260, width: 180, height: 120, rotation: 0, content: '💡 Lưu ý UX:\n- Hỗ trợ Google SSO\n- Gửi Email xác nhận tự động', zIndex: 8 },
    ],
  },
  {
    id: 'brainstorm',
    title: 'Sơ đồ Tư duy Mindmap',
    desc: 'Bảng thu thập, kết nối và phân loại các ý tưởng đột phá cho dự án',
    icon: Lightbulb,
    badge: 'Ý tưởng & Brainstorm',
    elements: [
      { id: 'b1', type: 'SHAPE_RECT', x: 320, y: 150, width: 190, height: 90, rotation: 0, content: '💡 Ý tưởng Cốt lõi Dự án', zIndex: 1 },
      { id: 'b2', type: 'SHAPE_RECT', x: 60, y: 60, width: 150, height: 60, rotation: 0, content: '🚀 Tính năng Nổi bật', zIndex: 2 },
      { id: 'b3', type: 'SHAPE_RECT', x: 60, y: 240, width: 150, height: 60, rotation: 0, content: '🎨 Thiết kế UI/UX', zIndex: 3 },
      { id: 'b4', type: 'SHAPE_RECT', x: 580, y: 60, width: 150, height: 60, rotation: 0, content: '🛡️ Bảo mật & Tốc độ', zIndex: 4 },
      { id: 'b5', type: 'SHAPE_RECT', x: 580, y: 240, width: 150, height: 60, rotation: 0, content: '🤖 Tích hợp Trí tuệ AI', zIndex: 5 },
      { id: 'b6', type: 'STICKY_NOTE', x: 320, y: 280, width: 190, height: 120, rotation: 0, content: '🎯 Mục tiêu Sprint 1:\nHoàn thiện mẫu Demo MVP cho Khách hàng', zIndex: 6 },
    ],
  },
  {
    id: 'kanban',
    title: 'Bảng Quy trình Làm việc',
    desc: 'Phân loại các cột quy trình công việc theo trạng thái thực hiện',
    icon: LayoutGrid,
    badge: 'Quản lý Công việc',
    elements: [
      { id: 'k1', type: 'SHAPE_RECT', x: 50, y: 100, width: 180, height: 270, rotation: 0, content: '📌 Cần làm (To Do)', zIndex: 1 },
      { id: 'k2', type: 'SHAPE_RECT', x: 270, y: 100, width: 180, height: 270, rotation: 0, content: '⚡ Đang làm (In Progress)', zIndex: 2 },
      { id: 'k3', type: 'SHAPE_RECT', x: 490, y: 100, width: 180, height: 270, rotation: 0, content: '🔍 Kiểm thử (Review)', zIndex: 3 },
      { id: 'k4', type: 'SHAPE_RECT', x: 710, y: 100, width: 180, height: 270, rotation: 0, content: '✅ Hoàn thành (Done)', zIndex: 4 },
      { id: 'k5', type: 'STICKY_NOTE', x: 70, y: 160, width: 140, height: 90, rotation: 0, content: '📝 Thiết kế Schema DB', zIndex: 5 },
      { id: 'k6', type: 'STICKY_NOTE', x: 290, y: 160, width: 140, height: 90, rotation: 0, content: '🔒 Lập trình Auth JWT', zIndex: 6 },
      { id: 'k7', type: 'STICKY_NOTE', x: 510, y: 160, width: 140, height: 90, rotation: 0, content: '🧪 Unit Test API', zIndex: 7 },
    ],
  },
  {
    id: 'erd',
    title: 'Sơ đồ Entity Relationship ERD',
    desc: 'Phác thảo các bảng CSDL (Users, Workspaces, Projects, Tasks) và quan hệ',
    icon: Database,
    badge: 'Thiết kế CSDL',
    elements: [
      { id: 'e1', type: 'SHAPE_RECT', x: 80, y: 100, width: 160, height: 120, rotation: 0, content: '📊 USERS TABLE\n- id: UUID (PK)\n- email: String\n- fullName: String', zIndex: 1 },
      { id: 'e2', type: 'CONNECTOR', x: 240, y: 160, width: 100, height: 2, rotation: 0, content: '1 - N', zIndex: 2 },
      { id: 'e3', type: 'SHAPE_RECT', x: 340, y: 100, width: 170, height: 120, rotation: 0, content: '🏢 WORKSPACES TABLE\n- id: UUID (PK)\n- name: String\n- ownerId: UUID (FK)', zIndex: 3 },
      { id: 'e4', type: 'CONNECTOR', x: 510, y: 160, width: 100, height: 2, rotation: 0, content: '1 - N', zIndex: 4 },
      { id: 'e5', type: 'SHAPE_RECT', x: 610, y: 100, width: 170, height: 120, rotation: 0, content: '📁 PROJECTS TABLE\n- id: UUID (PK)\n- name: String\n- key: String', zIndex: 5 },
      { id: 'e6', type: 'STICKY_NOTE', x: 340, y: 250, width: 180, height: 110, rotation: 0, content: '🔑 Ràng buộc Dữ liệu:\nCASCADE Delete khi xóa Workspace', zIndex: 6 },
    ],
  },
  {
    id: 'sequence',
    title: 'Sơ đồ Trình tự Tuần tự (Sequence)',
    desc: 'Phác thảo tương tác luồng gửi thông điệp giữa Client, Auth Service, DB',
    icon: Workflow,
    badge: 'Luồng API & Trình tự',
    elements: [
      { id: 's1', type: 'SHAPE_RECT', x: 80, y: 80, width: 130, height: 50, rotation: 0, content: '👤 User Agent', zIndex: 1 },
      { id: 's2', type: 'SHAPE_RECT', x: 320, y: 80, width: 130, height: 50, rotation: 0, content: '🛡️ Auth Server', zIndex: 2 },
      { id: 's3', type: 'SHAPE_RECT', x: 560, y: 80, width: 130, height: 50, rotation: 0, content: '🗄️ Database', zIndex: 3 },
      { id: 's4', type: 'CONNECTOR', x: 210, y: 150, width: 110, height: 2, rotation: 0, content: '1. POST /login', zIndex: 4 },
      { id: 's5', type: 'CONNECTOR', x: 450, y: 190, width: 110, height: 2, rotation: 0, content: '2. Query User', zIndex: 5 },
      { id: 's6', type: 'CONNECTOR', x: 210, y: 230, width: 110, height: 2, rotation: 0, content: '3. Return JWT Token', zIndex: 6 },
      { id: 's7', type: 'STICKY_NOTE', x: 320, y: 260, width: 180, height: 100, rotation: 0, content: '🔒 Thời hạn JWT Token:\nAccess Token: 24 giờ', zIndex: 7 },
    ],
  },
];

export function WhiteboardHome({ workspaceId }: WhiteboardHomeProps) {
  const { t: tNav } = useTranslation('navigation');
  const queryClient = useQueryClient();
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace);

  const { data: boards = [], isLoading: isLoadingList } = useWorkspaceWhiteboards(workspaceId);
  const { data: projects = [] } = useProjects(workspaceId);

  const [activeBoardId, setActiveBoardId] = useState<string | null>(null);
  const [isEditingCanvas, setIsEditingCanvas] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateWbOpen, setIsCreateWbOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<typeof WHITEBOARD_TEMPLATES[0] | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  const { data: activeBoard, isLoading: isLoadingBoard } = useWhiteboardDetails(activeBoardId);

  const createMutation = useCreateWhiteboard(workspaceId);
  const syncMutation = useSyncWhiteboardElements(activeBoardId || '');
  const deleteMutation = useDeleteWhiteboard(workspaceId);

  const matchedProject = projects.find((p) => p.id === activeBoard?.projectId);

  const handleCreateBoard = (
    title?: string, 
    description?: string, 
    templateElements?: WhiteboardElementDto[],
    projectId?: string
  ) => {
    createMutation.mutate(
      {
        title: title || 'Bảng vẽ mới',
        description: description || 'Bảng vẽ trực quan hỗ trợ phác thảo sơ đồ và ý tưởng cho dự án.',
        projectId: projectId || undefined,
      },
      {
        onSuccess: async (newBoard) => {
          if (templateElements && templateElements.length > 0) {
            const elementsWithBoardId = templateElements.map((el) => ({
              type: el.type,
              x: el.x,
              y: el.y,
              width: el.width,
              height: el.height,
              rotation: el.rotation || 0,
              content: el.content || '',
              styleJson: el.styleJson || null,
              zIndex: el.zIndex || 1,
            }));
            try {
              await whiteboardService.syncElements(newBoard.id, { elements: elementsWithBoardId as any });
            } catch (e) {
              console.error('Failed to sync template elements', e);
            }
          }
          await queryClient.invalidateQueries({ queryKey: ['whiteboard', newBoard.id] });
          await queryClient.invalidateQueries({ queryKey: ['whiteboards', workspaceId] });
          setActiveBoardId(newBoard.id);
          setIsEditingCanvas(false);
          toast.success('Tạo bảng vẽ mới thành công!');
        },
        onError: (err: any) => {
          const msg = err.response?.data?.message || 'Không thể tạo bảng vẽ mới, vui lòng thử lại.';
          toast.error(msg);
        },
      }
    );
  };

  const handleOpenPresetModal = (tmpl: typeof WHITEBOARD_TEMPLATES[0]) => {
    setSelectedTemplate(tmpl);
    setIsCreateWbOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        if (activeBoardId === deleteTarget.id) {
          setActiveBoardId(null);
          setIsEditingCanvas(false);
        }
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
              onClick={() => {
                if (isEditingCanvas) {
                  setIsEditingCanvas(false);
                } else {
                  setActiveBoardId(null);
                }
              }}
              className="rounded-xl border border-surface-border bg-surface p-2 text-text-secondary hover:bg-surface-alt hover:text-text-primary transition shadow-xs cursor-pointer"
              title="Quay lại"
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
                ? isEditingCanvas
                  ? 'Giao diện chỉnh sửa bảng vẽ trực tiếp'
                  : 'Thông tin chi tiết và tổng quan về bảng vẽ tư duy'
                : 'Vẽ ý tưởng, sơ đồ quy trình và kiến trúc hệ thống nhóm theo thời gian thực'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Delete active board button */}
          {activeBoardId && activeBoard && (
            <button
              onClick={() => setDeleteTarget({ id: activeBoard.id, title: activeBoard.title })}
              className="flex items-center space-x-1.5 rounded-xl border border-status-error/30 bg-status-error/10 px-3 py-2 text-xs font-bold text-status-error hover:bg-status-error/20 transition cursor-pointer"
              title="Xóa bảng vẽ này"
            >
              <Trash2 className="h-4 w-4" />
              <span>Xóa bảng vẽ</span>
            </button>
          )}

          {!activeBoardId && (
            <button
              onClick={() => {
                setSelectedTemplate(null);
                setIsCreateWbOpen(true);
              }}
              className="flex items-center space-x-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-primary-hover active:scale-95 transition cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Tạo bảng vẽ mới</span>
            </button>
          )}
        </div>
      </div>

      {/* Live Search Bar for Boards */}
      {!activeBoardId && boards.length > 0 && (
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
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
        ) : isEditingCanvas ? (
          /* Interactive Whiteboard Canvas Editor */
          <WhiteboardCanvas
            initialElements={activeBoard.elements || []}
            onSave={(elements) => syncMutation.mutate({ elements })}
            isSaving={syncMutation.isPending}
          />
        ) : (
          /* Whiteboard Detailed Overview Page View */
          <div className="rounded-2xl border border-surface-border bg-surface p-6 space-y-6 shadow-xs">
            {/* Detail Top Header Bar */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between border-b border-surface-border pb-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-bold text-text-primary font-heading">
                    {activeBoard.title}
                  </h3>
                  <span className="rounded-lg bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-500 border border-emerald-500/20">
                    Đang hoạt động
                  </span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {activeBoard.description || 'Bảng vẽ tư duy trực quan hỗ trợ phác thảo sơ đồ quy trình và kiến trúc hệ thống.'}
                </p>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={() => {
                    setActiveBoardId(null);
                    setIsEditingCanvas(false);
                  }}
                  className="rounded-xl border border-surface-border bg-surface-alt px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-surface-alt/80 transition cursor-pointer"
                >
                  Quay lại danh sách
                </button>

                <button
                  onClick={() => setIsEditingCanvas(true)}
                  className="flex items-center space-x-2 rounded-xl bg-primary px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-primary-hover transition active:scale-95 cursor-pointer"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Chỉnh sửa bảng vẽ</span>
                </button>
              </div>
            </div>

            {/* Detailed Metadata Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-surface-border bg-surface-alt/50 p-4 space-y-1">
                <p className="text-[11px] text-text-muted font-medium">Workspace (Không gian)</p>
                <p className="text-xs font-bold text-text-primary truncate">
                  {activeWorkspace?.name || 'Workspace mặc định'}
                </p>
              </div>

              <div className="rounded-xl border border-surface-border bg-surface-alt/50 p-4 space-y-1">
                <p className="text-[11px] text-text-muted font-medium">Dự án áp dụng</p>
                <p className="text-xs font-bold text-primary truncate">
                  {matchedProject ? `${matchedProject.name} #${matchedProject.key || 'PRJ'}` : 'Bảng vẽ dùng chung Workspace'}
                </p>
              </div>

              <div className="rounded-xl border border-surface-border bg-surface-alt/50 p-4 space-y-1">
                <p className="text-[11px] text-text-muted font-medium">Số lượng phần tử sơ đồ</p>
                <p className="text-xs font-bold text-text-primary">
                  {activeBoard.elements?.length || 0} đối tượng vẽ
                </p>
              </div>

              <div className="rounded-xl border border-surface-border bg-surface-alt/50 p-4 space-y-1">
                <p className="text-[11px] text-text-muted font-medium">Cập nhật lần cuối</p>
                <p className="text-xs font-bold text-text-primary">
                  {activeBoard.updatedAt ? new Date(activeBoard.updatedAt).toLocaleString('vi-VN') : 'Hôm nay'}
                </p>
              </div>
            </div>

            {/* Board Preview & Edit Trigger Box */}
            <div
              onClick={() => setIsEditingCanvas(true)}
              className="group relative flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-surface-border bg-surface-alt/30 transition hover:border-primary/50 hover:bg-surface-alt/60 shadow-xs"
              style={{
                backgroundImage: 'radial-gradient(circle, rgba(100, 80, 240, 0.15) 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
            >
              <div className="flex flex-col items-center space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-xs group-hover:scale-110 transition-transform">
                  <PenLine className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-text-primary">Nhấn để mở giao diện Chỉnh sửa bảng vẽ</p>
                  <p className="text-[11px] text-text-secondary mt-0.5">Bắt đầu phác thảo sơ đồ, kết nối khối và vẽ ý tưởng trực tiếp</p>
                </div>
                <button className="flex items-center space-x-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-xs">
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Bắt đầu chỉnh sửa</span>
                </button>
              </div>
            </div>
          </div>
        )
      ) : (
        /* Whiteboard List + Quick Diagram Templates Grid (Always Visible) */
        <div className="space-y-8">
          {boards.length === 0 ? (
            <div className="flex h-52 flex-col items-center justify-center rounded-2xl border border-dashed border-surface-border bg-surface/40 p-6 text-center shadow-xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-xs">
                <Grid className="h-6 w-6" />
              </div>
              <h3 className="mt-3 text-sm font-bold text-text-primary font-heading">Chưa có Bảng vẽ cá nhân nào</h3>
              <p className="mt-1 text-xs text-text-secondary max-w-sm">
                Chọn một trong 6 bộ mẫu sơ đồ vẽ sẵn bên dưới hoặc bấm Tạo bảng vẽ mới để bắt đầu.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredBoards.map((board) => (
                <div
                  key={board.id}
                  onClick={() => {
                    setActiveBoardId(board.id);
                    setIsEditingCanvas(false);
                  }}
                  className="group relative cursor-pointer rounded-2xl border border-surface-border bg-surface p-5 hover:border-primary/50 hover:shadow-md transition-all shadow-xs space-y-3"
                >
                  {/* Board Thumbnail Preview */}
                  <div
                    className="h-24 w-full rounded-xl border border-surface-border/60 bg-surface-alt/60 overflow-hidden flex items-center justify-center"
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
                      className="opacity-0 group-hover:opacity-100 rounded-xl p-1.5 text-text-muted hover:bg-status-error/10 hover:text-status-error transition shrink-0 ml-2 cursor-pointer"
                      title="Xóa Bảng vẽ"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 6 Quick Diagram Templates Section */}
          <div className="border-t border-surface-border pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">
                  6 Mẫu sơ đồ chuyên nghiệp vẽ sẵn (1-Click Presets)
                </h3>
              </div>
              <span className="text-[11px] text-text-muted font-medium">Bấm chọn mẫu để gán Workspace & Dự án</span>
            </div>

            {/* Grid 6 Templates (3 columns x 2 rows) */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {WHITEBOARD_TEMPLATES.map((tmpl) => {
                const Icon = tmpl.icon;
                return (
                  <div
                    key={tmpl.id}
                    onClick={() => handleOpenPresetModal(tmpl)}
                    className="group cursor-pointer rounded-2xl border border-surface-border bg-surface p-4 hover:border-primary/50 hover:shadow-md transition-all shadow-xs space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary border border-primary/20">
                          {tmpl.badge}
                        </span>
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                          <Icon className="h-4 w-4" />
                        </div>
                      </div>

                      <h4 className="text-xs font-bold text-text-primary font-heading group-hover:text-primary transition">{tmpl.title}</h4>
                      <p className="text-[11px] text-text-secondary leading-relaxed line-clamp-2">{tmpl.desc}</p>
                    </div>

                    <div className="pt-2 border-t border-surface-border/60 text-[10px] font-bold text-primary flex items-center justify-between">
                      <span className="text-text-muted font-medium">+ Nạp sẵn {tmpl.elements.length} đối tượng vẽ</span>
                      <span className="flex items-center space-x-1 text-primary font-bold group-hover:translate-x-0.5 transition-transform">
                        <span>Chọn mẫu</span>
                        <ArrowRight className="h-3 w-3" />
                      </span>
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

      {/* Dedicated Create Whiteboard Modal (Supports Template Preset Creation & Workspace/Project Picking) */}
      <CreateWhiteboardModal
        isOpen={isCreateWbOpen}
        onClose={() => {
          setIsCreateWbOpen(false);
          setSelectedTemplate(null);
        }}
        defaultWorkspaceId={workspaceId}
        initialTitle={selectedTemplate?.title}
        initialDescription={selectedTemplate?.desc}
        initialElements={selectedTemplate?.elements}
        onCreated={(wb, elements) => handleCreateBoard(wb.title, wb.description, elements, wb.projectId)}
      />
    </div>
  );
}
