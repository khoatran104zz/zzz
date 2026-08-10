'use client';

import React from 'react';
import type { CalendarEventItemDto } from '../types';

interface WeekViewProps {
  currentDate: Date;
  events: CalendarEventItemDto[];
  onSelectEvent: (event: CalendarEventItemDto) => void;
  onSelectDate: (dateStr: string) => void;
}

export function WeekView({ currentDate, events, onSelectEvent, onSelectDate }: WeekViewProps) {
  // Start of week (Sunday)
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="rounded-2xl border border-surface-border bg-surface p-4 shadow-xs">
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const dateStr = day.toISOString().slice(0, 10);
          const isToday = dateStr === todayStr;

          const dayEvents = events.filter((e) => {
            const eDateStr = new Date(e.startTime).toISOString().slice(0, 10);
            return eDateStr === dateStr;
          });

          return (
            <div
              key={dateStr}
              onClick={() => onSelectDate(dateStr)}
              className={`min-h-[350px] rounded-2xl border p-2.5 flex flex-col space-y-2 cursor-pointer transition ${
                isToday
                  ? 'border-primary bg-primary/10 shadow-xs'
                  : 'border-surface-border bg-surface-alt/40 hover:border-primary/40 hover:bg-surface-alt'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-surface-border pb-2">
                <span className="text-xs font-bold text-text-muted">
                  {day.toLocaleDateString('vi-VN', { weekday: 'short' })}
                </span>
                <span
                  className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
                    isToday ? 'bg-primary text-white shadow-xs' : 'text-text-primary'
                  }`}
                >
                  {day.getDate()}
                </span>
              </div>

              {/* Event Column */}
              <div className="space-y-2 flex-1 overflow-y-auto scrollbar-none">
                {dayEvents.map((event) => (
                  <div
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectEvent(event);
                    }}
                    style={{ backgroundColor: (event.color || '#4F46E5') + '20', borderColor: (event.color || '#4F46E5') + '60' }}
                    className="rounded-xl border p-2 text-xs space-y-1 transition hover:scale-102 shadow-2xs"
                  >
                    <div className="font-bold text-text-primary truncate">{event.title}</div>
                    <div className="text-[10px] text-text-muted font-medium">
                      {new Date(event.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}

                {dayEvents.length === 0 && (
                  <p className="text-[10px] text-text-muted italic text-center pt-6">Không có sự kiện</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
