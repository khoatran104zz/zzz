'use client';

import React from 'react';
import { BarChart3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ProductivityStatsDto } from '../types';

interface ProductivityChartProps {
  stats: ProductivityStatsDto[];
}

export function ProductivityChart({ stats }: ProductivityChartProps) {
  const { t: tDash } = useTranslation('dashboard');

  const maxVal = Math.max(...stats.map((s) => Math.max(s.completedCount, s.createdCount, 1)));

  return (
    <div className="rounded-2xl border border-surface-border bg-surface p-5 shadow-xs space-y-4 text-text-primary">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-surface-border pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-xs">
            <BarChart3 className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-text-primary font-heading">
              {tDash('productivity.title', { defaultValue: 'Tóm tắt Năng suất Làm việc' })}
            </h3>
            <p className="text-xs text-text-secondary">
              {tDash('productivity.subtitle', { defaultValue: 'Số công việc hoàn thành và tạo mới (7 ngày qua)' })}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-xs font-semibold">
          <div className="flex items-center space-x-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-status-success" />
            <span className="text-text-secondary">
              {tDash('productivity.completed', { defaultValue: 'Hoàn thành' })}
            </span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-primary" />
            <span className="text-text-secondary">
              {tDash('productivity.created', { defaultValue: 'Tạo mới' })}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 pt-6 pb-2 items-end h-48">
        {stats.map((s) => {
          const completedHeight = Math.round((s.completedCount / maxVal) * 100);
          const createdHeight = Math.round((s.createdCount / maxVal) * 100);
          const dateObj = new Date(s.date);
          const dateLabel = dateObj.toLocaleDateString('vi-VN', { weekday: 'short' });

          return (
            <div key={s.date} className="flex flex-col items-center space-y-2 h-full justify-end">
              <div className="flex items-end space-x-1.5 h-32 w-full justify-center">
                <div
                  style={{ height: `${Math.max(completedHeight, 8)}%` }}
                  className="w-3.5 rounded-t-md bg-status-success transition-all duration-500 hover:brightness-110 shadow-xs"
                  title={`Đã hoàn thành: ${s.completedCount}`}
                />
                <div
                  style={{ height: `${Math.max(createdHeight, 8)}%` }}
                  className="w-3.5 rounded-t-md bg-primary transition-all duration-500 hover:brightness-110 shadow-xs"
                  title={`Đã tạo mới: ${s.createdCount}`}
                />
              </div>
              <span className="text-[10px] font-bold text-text-muted capitalize">{dateLabel}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
