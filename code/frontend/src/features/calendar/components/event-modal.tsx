'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, AlignLeft, Palette, Loader2 } from 'lucide-react';
import type { CalendarEventItemDto } from '../types';
import { useCreateCalendarEvent, useUpdateCalendarEvent, useDeleteCalendarEvent } from '../hooks/use-calendar';

interface EventModalProps {
  event: CalendarEventItemDto | null;
  isOpen: boolean;
  onClose: () => void;
  defaultDate?: string;
}

const PRESET_COLORS = ['#4F46E5', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6'];

export function EventModal({ event, isOpen, onClose, defaultDate }: EventModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [color, setColor] = useState('#4F46E5');
  const [isAllDay, setIsAllDay] = useState(false);

  const createEvent = useCreateCalendarEvent();
  const updateEvent = useUpdateCalendarEvent();
  const deleteEvent = useDeleteCalendarEvent();

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description || '');
      setLocation(event.location || '');
      setStartDate(event.startTime ? new Date(event.startTime).toISOString().slice(0, 16) : '');
      setEndDate(event.endTime ? new Date(event.endTime).toISOString().slice(0, 16) : '');
      setColor(event.color || '#4F46E5');
      setIsAllDay(event.isAllDay);
    } else {
      const initDate = defaultDate ? new Date(defaultDate) : new Date();
      const nextHour = new Date(initDate.getTime() + 60 * 60 * 1000);
      setTitle('');
      setDescription('');
      setLocation('');
      setStartDate(initDate.toISOString().slice(0, 16));
      setEndDate(nextHour.toISOString().slice(0, 16));
      setColor('#4F46E5');
      setIsAllDay(false);
    }
  }, [event, isOpen, defaultDate]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startDate || !endDate) return;

    const startIso = new Date(startDate).toISOString();
    const endIso = new Date(endDate).toISOString();

    if (event && event.eventType === 'CUSTOM') {
      updateEvent.mutate(
        {
          eventId: event.id,
          data: { title: title.trim(), description, location, startTime: startIso, endTime: endIso, color, isAllDay },
        },
        { onSuccess: onClose }
      );
    } else if (!event) {
      createEvent.mutate(
        { title: title.trim(), description, location, startTime: startIso, endTime: endIso, color, isAllDay },
        { onSuccess: onClose }
      );
    }
  };

  const handleDelete = () => {
    if (event && event.eventType === 'CUSTOM') {
      deleteEvent.mutate(event.id, { onSuccess: onClose });
    }
  };

  const isReadOnlyTask = event?.eventType === 'TASK';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl border border-surface-border bg-surface p-6 shadow-2xl space-y-4 text-text-primary">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-border pb-3">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Calendar className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-text-primary font-heading">
              {isReadOnlyTask ? 'Chi tiết công việc' : event ? 'Chỉnh sửa sự kiện' : 'Tạo sự kiện mới'}
            </h3>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-text-muted hover:bg-surface-alt hover:text-text-primary transition">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-text-secondary font-semibold mb-1">Tiêu đề sự kiện *</label>
            <input
              type="text"
              required
              disabled={isReadOnlyTask}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề sự kiện..."
              className="w-full rounded-xl border border-surface-border bg-surface-alt px-3 py-2 text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none disabled:opacity-70"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-text-secondary font-semibold mb-1 flex items-center">
                <Clock className="mr-1 h-3 w-3 text-primary" /> Bắt đầu
              </label>
              <input
                type="datetime-local"
                required
                disabled={isReadOnlyTask}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-surface-border bg-surface-alt px-2.5 py-1.5 text-text-primary focus:border-primary focus:outline-none disabled:opacity-70"
              />
            </div>
            <div>
              <label className="block text-text-secondary font-semibold mb-1 flex items-center">
                <Clock className="mr-1 h-3 w-3 text-primary" /> Kết thúc
              </label>
              <input
                type="datetime-local"
                required
                disabled={isReadOnlyTask}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl border border-surface-border bg-surface-alt px-2.5 py-1.5 text-text-primary focus:border-primary focus:outline-none disabled:opacity-70"
              />
            </div>
          </div>

          <div>
            <label className="block text-text-secondary font-semibold mb-1 flex items-center">
              <MapPin className="mr-1 h-3 w-3 text-emerald-500" /> Địa điểm / Liên kết cuộc họp
            </label>
            <input
              type="text"
              disabled={isReadOnlyTask}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Nhập địa điểm hoặc link Google Meet / Zoom..."
              className="w-full rounded-xl border border-surface-border bg-surface-alt px-3 py-1.5 text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none disabled:opacity-70"
            />
          </div>

          <div>
            <label className="block text-text-secondary font-semibold mb-1 flex items-center">
              <AlignLeft className="mr-1 h-3 w-3 text-text-muted" /> Ghi chú / Mô tả
            </label>
            <textarea
              rows={2.5}
              disabled={isReadOnlyTask}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả nội dung sự kiện..."
              className="w-full resize-none rounded-xl border border-surface-border bg-surface-alt px-3 py-1.5 text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none disabled:opacity-70"
            />
          </div>

          {!isReadOnlyTask && (
            <div>
              <label className="block text-text-secondary font-semibold mb-1.5 flex items-center">
                <Palette className="mr-1 h-3 w-3 text-purple-500" /> Màu sắc hiển thị
              </label>
              <div className="flex items-center space-x-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    style={{ backgroundColor: c }}
                    className={`h-5 w-5 rounded-full transition shadow-xs ${color === c ? 'ring-2 ring-primary ring-offset-2 ring-offset-surface' : ''}`}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-surface-border pt-3.5">
            {event && event.eventType === 'CUSTOM' ? (
              <button
                type="button"
                onClick={handleDelete}
                className="rounded-xl border border-status-error/30 bg-status-error/10 px-3 py-1.5 text-status-error hover:bg-status-error hover:text-white transition font-semibold"
              >
                Xóa sự kiện
              </button>
            ) : <div />}

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-surface-border bg-surface-alt px-3.5 py-1.5 font-semibold text-text-secondary hover:bg-surface hover:text-text-primary transition"
              >
                Hủy
              </button>
              {!isReadOnlyTask && (
                <button
                  type="submit"
                  disabled={createEvent.isPending || updateEvent.isPending}
                  className="flex items-center space-x-1.5 rounded-xl bg-primary px-4 py-1.5 font-semibold text-white shadow-xs hover:bg-primary-hover disabled:opacity-50 transition"
                >
                  {createEvent.isPending || updateEvent.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <span>Lưu sự kiện</span>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
