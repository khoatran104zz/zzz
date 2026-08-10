'use client';

import React, { useState } from 'react';
import { X, History, Clock } from 'lucide-react';
import type { WikiPageVersionDto } from '../types';

interface VersionHistoryDialogProps {
  versions: WikiPageVersionDto[];
  isOpen: boolean;
  onClose: () => void;
}

export function VersionHistoryDialog({ versions, isOpen, onClose }: VersionHistoryDialogProps) {
  const [selectedVersion, setSelectedVersion] = useState<WikiPageVersionDto | null>(null);

  if (!isOpen) return null;

  const activeVersion = selectedVersion || versions[0] || null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-3xl rounded-2xl border border-surface-border bg-surface p-6 shadow-2xl text-text-primary">
        <div className="flex items-center justify-between border-b border-surface-border pb-4">
          <div className="flex items-center space-x-2">
            <History className="h-5 w-5 text-primary" />
            <h3 className="text-base font-extrabold text-text-primary font-heading">Lịch sử phiên bản tài liệu</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-text-muted hover:bg-surface-alt hover:text-text-primary transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 flex h-[400px] overflow-hidden rounded-xl border border-surface-border bg-surface-alt/40">
          {/* Left Version List */}
          <div className="w-56 shrink-0 border-r border-surface-border bg-surface overflow-y-auto p-2 divide-y divide-surface-border/40">
            {versions.length === 0 ? (
              <p className="p-4 text-center text-xs text-text-muted italic">Chưa có phiên bản nào</p>
            ) : (
              versions.map((v) => (
                <div
                  key={v.id}
                  onClick={() => setSelectedVersion(v)}
                  className={`p-2.5 rounded-xl cursor-pointer transition text-xs ${
                    activeVersion?.id === v.id
                      ? 'bg-primary/10 text-primary font-bold border border-primary/20'
                      : 'text-text-secondary hover:bg-surface-alt hover:text-text-primary'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-text-primary">Phiên bản {v.version}</span>
                    <div className="flex items-center space-x-1 text-[10px] text-text-muted">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(v.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                  <p className="mt-1 text-[11px] text-text-muted truncate">{v.changeSummary || 'Cập nhật nội dung'}</p>
                </div>
              ))
            )}
          </div>

          {/* Right Snapshot Content View */}
          <div className="flex-1 p-4 overflow-y-auto">
            {activeVersion ? (
              <div className="space-y-3">
                <div className="border-b border-surface-border pb-2">
                  <h4 className="text-sm font-extrabold text-text-primary font-heading">{activeVersion.title}</h4>
                  <p className="text-[10px] text-text-muted mt-0.5">
                    Đã lưu vào {new Date(activeVersion.createdAt).toLocaleString('vi-VN')}
                  </p>
                </div>
                <div className="text-xs text-text-primary whitespace-pre-wrap font-mono leading-relaxed">
                  {activeVersion.content || <span className="text-text-muted italic">Không có nội dung</span>}
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-text-muted italic">
                Chọn một phiên bản để xem nội dung tại thời điểm đó
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
