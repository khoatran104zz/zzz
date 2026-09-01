'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Plus, Folder, Star, Archive, CheckSquare, ArrowRight } from 'lucide-react';
import { useProjects } from '@/features/project/hooks/use-project';
import { CreateProjectDialog } from '@/features/project/components/create-project-dialog';

interface WorkspaceProjectsTabProps {
  workspaceId: string;
}

type FilterType = 'all' | 'favorites' | 'archived';

export function WorkspaceProjectsTab({ workspaceId }: WorkspaceProjectsTabProps) {
  const router = useRouter();
  const { t } = useTranslation('project');
  const { t: tCommon } = useTranslation('common');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const filterParams = {
    archived: activeFilter === 'archived' ? true : undefined,
    favorite: activeFilter === 'favorites' ? true : undefined,
  };

  const { data: projects = [], isLoading } = useProjects(workspaceId, filterParams);

  return (
    <div className="space-y-6 text-text-primary pb-12">
      {/* Header & Filter Bar */}
      <div className="flex items-center justify-between border-b border-surface-border pb-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-text-primary font-heading flex items-center space-x-2">
            <Folder className="h-5 w-5 text-primary" />
            <span>{t('title', { defaultValue: 'Danh sách Dự án' })}</span>
          </h2>
          <p className="text-xs text-text-secondary">
            {t('subtitle', { defaultValue: 'Quản lý và theo dõi danh sách các dự án trong Không gian làm việc' })}
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center space-x-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-primary-hover transition active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>{t('createProject', { defaultValue: 'Tạo dự án mới' })}</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setActiveFilter('all')}
          className={`flex items-center space-x-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
            activeFilter === 'all'
              ? 'bg-primary/20 text-primary border border-primary/30 shadow-2xs'
              : 'text-text-muted hover:bg-surface-alt hover:text-text-primary'
          }`}
        >
          <Folder className="h-3.5 w-3.5" />
          <span>{t('allProjects', { defaultValue: 'Tất cả dự án' })} ({projects.length})</span>
        </button>

        <button
          onClick={() => setActiveFilter('favorites')}
          className={`flex items-center space-x-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
            activeFilter === 'favorites'
              ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30 shadow-2xs'
              : 'text-text-muted hover:bg-surface-alt hover:text-text-primary'
          }`}
        >
          <Star className="h-3.5 w-3.5" />
          <span>{t('favorites', { defaultValue: 'Yêu thích' })}</span>
        </button>

        <button
          onClick={() => setActiveFilter('archived')}
          className={`flex items-center space-x-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
            activeFilter === 'archived'
              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30 shadow-2xs'
              : 'text-text-muted hover:bg-surface-alt hover:text-text-primary'
          }`}
        >
          <Archive className="h-3.5 w-3.5" />
          <span>{t('archived', { defaultValue: 'Lưu trữ' })}</span>
        </button>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-44 animate-pulse rounded-2xl bg-surface-alt/60" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="flex h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-surface-border bg-surface/40 p-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Folder className="h-6 w-6" />
          </div>
          <h3 className="mt-3 text-sm font-bold text-text-primary font-heading">
            {t('noProjects', { defaultValue: 'Chưa có dự án nào' })}
          </h3>
          <p className="mt-1 text-xs text-text-muted max-w-sm">
            {t('noProjectsDesc', { defaultValue: 'Tạo dự án mới để bắt đầu lập kế hoạch Sprint, quản lý Backlog và phân công công việc.' })}
          </p>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="mt-4 flex items-center space-x-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-hover transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{t('createProjectNow', { defaultValue: 'Tạo dự án ngay' })}</span>
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const rawKey = project.key || (project.name ? project.name.substring(0, 3).toUpperCase() : 'PRJ');
            const projectKey = rawKey.substring(0, 3).toUpperCase();
            const projectColor = project.color || '#6366f1';

            return (
              <div
                key={project.id}
                onClick={() => router.push(`/projects/${project.id}`)}
                className="group relative flex flex-col justify-between rounded-2xl border border-surface-border bg-surface p-5 shadow-xs transition hover:border-primary/50 hover:shadow-lg cursor-pointer space-y-4 overflow-hidden"
              >
                {/* Top Color Indicator Accent */}
                <div
                  className="absolute top-0 left-0 right-0 h-1 transition-all group-hover:h-1.5"
                  style={{ backgroundColor: projectColor }}
                />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-xl font-bold text-white text-xs shadow-xs"
                        style={{ backgroundColor: projectColor }}
                      >
                        <Folder className="h-4 w-4" />
                      </div>
                      <span className="rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-extrabold text-primary font-mono tracking-wider">
                        #{projectKey}
                      </span>
                    </div>

                    <ArrowRight className="h-4 w-4 text-text-muted transition group-hover:translate-x-1 group-hover:text-primary" />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-text-primary font-heading group-hover:text-primary transition line-clamp-1">
                      {project.name}
                    </h3>
                    <p className="mt-1 text-xs text-text-secondary line-clamp-2 leading-relaxed">
                      {project.description || t('defaultDescription', { defaultValue: 'Dự án quản lý công việc và Sprint Backlog' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-surface-border/60 pt-3 text-[11px] text-text-secondary font-medium">
                  <div className="flex items-center space-x-1.5 text-xs font-semibold text-text-secondary">
                    <CheckSquare className="h-3.5 w-3.5 text-primary" />
                    <span>Scrum & Backlog</span>
                  </div>
                  <span className="text-primary font-bold group-hover:underline text-xs flex items-center space-x-1">
                    <span>{t('openProject', { defaultValue: 'Mở Dự án' })}</span>
                    <span>→</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CreateProjectDialog
        workspaceId={workspaceId}
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </div>
  );
}
