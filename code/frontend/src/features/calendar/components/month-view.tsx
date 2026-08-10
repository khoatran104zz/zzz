'use client';

import React from 'react';
import type { CalendarEventItemDto } from '../types';

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEventItemDto[];
  onSelectEvent: (event: CalendarEventItemDto) => void;
  onSelectDate: (dateStr: string) => void;
}

export function MonthView({ currentDate, events, onSelectEvent, onSelectDate }: MonthViewProps) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // First day of current month
  const firstDayOfMonth = new Date(year, month, 1);
  const startingDayOfWeek = firstDayOfMonth.getDay();

  // Days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Total grid cells (multiple of 7)
  const totalCells = Math.ceil((startingDayOfWeek + daysInMonth) / 7) * 7;

  const daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const todayStr = new Date().toISOString().slice(0, 10);

  const getCellDate = (cellIndex: number): Date => {
    const dayOffset = cellIndex - startingDayOfWeek + 1;
    return new Date(year, month, dayOffset);
  };

  return (
    <div className="rounded-2xl border border-surface-border bg-surface p-4 space-y-3 shadow-xs">
      {/* Day Headers */}
      <div className="grid grid-cols-7 text-center text-xs font-bold text-text-muted border-b border-surface-border pb-2.5 uppercase">
        {daysOfWeek.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: totalCells }).map((_, index) => {
          const date = getCellDate(index);
          const dateStr = date.toISOString().slice(0, 10);
          const isCurrentMonth = date.getMonth() === month;
          const isToday = dateStr === todayStr;

          // Find matching events
          const dayEvents = events.filter((e) => {
            const eDateStr = new Date(e.startTime).toISOString().slice(0, 10);
            return eDateStr === dateStr;
          });

          return (
            <div
              key={index}
              onClick={() => onSelectDate(dateStr)}
              className={`min-h-[105px] rounded-xl border p-2 transition flex flex-col justify-between cursor-pointer group ${
                isCurrentMonth
                  ? isToday
                    ? 'border-primary bg-primary/10 shadow-xs'
                    : 'border-surface-border bg-surface-alt/40 hover:border-primary/40 hover:bg-surface-alt'
                  : 'border-transparent bg-surface-alt/20 opacity-30'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
                    isToday ? 'bg-primary text-white shadow-xs' : 'text-text-primary'
                  }`}
                >
                  {date.getDate()}
                </span>
                {dayEvents.length > 0 && (
                  <span className="text-[10px] text-text-muted font-bold bg-surface-alt px-1.5 py-0.5 rounded-md border border-surface-border">
                    {dayEvents.length}
                  </span>
                )}
              </div>

              {/* Event Pills */}
              <div className="space-y-1 mt-1 overflow-y-auto max-h-[65px] scrollbar-none">
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectEvent(event);
                    }}
                    style={{ backgroundColor: (event.color || '#4F46E5') + '20', borderColor: (event.color || '#4F46E5') + '60' }}
                    className="truncate rounded-lg px-2 py-0.5 text-[10px] font-semibold border transition hover:scale-102 shadow-2xs"
                  >
                    <span className="font-bold mr-1" style={{ color: event.color || '#4F46E5' }}>
                      {event.eventType === 'TASK' ? '✓' : '•'}
                    </span>
                    <span className="text-text-primary">{event.title}</span>
                  </div>
                ))}

                {dayEvents.length > 3 && (
                  <p className="text-[9px] text-text-muted font-medium italic pl-1">+{dayEvents.length - 3} sự kiện nữa</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
