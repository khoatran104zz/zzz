'use client';

import React, { useState } from 'react';
import { BookOpen, Plus, Loader2, FileText, Sparkles, Code, Users, Calendar, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  useWorkspaceWikiTree,
  useWikiPage,
  useWikiVersions,
  useCreateWikiPage,
  useUpdateWikiPage,
  useDeleteWikiPage,
} from '../hooks/use-wiki';
import { WikiTreeNavigation } from './wiki-tree-navigation';
import { WikiBreadcrumb } from './wiki-breadcrumb';
import { WikiEditor } from './wiki-editor';
import { VersionHistoryDialog } from './version-history-dialog';
import { useWorkspaceStore } from '@/store/workspace-store';
import { CreateWikiDocModal, WikiDocItem } from '@/features/project/components/create-wiki-doc-modal';

interface WikiHomeProps {
  workspaceId: string;
}

const WIKI_TEMPLATES = [
  {
    id: 'prd',
    title: '📝 Yêu cầu Dự án (PRD)',
    desc: 'Mẫu đặc tả tính năng và yêu cầu nghiệp vụ',
    icon: Sparkles,
    content: `# Tài liệu Yêu cầu Dự án (PRD)\n\n## 1. Mục tiêu & Tổng quan\n- Mô tả mục tiêu chính của dự án hoặc tính năng...\n\n## 2. Danh sách Tính năng Cốt lõi\n- [ ] Tính năng 1: ...\n- [ ] Tính năng 2: ...\n\n## 3. Quy trình Thực hiện (User Flow)\n1. Bước 1: Người dùng truy cập...\n2. Bước 2: Hệ thống xử lý...\n\n## 4. Tiêu chí Nghiệm thu (Acceptance Criteria)\n- [ ] Đạt hiệu năng yêu cầu\n- [ ] Không có lỗi nghiêm trọng`,
  },
  {
    id: 'api',
    title: '🔌 API & Kỹ thuật (Technical Spec)',
    desc: 'Mẫu mô tả Endpoint, Schema và Cấu trúc CSDL',
    icon: Code,
    content: `# Tài liệu Thiết kế API & Kỹ thuật\n\n## 1. Tổng quan Endpoint\n\`\`\`http\nPOST /api/v1/resources\nContent-Type: application/json\nAuthorization: Bearer <token>\n\`\`\`\n\n## 2. Cấu trúc Request Body\n\`\`\`json\n{\n  "title": "String",\n  "status": "ACTIVE"\n}\n\`\`\`\n\n## 3. Phản hồi thành công (200 OK)\n\`\`\`json\n{\n  "code": 200,\n  "message": "Success",\n  "data": {}\n}\n\`\`\``,
  },
  {
    id: 'onboarding',
    title: '🚀 Hướng dẫn Thành viên (Onboarding)',
    desc: 'Mẫu quy trình thiết lập môi trường cho người mới',
    icon: Users,
    content: `# Quy trình Hướng dẫn Thành viên Mới (Onboarding)\n\n## 1. Thỏa thuận & Công cụ làm việc\n- [ ] Tham gia kênh Slack / Zalo nhóm\n- [ ] Đọc quy định Coding Convention\n\n## 2. Thiết lập Môi trường Lập trình\n- [ ] Cài đặt Node.js v20+, Java OpenJDK 21\n- [ ] Clone Repository về máy cục bộ\n- [ ] Chạy câu lệnh \`npm install\` & \`mvn clean compile\`\n\n## 3. Người hỗ trợ (Mentors)\n- Tech Lead: admin@taskflow.com`,
  },
  {
    id: 'meeting',
    title: '📅 Biên bản Cuộc họp (Meeting Notes)',
    desc: 'Mẫu ghi nhận thảo luận và phân công công việc',
    icon: Calendar,
    content: `# Biên bản Cuộc họp Nhóm\n\n**Thời gian:** ${new Date().toLocaleDateString('vi-VN')}\n**Chủ trì:** ...\n**Thành phần tham dự:** ...\n\n## 1. Nội dung Thảo luận\n- Mục 1: Đánh giá tiến độ sprint\n- Mục 2: Giải quyết các vấn đề kỹ thuật tồn đọng\n\n## 2. Quyết định & Phân công (Action Items)\n- [ ] @Thành_viên_A: Thực hiện kiểm thử tính năng X (Hạn chót: ...)\n- [ ] @Thành_viên_B: Cập nhật API documentation`,
  },
];

export function WikiHome({ workspaceId }: WikiHomeProps) {
  const { t: tNav } = useTranslation('navigation');
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace);
  const { data: tree = [], isLoading: isLoadingTree } = useWorkspaceWikiTree(workspaceId);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [isVersionsOpen, setIsVersionsOpen] = useState(false);
  const [isCreateDocOpen, setIsCreateDocOpen] = useState(false);

  const { data: selectedPage, isLoading: isLoadingPage } = useWikiPage(selectedPageId);
  const { data: versions = [] } = useWikiVersions(selectedPageId);

  const createMutation = useCreateWikiPage(workspaceId);
  const updateMutation = useUpdateWikiPage(workspaceId, selectedPageId || '');
  const deleteMutation = useDeleteWikiPage(workspaceId);

  const handleCreatePage = (parentPageId?: string, title?: string, content?: string) => {
    createMutation.mutate(
      {
        title: title || 'Tài liệu Wiki mới',
        content: content || '# Tài liệu Wiki mới\n\nBắt đầu nhập nội dung hướng dẫn hoặc ghi chú tại đây...',
        parentPageId,
      },
      {
        onSuccess: (newPage) => {
          setSelectedPageId(newPage.id);
        },
      }
    );
  };

  const handleDeletePage = (pageId: string) => {
    deleteMutation.mutate(pageId, {
      onSuccess: () => {
        setSelectedPageId(null);
      },
    });
  };

  // Auto-select first page if available
  React.useEffect(() => {
    if (!selectedPageId && tree.length > 0) {
      setSelectedPageId(tree[0].id);
    }
  }, [tree, selectedPageId]);

  if (isLoadingTree) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 text-text-primary">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-surface-border pb-4">
        <div className="flex items-center space-x-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-xs">
            <BookOpen className="h-5.5 w-5.5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-text-primary font-heading flex items-center space-x-2">
              <span>{tNav('menu.wiki', { defaultValue: 'Tài liệu Wiki' })}</span>
              {activeWorkspace && (
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary border border-primary/20">
                  {activeWorkspace.name}
                </span>
              )}
            </h1>
            <p className="text-xs text-text-secondary mt-0.5">
              Kho tri thức nội bộ, quy trình làm việc và tài liệu kỹ thuật của Workspace
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCreateDocOpen(true)}
          disabled={createMutation.isPending}
          className="flex items-center space-x-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-primary-hover active:scale-95 transition"
        >
          {createMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          <span>Tạo tài liệu mới</span>
        </button>
      </div>

      <WikiBreadcrumb pageTitle={selectedPage?.title} />

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Sidebar Tree */}
        <WikiTreeNavigation
          tree={tree}
          selectedPageId={selectedPageId || undefined}
          onSelectPage={setSelectedPageId}
          onCreatePage={(parentId) => handleCreatePage(parentId)}
        />

        {/* Right Editor / Template Presets View */}
        {isLoadingPage ? (
          <div className="flex flex-1 h-64 items-center justify-center rounded-2xl border border-surface-border bg-surface">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : selectedPage ? (
          <WikiEditor
            page={selectedPage}
            onSave={(payload) => updateMutation.mutate(payload)}
            onDelete={handleDeletePage}
            onOpenVersions={() => setIsVersionsOpen(true)}
            isSaving={updateMutation.isPending}
          />
        ) : (
          <div className="flex-1 space-y-6 rounded-2xl border border-surface-border bg-surface p-6 shadow-xs">
            <div className="text-center space-y-2 py-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-xs mx-auto">
                <FileText className="h-7 w-7" />
              </div>
              <h3 className="text-base font-extrabold text-text-primary font-heading">Chưa chọn trang tài liệu nào</h3>
              <p className="text-xs text-text-secondary max-w-sm mx-auto">
                Chọn một trang từ danh mục bên trái hoặc tạo nhanh bằng các bộ mẫu chuẩn bên dưới:
              </p>
            </div>

            {/* Template Presets Grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              {WIKI_TEMPLATES.map((tmpl) => {
                const Icon = tmpl.icon;
                return (
                  <div
                    key={tmpl.id}
                    onClick={() => handleCreatePage(undefined, tmpl.title, tmpl.content)}
                    className="group cursor-pointer rounded-2xl border border-surface-border bg-surface-alt/40 p-4 hover:border-primary/50 hover:bg-surface-alt transition-all shadow-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Icon className="h-4 w-4 text-primary" />
                        <h4 className="text-xs font-bold text-text-primary font-heading">{tmpl.title}</h4>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-text-muted group-hover:text-primary transition-transform group-hover:translate-x-1" />
                    </div>
                    <p className="text-[11px] text-text-secondary">{tmpl.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <VersionHistoryDialog
        versions={versions}
        isOpen={isVersionsOpen}
        onClose={() => setIsVersionsOpen(false)}
      />

      <CreateWikiDocModal
        isOpen={isCreateDocOpen}
        onClose={() => setIsCreateDocOpen(false)}
        defaultWorkspaceId={workspaceId}
        onCreated={(doc) => handleCreatePage(undefined, doc.title, doc.summary)}
      />
    </div>
  );
}
