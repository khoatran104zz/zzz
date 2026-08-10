'use client';

import React, { useState } from 'react';
import { Paperclip } from 'lucide-react';
import type { AttachmentDto } from '../types';
import { useTaskAttachments, useDeleteAttachment } from '../hooks/use-attachment';
import { UploadComponent } from './upload-component';
import { AttachmentItem } from './attachment-item';
import { AttachmentPreviewModal } from './attachment-preview-modal';

interface AttachmentListProps {
  taskId: string;
}

export function AttachmentList({ taskId }: AttachmentListProps) {
  const { data: attachments = [], isLoading } = useTaskAttachments(taskId);
  const deleteAttachment = useDeleteAttachment(taskId);

  const [previewAttachment, setPreviewAttachment] = useState<AttachmentDto | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handlePreview = (attachment: AttachmentDto) => {
    setPreviewAttachment(attachment);
    setIsPreviewOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteAttachment.mutate(id);
  };

  return (
    <div className="space-y-3.5 rounded-2xl border border-surface-border bg-surface-alt/30 p-4 sm:p-5 shadow-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Paperclip className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">
            Tập tin đính kèm ({attachments.length})
          </h3>
        </div>

        <UploadComponent taskId={taskId} />
      </div>

      {isLoading ? (
        <div className="h-12 animate-pulse rounded-xl bg-surface-alt" />
      ) : (
        <div className="space-y-2 pt-1">
          {attachments.map((attachment) => (
            <AttachmentItem
              key={attachment.id}
              attachment={attachment}
              onPreview={handlePreview}
              onDelete={handleDelete}
            />
          ))}

          {attachments.length === 0 && (
            <p className="text-center py-3 text-xs text-text-muted italic">Chưa có tập tin đính kèm nào cho công việc này.</p>
          )}
        </div>
      )}

      {/* Image Preview Modal */}
      <AttachmentPreviewModal
        attachment={previewAttachment}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />
    </div>
  );
}
