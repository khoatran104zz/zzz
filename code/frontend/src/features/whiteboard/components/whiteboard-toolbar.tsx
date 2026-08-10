'use client';

import React from 'react';
import { MousePointer, StickyNote, Square, Circle, ArrowUpRight, Trash2, Save, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { WhiteboardElementType } from '../types';

interface WhiteboardToolbarProps {
  activeTool: 'SELECT' | WhiteboardElementType;
  onSelectTool: (tool: 'SELECT' | WhiteboardElementType) => void;
  onDeleteSelected?: () => void;
  onSaveCanvas: () => void;
  isSaving?: boolean;
}

export function WhiteboardToolbar({
  activeTool,
  onSelectTool,
  onDeleteSelected,
  onSaveCanvas,
  isSaving,
}: WhiteboardToolbarProps) {
  const { t } = useTranslation('whiteboard');
  const { t: tCommon } = useTranslation('common');

  const tools: { id: 'SELECT' | WhiteboardElementType; label: string; icon: React.ElementType }[] = [
    { id: 'SELECT', label: 'Chọn', icon: MousePointer },
    { id: 'STICKY_NOTE', label: 'Ghi chú', icon: StickyNote },
    { id: 'SHAPE_RECT', label: 'Hình chữ nhật', icon: Square },
    { id: 'SHAPE_CIRCLE', label: 'Hình tròn', icon: Circle },
    { id: 'CONNECTOR', label: 'Đường nối', icon: ArrowUpRight },
  ];

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-1.5 rounded-2xl border border-surface-border bg-surface/90 p-1.5 shadow-2xl backdrop-blur-md">
      {tools.map((item) => {
        const Icon = item.icon;
        const isActive = activeTool === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelectTool(item.id)}
            className={`flex items-center space-x-1.5 rounded-xl px-3 py-2 text-xs font-bold transition ${
              isActive
                ? 'bg-primary text-white shadow-xs'
                : 'text-text-secondary hover:bg-surface-alt hover:text-text-primary'
            }`}
            title={item.label}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden md:inline">{item.label}</span>
          </button>
        );
      })}

      <div className="h-5 w-px bg-surface-border mx-1" />

      {onDeleteSelected && (
        <button
          onClick={onDeleteSelected}
          className="rounded-xl border border-status-error/30 bg-status-error/10 p-2 text-status-error hover:bg-status-error/20 transition"
          title="Xóa phần tử đã chọn"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}

      <button
        onClick={onSaveCanvas}
        disabled={isSaving}
        className="flex items-center space-x-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-primary-hover disabled:opacity-50 transition"
      >
        {isSaving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        <span>Lưu bảng vẽ</span>
      </button>
    </div>
  );
}
