'use client';

import React from 'react';
import Link from 'next/link';
import { Star, Folder, Settings, Archive } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ProjectDto } from '../types';
import { useToggleFavoriteProject } from '../hooks/use-project';

interface ProjectHeaderProps {
  project: ProjectDto;
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
  const { t } = useTranslation('project');
  const { t: tCommon } = useTranslation('common');
  const toggleFavorite = useToggleFavoriteProject();

  return (
    <div className="relative overflow-hidden rounded-2xl border border-surface-border bg-surface p-6 shadow-xs text-text-primary">
      <div
        className="absolute left-0 top-0 h-1.5 w-full"
        style={{ backgroundColor: project.color || '#6366f1' }}
      />

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center space-x-4">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl text-white font-bold shadow-md shrink-0"
            style={{ backgroundColor: project.color || '#6366f1' }}
          >
            <Folder className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-text-primary font-heading">{project.name}</h1>
              {project.key && (
                <span className="rounded-md border border-primary/20 bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary font-mono">
                  #{project.key}
                </span>
              )}
              {project.isArchived && (
                <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-500 border border-amber-500/20">
                  <Archive className="mr-1 h-3 w-3" /> {t('archived', { defaultValue: 'Lưu trữ' })}
                </span>
              )}
            </div>
            <p className="text-xs text-text-muted mt-1 max-w-xl">
              {project.description || t('noDescription', { defaultValue: 'Dự án quản lý công việc và Sprint Backlog.' })}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => toggleFavorite.mutate(project.id)}
            className={`flex items-center space-x-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition active:scale-95 ${
              project.isFavorite
                ? 'border-amber-500/30 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20'
                : 'border-surface-border bg-surface-alt text-text-secondary hover:text-text-primary hover:bg-surface-alt/80'
            }`}
          >
            <Star className={`h-4 w-4 ${project.isFavorite ? 'fill-amber-500' : ''}`} />
            <span>{project.isFavorite ? t('favorited', { defaultValue: 'Đã yêu thích' }) : t('favorite', { defaultValue: 'Yêu thích' })}</span>
          </button>

          <Link
            href={`/projects/${project.id}/settings` as any}
            className="flex items-center space-x-1.5 rounded-xl border border-surface-border bg-surface-alt px-3.5 py-2 text-xs font-bold text-text-secondary hover:text-text-primary hover:bg-surface-alt/80 transition active:scale-95"
          >
            <Settings className="h-4 w-4" />
            <span>{tCommon('actions.settings', { defaultValue: 'Cài đặt Dự án' })}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
