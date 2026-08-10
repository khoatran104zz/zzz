'use client';

import React, { useRef, useState } from 'react';
import { Paperclip, Loader2 } from 'lucide-react';
import { useUploadAttachment } from '../hooks/use-attachment';

interface UploadComponentProps {
  taskId: string;
  maxSizeBytes?: number; // Default 10MB
}

export function UploadComponent({ taskId, maxSizeBytes = 10485760 }: UploadComponentProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const uploadMutation = useUploadAttachment(taskId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSizeBytes) {
      const maxMb = (maxSizeBytes / (1024 * 1024)).toFixed(0);
      setErrorMsg(`Dung lượng file vượt quá giới hạn ${maxMb}MB`);
      return;
    }

    uploadMutation.mutate(file, {
      onSuccess: () => {
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      },
      onError: (err: any) => {
        setErrorMsg(err?.response?.data?.message || 'Không thể tải lên tập tin');
      },
    });
  };

  return (
    <div className="space-y-1">
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        className="hidden"
        id={`file-upload-${taskId}`}
      />

      <label
        htmlFor={`file-upload-${taskId}`}
        className={`inline-flex items-center space-x-1.5 rounded-xl border border-surface-border bg-surface px-3 py-1.5 text-xs font-semibold text-text-primary hover:bg-surface-alt hover:border-primary/40 transition shadow-xs cursor-pointer ${
          uploadMutation.isPending ? 'opacity-50 pointer-events-none' : ''
        }`}
      >
        {uploadMutation.isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
        ) : (
          <Paperclip className="h-3.5 w-3.5 text-primary" />
        )}
        <span>{uploadMutation.isPending ? 'Đang tải lên...' : 'Đính kèm tệp'}</span>
      </label>

      {errorMsg && <p className="text-[10px] text-status-error font-medium">{errorMsg}</p>}
    </div>
  );
}
