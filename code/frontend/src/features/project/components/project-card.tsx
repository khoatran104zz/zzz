'use client';

import React from 'react';
import Link from 'next/link';
import { Star, Folder, Archive, Settings, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ProjectDto } from '../types';
import { useToggleFavoriteProject } from '../hooks/use-project';

interface ProjectCardProps {
  project: ProjectDto;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const { t } = useTranslation('project');
  const { t: tCommon } = useTranslation('common');
  const toggleFavorite = useToggleFavoriteProject();

  return (
    <div className="relative flex flex-col justify-between rounded-2xl border border-surface-border bg-surface p-5 shadow-xs transition hover:border-primary/40 hover:shadow-md text-text-primary">
      <div>
        {/* Color Bar Accent */}
        <div
          className="absolute left-0 top-0 h-1.5 w-full rounded-t-2xl"
          style={{ backgroundColor: project.color || '#6366f1' }}
        />

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center space-x-2.5">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl font-bold text-white shadow-md"
              style={{ backgroundColor: project.color || '#6366f1' }}
            >
              <Folder className="h-4 w-4" />
            </div>
            <div>
              <Link
                href={`/projects/${project.id}` as any}
                className="text-sm font-bold text-text-primary font-heading hover:text-primary transition"
              >
                {project.name}
              </Link>
              {project.isArchived && (
                <span className="ml-2 inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-500 border border-amber-500/20">
                  <Archive className="mr-1 h-3 w-3" /> {t('archived', { defaultValue: 'Lưu trữ' })}
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => toggleFavorite.mutate(project.id)}
            title={project.isFavorite ? 'Yêu thích' : 'Bỏ yêu thích'}
            className={`rounded-lg p-1.5 transition ${
              project.isFavorite
                ? 'text-amber-400 hover:bg-amber-500/10'
                : 'text-text-muted hover:bg-surface-alt hover:text-text-primary'
            }`}
          >
            <Star className={`h-4 w-4 ${project.isFavorite ? 'fill-amber-400' : ''}`} />
          </button>
        </div>

        <p className="mt-3 line-clamp-2 text-xs text-text-muted">
          {project.description || t('noDescription', { defaultValue: 'Chưa có mô tả chi tiết cho dự án.' })}
        </p>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-surface-border/60 pt-3 text-xs">
        <span className="text-[10px] text-text-muted font-mono">
          {project.key ? `#${project.key}` : ''}
        </span>

        <div className="flex items-center space-x-2">
          <Link
            href={`/projects/${project.id}/settings` as any}
            className="rounded-lg p-1.5 text-text-muted hover:bg-surface-alt hover:text-text-primary transition"
            title={tCommon('actions.edit', { defaultValue: 'Cài đặt' })}
          >
            <Settings className="h-4 w-4" />
          </Link>
          <Link
            href={`/projects/${project.id}` as any}
            className="flex items-center space-x-1 rounded-xl bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary border border-primary/20 hover:bg-primary hover:text-white transition active:scale-95"
          >
            <span>{tCommon('actions.open', { defaultValue: 'Mở dự án' })}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
