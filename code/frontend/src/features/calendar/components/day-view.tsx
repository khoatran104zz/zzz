'use client';

import React from 'react';
import { Clock, MapPin, CheckSquare, Calendar as CalendarIcon, Building2, Video } from 'lucide-react';
import type { CalendarEventItemDto } from '../types';

interface DayViewProps {
  currentDate: Date;
  events: CalendarEventItemDto[];
  onSelectEvent: (event: CalendarEventItemDto) => void;
}

export function DayView({ currentDate, events, onSelectEvent }: DayViewProps) {
  const dateStr = currentDate.toISOString().slice(0, 10);
  const formattedHeader = currentDate.toLocaleDateString('vi-VN', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const dayEvents = events.filter((e) => {
    const eDateStr = new Date(e.startTime).toISOString().slice(0, 10);
    return eDateStr === dateStr;
  });

  return (
    <div className="rounded-2xl border border-surface-border bg-surface p-6 space-y-4 shadow-xs">
      <div className="flex items-center space-x-2 border-b border-surface-border pb-3">
        <CalendarIcon className="h-5 w-5 text-primary" />
        <h2 className="text-base font-bold text-text-primary font-heading capitalize">{formattedHeader}</h2>
      </div>

      <div className="space-y-3">
        {dayEvents.map((event) => (
          <div
            key={event.id}
            onClick={() => onSelectEvent(event)}
            style={{ backgroundColor: (event.color || '#4F46E5') + '15', borderColor: (event.color || '#4F46E5') + '40' }}
            className="flex items-start justify-between rounded-xl border p-4 text-xs transition cursor-pointer hover:border-primary/40 shadow-xs"
          >
            <div className="space-y-1.5 min-w-0 flex-1">
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <span
                  className="px-2 py-0.5 rounded-md text-[10px] font-bold text-white uppercase shadow-2xs"
                  style={{ backgroundColor: event.color || '#4F46E5' }}
                >
                  {event.eventType === 'TASK' ? 'CÔNG VIỆC' : 'CUỘC HỌP'}
                </span>
                {event.workspaceName && (
                  <span className="flex items-center text-text-secondary font-semibold bg-surface-alt px-2 py-0.5 rounded-md border border-surface-border text-[10px]">
                    <Building2 className="mr-1 h-3 w-3 text-primary" />
                    {event.workspaceName}
                  </span>
                )}
                <h3 className="font-bold text-sm text-text-primary truncate">{event.title}</h3>
              </div>

              {event.description && <p className="text-text-secondary leading-relaxed line-clamp-2">{event.description}</p>}

              <div className="flex items-center space-x-4 text-text-muted text-[11px] pt-1 font-medium flex-wrap gap-y-1">
                <span className="flex items-center">
                  <Clock className="mr-1 h-3 w-3 text-primary" />
                  {new Date(event.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} -{' '}
                  {new Date(event.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </span>
                {event.meetingLink && (
                  <a
                    href={event.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center text-blue-500 hover:underline font-semibold"
                  >
                    <Video className="mr-1 h-3 w-3" />
                    Tham gia cuộc họp
                  </a>
                )}
                {event.location && (
                  <span className="flex items-center">
                    <MapPin className="mr-1 h-3 w-3 text-emerald-500" />
                    {event.location}
                  </span>
                )}
                {event.status && (
                  <span className="flex items-center font-bold text-primary">
                    <CheckSquare className="mr-1 h-3 w-3" />
                    {event.status}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {dayEvents.length === 0 && (
          <div className="text-center py-12 text-text-muted text-xs italic">
            Không có cuộc họp nào diễn ra trong ngày này.
          </div>
        )}
      </div>
    </div>
  );
}
