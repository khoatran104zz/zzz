'use client';

import React, { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRealtimeConnection, useProjectTaskRealtime } from '../hooks/use-realtime';
import type { RealtimeEvent } from '../types';

interface RealtimeListenerProps {
  projectId?: string;
  onTaskEvent?: (event: RealtimeEvent) => void;
  onProjectEvent?: (event: RealtimeEvent) => void;
  children?: React.ReactNode;
}

export function RealtimeListener({ projectId, onTaskEvent, onProjectEvent, children }: RealtimeListenerProps) {
  const queryClient = useQueryClient();

  useRealtimeConnection();

  const handleTaskEvent = useCallback(
    (event: RealtimeEvent) => {
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
        queryClient.invalidateQueries({ queryKey: ['timeline', 'project', projectId] });
        queryClient.invalidateQueries({ queryKey: ['board', 'project', projectId] });
      }
      onTaskEvent?.(event);
    },
    [projectId, queryClient, onTaskEvent]
  );

  useProjectTaskRealtime(projectId || '', handleTaskEvent);

  return <>{children}</>;
}
