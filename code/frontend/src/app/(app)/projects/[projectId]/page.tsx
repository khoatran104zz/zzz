'use client';

import React, { use, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { 
  Loader2, 
  CheckSquare, 
  Clock, 
  BarChart3, 
  LayoutGrid, 
  GitCommitHorizontal, 
  Layers, 
  Globe, 
  BookOpen, 
  PenTool, 
  FileSpreadsheet,
  Plus,
  Bell,
  CheckCircle2,
  X
} from 'lucide-react';
import { useProjectDetails, useProjectStats } from '@/features/project/hooks/use-project';
import { useProjectTasks } from '@/features/task/hooks/use-task';
import { ProjectHeader } from '@/features/project/components/project-header';
import { WorkspaceBacklogTab } from '@/features/workspace/components/tabs/WorkspaceBacklogTab';
import { WorkspaceBoardTab } from '@/features/workspace/components/tabs/WorkspaceBoardTab';
import { WorkspaceTimelineTab } from '@/features/workspace/components/tabs/WorkspaceTimelineTab';
import { WorkspaceFormsTab } from '@/features/workspace/components/tabs/WorkspaceFormsTab';
import { TaskDetailModal } from '@/features/task/components/task-detail-modal';
import { GlobalTaskModal } from '@/features/task/components/global-task-modal';
import { CreateWikiDocModal, WikiDocItem } from '@/features/project/components/create-wiki-doc-modal';
import { CreateWhiteboardModal, WhiteboardItem } from '@/features/project/components/create-whiteboard-modal';
import { RealtimeListener } from '@/features/realtime/components/realtime-listener';
import type { TaskDto } from '@/features/task/types';

type ProjectTab = 'summary' | 'backlog' | 'board' | 'timeline' | 'docs' | 'whiteboard' | 'forms';

export default function ProjectDetailPage({ params }: { params: Promise<{ projectId: string }> }) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.projectId;
  const { t } = useTranslation('workspace');

  const { data: project, isLoading: isProjectLoading } = useProjectDetails(projectId);
  const { data: stats } = useProjectStats(projectId);
  const { data: tasks = [], isLoading: isTasksLoading } = useProjectTasks(projectId);

  const [activeTab, setActiveTab] = useState<ProjectTab>('summary');
  const [selectedTask, setSelectedTask] = useState<TaskDto | null>(null);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isCreateWikiOpen, setIsCreateWikiOpen] = useState(false);
  const [isCreateWhiteboardOpen, setIsCreateWhiteboardOpen] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Detailed Modal View States
  const [selectedWikiDetail, setSelectedWikiDetail] = useState<WikiDocItem | null>(null);
  const [selectedWhiteboardDetail, setSelectedWhiteboardDetail] = useState<WhiteboardItem | null>(null);

  // Wiki Docs State for this project
  const [wikiDocs, setWikiDocs] = useState<WikiDocItem[]>([
    {
      id: 'wiki-1',
      title: 'Tài liệu Kiến trúc Hệ thống',
      category: 'Kỹ thuật',
      version: 'v2.1',
      summary: 'Sơ đồ tổng quan kiến trúc Microservices và RESTful API endpoints cho Dự án.',
      workspaceId: '',
      projectId: projectId,
      updatedAt: '2 giờ trước',
      updatedBy: 'Bạn (Quản lý)',
    },
    {
      id: 'wiki-2',
      title: 'Hướng dẫn Triển khai & CI/CD',
      category: 'Quy trình',
      version: 'v1.0',
      summary: 'Quy trình tự động hóa kiểm thử và đóng gói Docker container cho dự án.',
      workspaceId: '',
      projectId: projectId,
      updatedAt: '1 ngày trước',
      updatedBy: 'Quản trị viên',
    },
  ]);

  // Whiteboards State for this project
  const [whiteboards, setWhiteboards] = useState<WhiteboardItem[]>([
    {
      id: 'wb-1',
      title: 'Sơ đồ luồng người dùng (User Flow)',
      status: 'Đang hoạt động',
      description: 'Bảng vẽ các bước tương tác giao diện và thiết kế UX cho Dự án.',
      workspaceId: '',
      projectId: projectId,
      updatedAt: 'Hôm nay',
      activeMembersCount: 4,
    },
  ]);

  if (isProjectLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex h-64 items-center justify-center text-text-muted">
        Không tìm thấy thông tin Dự án.
      </div>
    );
  }

  const handleRealtimeTaskEvent = (payload: any) => {
    if (payload.projectId === projectId || payload.data?.projectId === projectId) {
      const actorName = payload.actorName || 'Thành viên';
      const actionText = payload.action === 'CREATE' ? 'vừa tạo một công việc mới' : 'vừa cập nhật dự án';
      setNotificationMsg(`🔔 [Dự án ${project.name}] ${actorName} ${actionText}!`);
      setTimeout(() => setNotificationMsg(null), 5000);
    }
  };

  const handleWikiCreated = (newDoc: WikiDocItem) => {
    setWikiDocs((prev) => [newDoc, ...prev]);
    setNotificationMsg(`📄 Đã tạo thành công tài liệu Wiki "${newDoc.title}" cho Dự án ${project.name}!`);
    setTimeout(() => setNotificationMsg(null), 5000);
  };

  const handleWhiteboardCreated = (newWb: WhiteboardItem) => {
    setWhiteboards((prev) => [newWb, ...prev]);
    setNotificationMsg(`🎨 Đã tạo thành công Bảng vẽ "${newWb.title}" cho Dự án ${project.name}!`);
    setTimeout(() => setNotificationMsg(null), 5000);
  };

  return (
    <RealtimeListener onTaskEvent={handleRealtimeTaskEvent}>
      <div className="space-y-6 text-text-primary">
        {/* Real-time Project Update Notification Toast Banner */}
        {notificationMsg && (
          <div className="flex items-center space-x-2 rounded-2xl border border-primary/30 bg-primary/10 p-4 text-xs font-bold text-primary shadow-md animate-in slide-in-from-top duration-300">
            <Bell className="h-4 w-4 animate-bounce" />
            <span>{notificationMsg}</span>
          </div>
        )}

        {/* Project Header Header */}
        <ProjectHeader 
          project={project}
          onOpenCreateTask={() => setIsCreateTaskOpen(true)}
        />

        {/* Tab Selector Navigation Bar */}
        <div className="flex items-center space-x-1.5 overflow-x-auto rounded-2xl border border-surface-border bg-surface p-1.5 text-xs font-bold text-text-secondary shadow-xs">
          <button
            onClick={() => setActiveTab('summary')}
            className={`flex items-center space-x-1.5 rounded-xl px-3.5 py-2 transition ${
              activeTab === 'summary'
                ? 'bg-primary text-white shadow-xs'
                : 'text-text-secondary hover:bg-surface-alt hover:text-text-primary'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Tổng quan Dự án</span>
          </button>

          <button
            onClick={() => setActiveTab('backlog')}
            className={`flex items-center space-x-1.5 rounded-xl px-3.5 py-2 transition ${
              activeTab === 'backlog'
                ? 'bg-primary text-white shadow-xs'
                : 'text-text-secondary hover:bg-surface-alt hover:text-text-primary'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Kế hoạch & Backlog</span>
          </button>

          <button
            onClick={() => setActiveTab('board')}
            className={`flex items-center space-x-1.5 rounded-xl px-3.5 py-2 transition ${
              activeTab === 'board'
                ? 'bg-primary text-white shadow-xs'
                : 'text-text-secondary hover:bg-surface-alt hover:text-text-primary'
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
            <span>Bảng Công Việc</span>
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex items-center space-x-1.5 rounded-xl px-3.5 py-2 transition ${
              activeTab === 'timeline'
                ? 'bg-primary text-white shadow-xs'
                : 'text-text-secondary hover:bg-surface-alt hover:text-text-primary'
            }`}
          >
            <GitCommitHorizontal className="h-4 w-4" />
            <span>Biểu đồ Tiến độ (Gantt)</span>
          </button>

          <button
            onClick={() => setActiveTab('docs')}
            className={`flex items-center space-x-1.5 rounded-xl px-3.5 py-2 transition ${
              activeTab === 'docs'
                ? 'bg-primary text-white shadow-xs'
                : 'text-text-secondary hover:bg-surface-alt hover:text-text-primary'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Kho Tài liệu Tri thức</span>
          </button>

          <button
            onClick={() => setActiveTab('whiteboard')}
            className={`flex items-center space-x-1.5 rounded-xl px-3.5 py-2 transition ${
              activeTab === 'whiteboard'
                ? 'bg-primary text-white shadow-xs'
                : 'text-text-secondary hover:bg-surface-alt hover:text-text-primary'
            }`}
          >
            <PenTool className="h-4 w-4" />
            <span>Bảng Vẽ Tư Duy</span>
          </button>

          <button
            onClick={() => setActiveTab('forms')}
            className={`flex items-center space-x-1.5 rounded-xl px-3.5 py-2 transition ${
              activeTab === 'forms'
                ? 'bg-primary text-white shadow-xs'
                : 'text-text-secondary hover:bg-surface-alt hover:text-text-primary'
            }`}
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Biểu mẫu Đăng ký</span>
          </button>
        </div>

        {/* Tab Content 1: Project Summary Overview */}
        {activeTab === 'summary' && (
          <div className="space-y-6">
            {/* Top Stat Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-surface-border bg-surface p-5 space-y-2 shadow-xs">
                <p className="text-xs font-semibold text-text-secondary">Tổng số công việc</p>
                <p className="text-2xl font-bold text-text-primary font-heading">{tasks.length}</p>
                <p className="text-[11px] text-text-secondary">Công việc trong dự án</p>
              </div>

              <div className="rounded-2xl border border-surface-border bg-surface p-5 space-y-2 shadow-xs">
                <p className="text-xs font-semibold text-text-secondary">Đã hoàn thành</p>
                <p className="text-2xl font-bold text-emerald-500 font-heading">
                  {tasks.filter((t) => t.status === 'COMPLETED' || t.status === 'DONE').length}
                </p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  {tasks.length > 0
                    ? Math.round(
                        (tasks.filter((t) => t.status === 'COMPLETED' || t.status === 'DONE').length / tasks.length) * 100
                      )
                    : 0}
                  % tiến độ dự án
                </p>
              </div>

              <div className="rounded-2xl border border-surface-border bg-surface p-5 space-y-2 shadow-xs">
                <p className="text-xs font-semibold text-text-secondary">Đang thực hiện</p>
                <p className="text-2xl font-bold text-primary font-heading">
                  {tasks.filter((t) => t.status === 'IN_PROGRESS').length}
                </p>
                <p className="text-[11px] text-text-secondary">Đang trong tiến trình</p>
              </div>

              <div className="rounded-2xl border border-surface-border bg-surface p-5 space-y-2 shadow-xs">
                <p className="text-xs font-semibold text-text-secondary">Cần xử lý (To Do)</p>
                <p className="text-2xl font-bold text-amber-500 font-heading">
                  {tasks.filter((t) => t.status === 'TODO').length}
                </p>
                <p className="text-[11px] text-text-secondary">Chưa bắt đầu</p>
              </div>
            </div>

            {/* Project Overview Details & Progress Cards */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Left Column: Description & Metadata */}
              <div className="lg:col-span-2 space-y-6">
                <div className="rounded-2xl border border-surface-border bg-surface p-6 space-y-4 shadow-xs">
                  <h3 className="text-base font-bold text-text-primary font-heading border-b border-surface-border pb-3">
                    Mô tả & Mục tiêu Dự án
                  </h3>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
                    {project.description || 'Chưa có mô tả cụ thể cho dự án này. Quản trị viên dự án có thể cập nhật thông tin trong phần Cài đặt.'}
                  </p>
                </div>

                {/* Status breakdown bar */}
                <div className="rounded-2xl border border-surface-border bg-surface p-6 space-y-4 shadow-xs">
                  <h3 className="text-base font-bold text-text-primary font-heading border-b border-surface-border pb-3">
                    Phân bổ Trạng thái Công việc
                  </h3>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span>Hoàn thành (Done)</span>
                        <span className="text-emerald-500 font-bold">
                          {tasks.filter((t) => t.status === 'COMPLETED' || t.status === 'DONE').length} công việc
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-surface-alt overflow-hidden">
                        <div
                          className="h-full bg-emerald-500"
                          style={{
                            width: `${
                              tasks.length > 0
                                ? (tasks.filter((t) => t.status === 'COMPLETED' || t.status === 'DONE').length / tasks.length) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span>Đang thực hiện (In Progress)</span>
                        <span className="text-primary font-bold">
                          {tasks.filter((t) => t.status === 'IN_PROGRESS').length} công việc
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-surface-alt overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{
                            width: `${
                              tasks.length > 0
                                ? (tasks.filter((t) => t.status === 'IN_PROGRESS').length / tasks.length) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span>Cần làm (To Do)</span>
                        <span className="text-amber-500 font-bold">
                          {tasks.filter((t) => t.status === 'TODO').length} công việc
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-surface-alt overflow-hidden">
                        <div
                          className="h-full bg-amber-500"
                          style={{
                            width: `${
                              tasks.length > 0
                                ? (tasks.filter((t) => t.status === 'TODO').length / tasks.length) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Priority & Quick Info */}
              <div className="space-y-6">
                <div className="rounded-2xl border border-surface-border bg-surface p-6 space-y-4 shadow-xs">
                  <h3 className="text-base font-bold text-text-primary font-heading border-b border-surface-border pb-3">
                    Phân cấp Mức độ Ưu tiên
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-red-500 font-bold">Khẩn cấp</span>
                        <span>{tasks.filter((t) => t.priority === 'URGENT').length} công việc</span>
                      </div>
                      <div className="h-2 rounded-full bg-surface-alt overflow-hidden">
                        <div
                          className="h-full bg-red-500"
                          style={{
                            width: `${
                              tasks.length > 0
                                ? (tasks.filter((t) => t.priority === 'URGENT').length / tasks.length) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-amber-500 font-bold">Cao</span>
                        <span>{tasks.filter((t) => t.priority === 'HIGH').length} công việc</span>
                      </div>
                      <div className="h-2 rounded-full bg-surface-alt overflow-hidden">
                        <div
                          className="h-full bg-amber-500"
                          style={{
                            width: `${
                              tasks.length > 0
                                ? (tasks.filter((t) => t.priority === 'HIGH').length / tasks.length) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-blue-500 font-bold">Trung bình</span>
                        <span>{tasks.filter((t) => t.priority === 'MEDIUM' || !t.priority).length} công việc</span>
                      </div>
                      <div className="h-2 rounded-full bg-surface-alt overflow-hidden">
                        <div
                          className="h-full bg-blue-500"
                          style={{
                            width: `${
                              tasks.length > 0
                                ? (tasks.filter((t) => t.priority === 'MEDIUM' || !t.priority).length / tasks.length) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-400 font-bold">Thấp</span>
                        <span>{tasks.filter((t) => t.priority === 'LOW').length} công việc</span>
                      </div>
                      <div className="h-2 rounded-full bg-surface-alt overflow-hidden">
                        <div
                          className="h-full bg-slate-400"
                          style={{
                            width: `${
                              tasks.length > 0
                                ? (tasks.filter((t) => t.priority === 'LOW').length / tasks.length) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 2: Sprint & Backlog */}
        {activeTab === 'backlog' && (
          <WorkspaceBacklogTab
            tasks={tasks}
            isLoading={isTasksLoading}
            onOpenCreateTask={() => setIsCreateTaskOpen(true)}
            onSelectTask={(task) => setSelectedTask(task)}
          />
        )}

        {/* Tab Content 3: Kanban Board */}
        {activeTab === 'board' && (
          <WorkspaceBoardTab
            tasks={tasks}
            isLoading={isTasksLoading}
            onOpenCreateTask={() => setIsCreateTaskOpen(true)}
            onSelectTask={(task) => setSelectedTask(task)}
          />
        )}

        {/* Tab Content 4: Timeline / Gantt */}
        {activeTab === 'timeline' && (
          <WorkspaceTimelineTab
            tasks={tasks}
            isLoading={isTasksLoading}
            onOpenCreateTask={() => setIsCreateTaskOpen(true)}
            onSelectTask={(task) => setSelectedTask(task)}
          />
        )}

        {/* Tab Content 5: Project-Bound Docs / Wiki */}
        {activeTab === 'docs' && (
          <div className="rounded-2xl border border-surface-border bg-surface p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-surface-border pb-4">
              <div>
                <h3 className="text-base font-bold text-text-primary font-heading flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <span>Kho Tài Liệu Tri Thức Dự Án ({project.name})</span>
                </h3>
                <p className="text-xs text-text-secondary">Tài liệu phân cấp và lịch sử chỉnh sửa thuộc Dự án này</p>
              </div>

              <button
                type="button"
                onClick={() => setIsCreateWikiOpen(true)}
                className="flex items-center space-x-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-primary-hover transition active:scale-95 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Tạo tài liệu mới</span>
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {wikiDocs.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => setSelectedWikiDetail(doc)}
                  className="rounded-2xl border border-surface-border bg-surface-alt/40 p-4 space-y-3 hover:border-primary/50 hover:bg-surface-alt transition cursor-pointer group shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-text-primary group-hover:text-primary transition truncate pr-2">
                      📄 {doc.title}
                    </span>
                    <span className="text-[10px] font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20 shrink-0 font-mono">
                      {doc.version}
                    </span>
                  </div>

                  <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                    {doc.summary}
                  </p>

                  <div className="space-y-1.5 border-t border-surface-border/60 pt-2.5 text-[11px] text-text-secondary font-medium">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-primary font-bold">Dự án: {project.name} #{project.key || 'PRJ'}</span>
                      <span className="rounded-md bg-surface border border-surface-border px-1.5 py-0.5 text-text-muted">{doc.category}</span>
                    </div>

                    <div className="flex items-center justify-between text-text-muted text-[10px]">
                      <span>Khởi tạo: {doc.updatedBy}</span>
                      <span>{doc.updatedAt}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Content 6: Project-Bound Whiteboard Canvas */}
        {activeTab === 'whiteboard' && (
          <div className="rounded-2xl border border-surface-border bg-surface p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-surface-border pb-4">
              <div>
                <h3 className="text-base font-bold text-text-primary font-heading flex items-center space-x-2">
                  <PenTool className="h-5 w-5 text-primary" />
                  <span>Bảng Vẽ Phác Thảo Tư Duy ({project.name})</span>
                </h3>
                <p className="text-xs text-text-secondary">Không gian cộng tác vẽ trực quan dành riêng cho thành viên Dự án này</p>
              </div>

              <button
                type="button"
                onClick={() => setIsCreateWhiteboardOpen(true)}
                className="flex items-center space-x-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-primary-hover transition active:scale-95 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Tạo bảng vẽ mới</span>
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {whiteboards.map((wb) => (
                <div
                  key={wb.id}
                  onClick={() => setSelectedWhiteboardDetail(wb)}
                  className="rounded-xl border border-surface-border bg-surface-alt/40 p-4 space-y-2 hover:border-primary/40 hover:bg-surface-alt transition cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-text-primary">
                    <span className="truncate pr-2">🎨 {wb.title}</span>
                    <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-500 shrink-0">{wb.status}</span>
                  </div>
                  <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">{wb.description}</p>
                  <div className="pt-2 text-[10px] text-text-muted flex justify-between border-t border-surface-border/50">
                    <span>Sửa đổi: {wb.updatedAt}</span>
                    <span>{wb.activeMembersCount} thành viên đang xem</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Content 7: Forms */}
        {activeTab === 'forms' && (
          <WorkspaceFormsTab
            workspaceId={project.workspaceId || ''}
          />
        )}

        {/* Task Detail Modal */}
        <TaskDetailModal
          task={selectedTask}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
        />

        {/* Global Create Task Modal (Bound directly to this Project!) */}
        <GlobalTaskModal
          isOpen={isCreateTaskOpen}
          onClose={() => setIsCreateTaskOpen(false)}
          defaultProjectId={projectId}
        />

        {/* Create Wiki Doc Dedicated Modal */}
        <CreateWikiDocModal
          isOpen={isCreateWikiOpen}
          onClose={() => setIsCreateWikiOpen(false)}
          defaultWorkspaceId={project.workspaceId}
          defaultProjectId={projectId}
          onCreated={handleWikiCreated}
        />

        {/* Create Whiteboard Dedicated Modal */}
        <CreateWhiteboardModal
          isOpen={isCreateWhiteboardOpen}
          onClose={() => setIsCreateWhiteboardOpen(false)}
          defaultWorkspaceId={project.workspaceId}
          defaultProjectId={projectId}
          onCreated={handleWhiteboardCreated}
        />

        {/* Detailed View Modal for Wiki Document */}
        {selectedWikiDetail && (
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setSelectedWikiDetail(null)}
          >
            <div
              className="relative my-auto w-full max-w-xl rounded-2xl border border-surface-border bg-surface p-6 shadow-2xl space-y-5 text-text-primary max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-surface-border pb-4">
                <div className="flex items-center space-x-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-base font-bold text-text-primary font-heading">
                        {selectedWikiDetail.title}
                      </h3>
                      <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary border border-primary/20">
                        {selectedWikiDetail.version || 'v1.0'}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Phân loại: <span className="font-semibold text-primary">{selectedWikiDetail.category}</span>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedWikiDetail(null)}
                  className="rounded-lg p-1.5 text-text-muted hover:bg-surface-alt hover:text-text-primary transition cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Metadata Grid */}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-xl border border-surface-border bg-surface-alt/50 p-3 space-y-0.5">
                  <p className="text-[10px] text-text-muted font-medium">Dự án áp dụng</p>
                  <p className="text-xs font-bold text-primary truncate">
                    {project.name} #{project.key || 'PRJ'}
                  </p>
                </div>

                <div className="rounded-xl border border-surface-border bg-surface-alt/50 p-3 space-y-0.5">
                  <p className="text-[10px] text-text-muted font-medium">Người tạo / Cập nhật</p>
                  <p className="text-xs font-bold text-text-primary truncate">
                    {selectedWikiDetail.updatedBy || 'Bạn (Quản lý)'}
                  </p>
                </div>

                <div className="rounded-xl border border-surface-border bg-surface-alt/50 p-3 space-y-0.5">
                  <p className="text-[10px] text-text-muted font-medium">Thời gian cập nhật</p>
                  <p className="text-xs font-bold text-text-primary">
                    {selectedWikiDetail.updatedAt}
                  </p>
                </div>
              </div>

              {/* Summary Box */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">Tóm tắt tài liệu</h4>
                <div className="rounded-xl border border-surface-border bg-surface-alt/40 p-4 text-xs text-text-secondary leading-relaxed">
                  {selectedWikiDetail.summary || 'Chưa có nội dung tóm tắt chi tiết cho tài liệu này.'}
                </div>
              </div>

              {/* Document Actions */}
              <div className="flex items-center justify-end space-x-2 border-t border-surface-border pt-4">
                <button
                  type="button"
                  onClick={() => setSelectedWikiDetail(null)}
                  className="rounded-xl border border-surface-border px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-surface-alt transition cursor-pointer"
                >
                  Đóng
                </button>
                <Link
                  href={`/workspaces/${project.workspaceId || 'ws-default'}/wiki`}
                  className="flex items-center space-x-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-primary-hover transition active:scale-95"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Mở trình soạn thảo Wiki</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Detailed View Modal for Whiteboard */}
        {selectedWhiteboardDetail && (
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setSelectedWhiteboardDetail(null)}
          >
            <div
              className="relative my-auto w-full max-w-xl rounded-2xl border border-surface-border bg-surface p-6 shadow-2xl space-y-5 text-text-primary max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-surface-border pb-4">
                <div className="flex items-center space-x-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <PenTool className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-base font-bold text-text-primary font-heading">
                        {selectedWhiteboardDetail.title}
                      </h3>
                      <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-500 border border-emerald-500/20">
                        {selectedWhiteboardDetail.status || 'Đang hoạt động'}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Bảng vẽ sơ đồ tư duy cộng tác thuộc Dự án
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedWhiteboardDetail(null)}
                  className="rounded-lg p-1.5 text-text-muted hover:bg-surface-alt hover:text-text-primary transition cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Metadata Grid */}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-xl border border-surface-border bg-surface-alt/50 p-3 space-y-0.5">
                  <p className="text-[10px] text-text-muted font-medium">Dự án áp dụng</p>
                  <p className="text-xs font-bold text-primary truncate">
                    {project.name} #{project.key || 'PRJ'}
                  </p>
                </div>

                <div className="rounded-xl border border-surface-border bg-surface-alt/50 p-3 space-y-0.5">
                  <p className="text-[10px] text-text-muted font-medium">Thành viên đang xem</p>
                  <p className="text-xs font-bold text-text-primary">
                    {selectedWhiteboardDetail.activeMembersCount || 1} thành viên
                  </p>
                </div>

                <div className="rounded-xl border border-surface-border bg-surface-alt/50 p-3 space-y-0.5">
                  <p className="text-[10px] text-text-muted font-medium">Cập nhật lần cuối</p>
                  <p className="text-xs font-bold text-text-primary">
                    {selectedWhiteboardDetail.updatedAt}
                  </p>
                </div>
              </div>

              {/* Description Box */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">Mô tả ý tưởng bảng vẽ</h4>
                <div className="rounded-xl border border-surface-border bg-surface-alt/40 p-4 text-xs text-text-secondary leading-relaxed">
                  {selectedWhiteboardDetail.description || 'Bảng vẽ trực quan phác thảo các khối sơ đồ kiến trúc và quy trình làm việc.'}
                </div>
              </div>

              {/* Canvas Preview Box */}
              <div
                className="flex h-40 w-full flex-col items-center justify-center rounded-xl border border-dashed border-surface-border bg-surface-alt/30 p-4 text-center space-y-2"
                style={{
                  backgroundImage: 'radial-gradient(circle, rgba(100, 80, 240, 0.15) 1px, transparent 1px)',
                  backgroundSize: '16px 16px',
                }}
              >
                <PenTool className="h-6 w-6 text-primary/60" />
                <div>
                  <p className="text-xs font-bold text-text-primary">Không gian phác thảo sơ đồ trực tiếp</p>
                  <p className="text-[11px] text-text-secondary">Bấm nút bên dưới để mở giao diện vẽ canvas</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-2 border-t border-surface-border pt-4">
                <button
                  type="button"
                  onClick={() => setSelectedWhiteboardDetail(null)}
                  className="rounded-xl border border-surface-border px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-surface-alt transition cursor-pointer"
                >
                  Đóng
                </button>
                <Link
                  href={`/workspaces/${project.workspaceId || 'ws-default'}/whiteboards`}
                  className="flex items-center space-x-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-primary-hover transition active:scale-95"
                >
                  <PenTool className="h-4 w-4" />
                  <span>Mở giao diện Chỉnh sửa Bảng vẽ</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </RealtimeListener>
  );
}
