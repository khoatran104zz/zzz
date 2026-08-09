'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useWorkspaces } from '@/features/workspace/hooks/use-workspace';
import { useWorkspaceTasks } from '@/features/task/hooks/use-task';
import { useWorkspaceStore } from '@/store/workspace-store';
import { useInviteMember } from '@/features/team/hooks/use-team';
import { WorkspaceHeader, type WorkspaceTab } from '@/features/workspace/components/WorkspaceHeader';
import { WorkspaceSummaryTab } from '@/features/workspace/components/tabs/WorkspaceSummaryTab';
import { WorkspaceBacklogTab } from '@/features/workspace/components/tabs/WorkspaceBacklogTab';
import { WorkspaceBoardTab } from '@/features/workspace/components/tabs/WorkspaceBoardTab';
import { WorkspaceTimelineTab } from '@/features/workspace/components/tabs/WorkspaceTimelineTab';
import { WorkspaceFormsTab } from '@/features/workspace/components/tabs/WorkspaceFormsTab';
import { GlobalTaskModal } from '@/features/task/components/global-task-modal';
import { InviteDialog } from '@/features/team/components/invite-dialog';

export default function WorkspaceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.workspaceId as string;

  const { data: workspaces = [] } = useWorkspaces();
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace);
  const currentWorkspace = workspaces.find((w) => w.id === workspaceId) || activeWorkspace;

  const [activeTab, setActiveTab] = useState<WorkspaceTab>('summary');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const inviteMutation = useInviteMember(workspaceId);
  const { data: tasks = [], isLoading: isTasksLoading } = useWorkspaceTasks(workspaceId || null);

  return (
    <div className="space-y-6">
      {/* Workspace Jira/Confluence Space Header */}
      <WorkspaceHeader
        workspace={currentWorkspace || null}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenInviteMember={() => setIsInviteOpen(true)}
      />

      {/* Tab Content Display */}
      {activeTab === 'summary' && (
        <WorkspaceSummaryTab
          workspaceName={currentWorkspace?.name || 'Workspace'}
          tasks={tasks}
          isLoading={isTasksLoading}
          onOpenCreateTask={() => setIsTaskModalOpen(true)}
        />
      )}

      {activeTab === 'backlog' && (
        <WorkspaceBacklogTab
          tasks={tasks}
          isLoading={isTasksLoading}
          onOpenCreateTask={() => setIsTaskModalOpen(true)}
        />
      )}

      {activeTab === 'board' && (
        <WorkspaceBoardTab
          tasks={tasks}
          isLoading={isTasksLoading}
          onOpenCreateTask={() => setIsTaskModalOpen(true)}
        />
      )}

      {activeTab === 'timeline' && (
        <WorkspaceTimelineTab
          tasks={tasks}
          isLoading={isTasksLoading}
          onOpenCreateTask={() => setIsTaskModalOpen(true)}
        />
      )}

      {activeTab === 'forms' && <WorkspaceFormsTab workspaceId={workspaceId} />}

      {/* Dialogs */}
      <GlobalTaskModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} />
      
      {/* Add Member Invite Dialog */}
      <InviteDialog
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onSubmit={(payload) => inviteMutation.mutate(payload)}
        isLoading={inviteMutation.isPending}
      />
    </div>
  );
}
