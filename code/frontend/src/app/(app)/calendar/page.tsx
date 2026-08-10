'use client';

import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCalendarEvents } from '@/features/calendar/hooks/use-calendar';
import type { CalendarEventItemDto, CalendarViewMode } from '@/features/calendar/types';
import { MonthView } from '@/features/calendar/components/month-view';
import { WeekView } from '@/features/calendar/components/week-view';
import { DayView } from '@/features/calendar/components/day-view';
import { EventModal } from '@/features/calendar/components/event-modal';
import { TaskDetailModal } from '@/features/task/components/task-detail-modal';
import type { TaskDto } from '@/features/task/types';

export default function CalendarPage() {
  const { t: tNav } = useTranslation('navigation');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventItemDto | null>(null);
  const [selectedTask, setSelectedTask] = useState<TaskDto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDateStr, setSelectedDateStr] = useState<string | undefined>(undefined);

  // Range calculation based on currentDate (2 months padding)
  const rangeStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1).toISOString();
  const rangeEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 0).toISOString();

  const { data: events = [], isLoading } = useCalendarEvents(rangeStart, rangeEnd);

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setViewMode('day');
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePrev = () => {
    const next = new Date(currentDate);
    if (viewMode === 'month') next.setMonth(next.getMonth() - 1);
    else if (viewMode === 'week') next.setDate(next.getDate() - 7);
    else next.setDate(next.getDate() - 1);
    setCurrentDate(next);
  };

  const handleNext = () => {
    const next = new Date(currentDate);
    if (viewMode === 'month') next.setMonth(next.getMonth() + 1);
    else if (viewMode === 'week') next.setDate(next.getDate() + 7);
    else next.setDate(next.getDate() + 1);
    setCurrentDate(next);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleOpenCreateModal = (dateStr?: string) => {
    setSelectedEvent(null);
    setSelectedDateStr(dateStr);
    setIsModalOpen(true);
  };

  const handleSelectEvent = (event: CalendarEventItemDto) => {
    if (event.eventType === 'TASK' && event.taskId) {
      // Create a dummy/compatible TaskDto to open in TaskDetailModal
      setSelectedTask({
        id: event.taskId,
        title: event.title,
        description: event.description,
        status: (event.status as any) || 'TODO',
        priority: 'MEDIUM',
        dueDate: event.endTime || event.startTime,
        projectId: '',
        position: 0,
        isArchived: false,
        createdAt: event.startTime,
      });
    } else {
      setSelectedEvent(event);
      setIsModalOpen(true);
    }
  };

  const formattedMonthYear = currentDate.toLocaleDateString('vi-VN', {
    month: 'long',
    year: 'numeric',
  });

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayEventsCount = events.filter((e) => new Date(e.startTime).toISOString().slice(0, 10) === todayStr).length;

  return (
    <div className="space-y-6 text-text-primary">
      {/* Top Header Card */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-surface-border pb-5">
        <div className="flex items-center space-x-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-xs">
            <CalendarIcon className="h-5.5 w-5.5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-text-primary font-heading flex items-center space-x-2">
              <span>{tNav('menu.calendar', { defaultValue: 'Lịch công việc' })}</span>
              {todayEventsCount > 0 && (
                <span className="flex items-center space-x-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary border border-primary/20">
                  <Sparkles className="h-3 w-3" />
                  <span>{todayEventsCount} sự kiện hôm nay</span>
                </span>
              )}
            </h1>
            <p className="text-xs text-text-secondary mt-0.5">
              Theo dõi lịch làm việc, thời hạn công việc và sự kiện cá nhân trực quan
            </p>
          </div>
        </div>

        {/* View Switcher & Action Controls */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 rounded-2xl border border-surface-border bg-surface-alt p-1">
            <button
              type="button"
              onClick={() => setViewMode('month')}
              className={`hidden md:inline-block rounded-xl px-4 py-1.5 text-xs font-bold transition ${
                viewMode === 'month' ? 'bg-primary text-white shadow-xs' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Tháng
            </button>
            <button
              type="button"
              onClick={() => setViewMode('week')}
              className={`hidden md:inline-block rounded-xl px-4 py-1.5 text-xs font-bold transition ${
                viewMode === 'week' ? 'bg-primary text-white shadow-xs' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Tuần
            </button>
            <button
              type="button"
              onClick={() => setViewMode('day')}
              className={`rounded-xl px-4 py-1.5 text-xs font-bold transition ${
                viewMode === 'day' ? 'bg-primary text-white shadow-xs' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Ngày
            </button>
          </div>

          <button
            type="button"
            onClick={() => handleOpenCreateModal()}
            className="flex items-center space-x-1.5 rounded-2xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-hover shadow-xs transition active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Thêm sự kiện mới</span>
          </button>
        </div>
      </div>

      {/* Date Navigation Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handlePrev}
            className="rounded-xl p-2 border border-surface-border bg-surface text-text-secondary hover:bg-surface-alt hover:text-text-primary transition shadow-xs"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleToday}
            className="rounded-xl border border-surface-border bg-surface px-3.5 py-1.5 text-xs font-bold text-text-primary hover:bg-surface-alt transition shadow-xs"
          >
            Hôm nay
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="rounded-xl p-2 border border-surface-border bg-surface text-text-secondary hover:bg-surface-alt hover:text-text-primary transition shadow-xs"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <span className="text-base font-extrabold text-text-primary font-heading pl-3 capitalize">{formattedMonthYear}</span>
        </div>
      </div>

      {/* Active Calendar View */}
      {isLoading ? (
        <div className="h-96 animate-pulse rounded-2xl bg-surface-alt" />
      ) : (
        <>
          {viewMode === 'month' && (
            <MonthView
              currentDate={currentDate}
              events={events}
              onSelectEvent={handleSelectEvent}
              onSelectDate={(dateStr) => handleOpenCreateModal(dateStr)}
            />
          )}

          {viewMode === 'week' && (
            <WeekView
              currentDate={currentDate}
              events={events}
              onSelectEvent={handleSelectEvent}
              onSelectDate={(dateStr) => handleOpenCreateModal(dateStr)}
            />
          )}

          {viewMode === 'day' && (
            <DayView currentDate={currentDate} events={events} onSelectEvent={handleSelectEvent} />
          )}
        </>
      )}

      {/* Event Creation / Edit Modal */}
      <EventModal
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultDate={selectedDateStr}
      />

      {/* Task Detail Modal for Calendar Tasks */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
      />
    </div>
  );
}
