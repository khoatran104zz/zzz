'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, X } from 'lucide-react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  autoCloseDuration?: number; // in ms, e.g. 2500
}

export function SuccessModal({
  isOpen,
  onClose,
  title = 'Lưu thông tin thành công!',
  description = 'Dữ liệu của bạn đã được lưu và cập nhật tự động trên toàn hệ thống.',
  autoCloseDuration = 2500,
}: SuccessModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && autoCloseDuration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDuration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoCloseDuration, onClose]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative my-auto w-full max-w-sm rounded-2xl border border-surface-border bg-surface p-6 shadow-2xl space-y-4 text-center text-text-primary animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-text-muted hover:bg-surface-alt hover:text-text-primary transition cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex justify-center pt-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-xs">
            <CheckCircle2 className="h-8 w-8 animate-bounce" />
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="text-base font-extrabold text-text-primary font-heading">
            {title}
          </h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            {description}
          </p>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-primary-hover active:scale-95 transition cursor-pointer"
          >
            Đồng ý
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
