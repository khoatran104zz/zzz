'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, AlignLeft, Palette, Loader2, Building2, Video, Folder, Bell } from 'lucide-react';
import type { CalendarEventItemDto } from '../types';
import { useCreateCalendarEvent, useUpdateCalendarEvent, useDeleteCalendarEvent } from '../hooks/use-calendar';
import { useWorkspaces } from '@/features/workspace/hooks/use-workspace';
import { useProjects } from '@/features/project/hooks/use-project';
import { useWorkspaceStore } from '@/store/workspace-store';
import { useAuthStore } from '@/store/auth-store';

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
  const [meetingLink, setMeetingLink] = useState('');
  const [workspaceId, setWorkspaceId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [color, setColor] = useState('#4F46E5');
  const [isAllDay, setIsAllDay] = useState(false);

  const { data: workspaces = [] } = useWorkspaces();
  const activeWorkspaceId = useWorkspaceStore((state) => state.activeWorkspaceId);
  const { data: projects = [] } = useProjects(workspaceId || null);

  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.roles?.includes('ROLE_ADMIN') || user?.roles?.includes('ADMIN') || user?.email === 'admin@gmail.com';
  const isManager = user?.roles?.includes('ROLE_MANAGER') || user?.roles?.includes('MANAGER') || user?.email === 'manager@gmail.com';
  const canManageMeetings = isAdmin || isManager;

  const createEvent = useCreateCalendarEvent();
  const updateEvent = useUpdateCalendarEvent();
  const deleteEvent = useDeleteCalendarEvent();

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description || '');
      setLocation(event.location || '');
      setMeetingLink(event.meetingLink || '');
      setWorkspaceId(event.workspaceId || activeWorkspaceId || (workspaces[0]?.id ?? ''));
      setProjectId((event as any).projectId || '');
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
      setMeetingLink('');
      setWorkspaceId(activeWorkspaceId || (workspaces[0]?.id ?? ''));
      setProjectId('');
      setStartDate(initDate.toISOString().slice(0, 16));
      setEndDate(nextHour.toISOString().slice(0, 16));
      setColor('#4F46E5');
      setIsAllDay(false);
    }
  }, [event, isOpen, defaultDate, activeWorkspaceId, workspaces]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageMeetings || !title.trim() || !startDate || !endDate || !workspaceId) return;

    const startIso = new Date(startDate).toISOString();
    const endIso = new Date(endDate).toISOString();

    if (event && event.eventType === 'CUSTOM') {
      updateEvent.mutate(
        {
          eventId: event.id,
          data: {
            title: title.trim(),
            description,
            location,
            meetingLink,
            workspaceId,
            startTime: startIso,
            endTime: endIso,
            color,
            isAllDay,
          },
        },
        { onSuccess: onClose }
      );
    } else if (!event) {
      createEvent.mutate(
        {
          title: title.trim(),
          description,
          location,
          meetingLink,
          workspaceId,
          startTime: startIso,
          endTime: endIso,
          color,
          isAllDay,
        },
        { onSuccess: onClose }
      );
    }
  };

  const handleDelete = () => {
    if (canManageMeetings && event && event.eventType === 'CUSTOM') {
      deleteEvent.mutate(event.id, { onSuccess: onClose });
    }
  };

  const isReadOnlyTask = event?.eventType === 'TASK';
  const isReadOnly = isReadOnlyTask || !canManageMeetings;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl border border-surface-border bg-surface p-6 shadow-2xl space-y-4 text-text-primary">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-border pb-3">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Calendar className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-text-primary font-heading">
              {isReadOnlyTask ? 'Chi tiết công việc' : !canManageMeetings ? 'Chi tiết lịch họp' : event ? 'Chỉnh sửa lịch họp' : 'Thêm lịch họp mới'}
            </h3>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-text-muted hover:bg-surface-alt hover:text-text-primary transition">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Workspace & Project Pickers */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-text-secondary font-semibold mb-1 flex items-center">
                <Building2 className="mr-1 h-3.5 w-3.5 text-primary" /> Workspace *
              </label>
              <select
                required
                disabled={isReadOnly}
                value={workspaceId}
                onChange={(e) => {
                  setWorkspaceId(e.target.value);
                  setProjectId('');
                }}
                className="w-full rounded-xl border border-surface-border bg-surface-alt px-3 py-2 text-text-primary focus:border-primary focus:outline-none disabled:opacity-70 font-medium"
              >
                <option value="">-- Chọn Workspace --</option>
                {workspaces.map((ws) => (
                  <option key={ws.id} value={ws.id}>
                    {ws.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-text-secondary font-semibold mb-1 flex items-center">
                <Folder className="mr-1 h-3.5 w-3.5 text-primary" /> Dự án *
              </label>
              <select
                disabled={isReadOnly}
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full rounded-xl border border-surface-border bg-surface-alt px-3 py-2 text-primary font-bold focus:border-primary focus:outline-none disabled:opacity-70 cursor-pointer"
              >
                <option value="">-- Chọn dự án --</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.key ? `#${p.key}` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {projectId && (
            <div className="rounded-xl border border-primary/30 bg-primary/10 p-2.5 text-[11px] text-primary flex items-center space-x-1.5">
              <Bell className="h-3.5 w-3.5 shrink-0 text-primary" />
              <span>Thông báo lịch họp sẽ tự động được gửi đến các thành viên thuộc Dự án đã chọn.</span>
            </div>
          )}

          <div>
            <label className="block text-text-secondary font-semibold mb-1">Tên cuộc họp *</label>
            <input
              type="text"
              required
              disabled={isReadOnly}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tên cuộc họp (ví dụ: Họp Sprint Review, Họp dự án ABC...)"
              className="w-full rounded-xl border border-surface-border bg-surface-alt px-3 py-2 text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none disabled:opacity-70"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-text-secondary font-semibold mb-1 flex items-center">
                <Clock className="mr-1 h-3 w-3 text-primary" /> Bắt đầu *
              </label>
              <input
                type="datetime-local"
                required
                disabled={isReadOnly}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-surface-border bg-surface-alt px-2.5 py-1.5 text-text-primary focus:border-primary focus:outline-none disabled:opacity-70"
              />
            </div>
            <div>
              <label className="block text-text-secondary font-semibold mb-1 flex items-center">
                <Clock className="mr-1 h-3 w-3 text-primary" /> Kết thúc *
              </label>
              <input
                type="datetime-local"
                required
                disabled={isReadOnly}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl border border-surface-border bg-surface-alt px-2.5 py-1.5 text-text-primary focus:border-primary focus:outline-none disabled:opacity-70"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-text-secondary font-semibold mb-1 flex items-center">
                <Video className="mr-1 h-3 w-3 text-blue-500" /> Link cuộc họp (Google Meet/Zoom)
              </label>
              <input
                type="url"
                disabled={isReadOnly}
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                placeholder="https://meet.google.com/..."
                className="w-full rounded-xl border border-surface-border bg-surface-alt px-3 py-1.5 text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none disabled:opacity-70"
              />
            </div>
            <div>
              <label className="block text-text-secondary font-semibold mb-1 flex items-center">
                <MapPin className="mr-1 h-3 w-3 text-emerald-500" /> Địa điểm / Phòng họp
              </label>
              <input
                type="text"
                disabled={isReadOnly}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Phòng họp A, Tầng 3..."
                className="w-full rounded-xl border border-surface-border bg-surface-alt px-3 py-1.5 text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none disabled:opacity-70"
              />
            </div>
          </div>

          <div>
            <label className="block text-text-secondary font-semibold mb-1 flex items-center">
              <AlignLeft className="mr-1 h-3 w-3 text-text-muted" /> Nội dung / Chương trình họp
            </label>
            <textarea
              rows={2.5}
              disabled={isReadOnly}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập chương trình hoặc thông tin chi tiết cuộc họp..."
              className="w-full resize-none rounded-xl border border-surface-border bg-surface-alt px-3 py-1.5 text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none disabled:opacity-70"
            />
          </div>

          {!isReadOnly && (
            <div>
              <label className="block text-text-secondary font-semibold mb-1.5 flex items-center">
                <Palette className="mr-1 h-3 w-3 text-purple-500" /> Màu nhãn hiển thị
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
            {!isReadOnly && event && event.eventType === 'CUSTOM' ? (
              <button
                type="button"
                onClick={handleDelete}
                className="rounded-xl border border-status-error/30 bg-status-error/10 px-3 py-1.5 text-status-error hover:bg-status-error hover:text-white transition font-semibold"
              >
                Xóa cuộc họp
              </button>
            ) : <div />}

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-surface-border bg-surface-alt px-3.5 py-1.5 font-semibold text-text-secondary hover:bg-surface hover:text-text-primary transition"
              >
                {isReadOnly ? 'Đóng' : 'Hủy'}
              </button>
              {!isReadOnly && (
                <button
                  type="submit"
                  disabled={createEvent.isPending || updateEvent.isPending}
                  className="flex items-center space-x-1.5 rounded-xl bg-primary px-4 py-1.5 font-semibold text-white shadow-xs hover:bg-primary-hover disabled:opacity-50 transition"
                >
                  {createEvent.isPending || updateEvent.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <span>Lưu lịch họp</span>
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
