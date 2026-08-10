'use client';

import React from 'react';
import { FileText, Image as ImageIcon, FileArchive, Download, Trash2, Eye } from 'lucide-react';
import type { AttachmentDto } from '../types';

interface AttachmentItemProps {
  attachment: AttachmentDto;
  onPreview?: (attachment: AttachmentDto) => void;
  onDelete: (id: string) => void;
}

export function AttachmentItem({ attachment, onPreview, onDelete }: AttachmentItemProps) {
  const formatBytes = (bytes?: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const isImage = attachment.mimeType?.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(attachment.fileExtension?.toLowerCase() || '');

  const getFileIcon = () => {
    if (isImage) return <ImageIcon className="h-4 w-4 text-emerald-500" />;
    if (attachment.fileExtension === 'zip' || attachment.fileExtension === 'rar') {
      return <FileArchive className="h-4 w-4 text-amber-500" />;
    }
    return <FileText className="h-4 w-4 text-primary" />;
  };

  return (
    <div className="group flex items-center justify-between rounded-xl border border-surface-border bg-surface p-2.5 text-xs transition hover:bg-surface-alt shadow-xs">
      <div className="flex items-center space-x-2.5 min-w-0 flex-1">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-alt border border-surface-border">
          {getFileIcon()}
        </div>

        <div className="min-w-0 flex-1 space-y-0.5">
          <p className="font-bold text-text-primary truncate text-xs">{attachment.fileName}</p>
          <p className="text-[10px] text-text-muted">{formatBytes(attachment.fileSize)}</p>
        </div>
      </div>

      <div className="flex items-center space-x-1 ml-2">
        {isImage && onPreview && (
          <button
            type="button"
            onClick={() => onPreview(attachment)}
            className="rounded-md p-1.5 text-text-muted hover:bg-surface-alt hover:text-primary transition"
            title="Xem trước hình ảnh"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
        )}

        <a
          href={attachment.fileUrl}
          download={attachment.fileName}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md p-1.5 text-text-muted hover:bg-surface-alt hover:text-text-primary transition"
          title="Tải về tập tin"
        >
          <Download className="h-3.5 w-3.5" />
        </a>

        <button
          type="button"
          onClick={() => onDelete(attachment.id)}
          className="rounded-md p-1.5 text-text-muted hover:bg-status-error/10 hover:text-status-error transition"
          title="Xóa đính kèm"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
