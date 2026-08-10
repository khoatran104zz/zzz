'use client';

import React, { useState } from 'react';
import { Users, UserPlus, Loader2, Clock, Mail } from 'lucide-react';
import {
  useWorkspaceMembers,
  usePendingInvitations,
  useInviteMember,
  useUpdateMemberRole,
  useRemoveMember,
  useCancelInvitation,
} from '../hooks/use-team';
import { MemberList } from './member-list';
import { InviteDialog } from './invite-dialog';

interface TeamSettingsProps {
  workspaceId: string;
}

export function TeamSettings({ workspaceId }: TeamSettingsProps) {
  const { data: members = [], isLoading: isLoadingMembers } = useWorkspaceMembers(workspaceId);
  const { data: invitations = [], isLoading: isLoadingInvitations } = usePendingInvitations(workspaceId);

  const inviteMutation = useInviteMember(workspaceId);
  const updateRoleMutation = useUpdateMemberRole(workspaceId);
  const removeMutation = useRemoveMember(workspaceId);

  const cancelInviteMutation = useCancelInvitation(workspaceId);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const handleCopyLink = (token: string) => {
    const inviteUrl = `${window.location.origin}/invite/${token}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  if (isLoadingMembers || isLoadingInvitations) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Invite Trigger */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between border-b border-surface-border pb-4">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-text-primary font-heading">Thành viên & Cộng tác</h2>
            <p className="text-xs text-text-secondary">Quản lý thành viên, vai trò và lời mời đang chờ</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsInviteOpen(true)}
          className="flex items-center space-x-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-primary-hover active:scale-95 self-start sm:self-auto"
        >
          <UserPlus className="h-4 w-4" />
          <span>Mời thành viên</span>
        </button>
      </div>

      {/* Pending Invitations Section */}
      {invitations.length > 0 && (
        <div className="space-y-3">
          <h3 className="flex items-center space-x-2 text-xs font-bold text-status-warning uppercase tracking-wider font-heading">
            <Clock className="h-3.5 w-3.5" />
            <span>Lời mời đang chờ ({invitations.length})</span>
          </h3>

          <div className="divide-y divide-surface-border rounded-xl border border-status-warning/30 bg-status-warning/5 p-4">
            {invitations.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between py-2 text-xs">
                <div className="flex items-center space-x-2 truncate">
                  <Mail className="h-3.5 w-3.5 text-status-warning shrink-0" />
                  <span className="font-semibold text-text-primary truncate">{inv.email}</span>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCopyLink(inv.token)}
                    className="rounded-md border border-surface-border bg-surface px-2 py-1 text-[10px] text-text-secondary hover:bg-surface-alt hover:text-text-primary transition"
                  >
                    {copiedToken === inv.token ? 'Đã chép Link!' : 'Sao chép Link'}
                  </button>
                  <button
                    type="button"
                    onClick={() => cancelInviteMutation.mutate(inv.id)}
                    className="rounded-md border border-status-error/30 bg-status-error/10 px-2 py-1 text-[10px] text-status-error hover:bg-status-error hover:text-white transition"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Team Roster Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider font-heading">
          Thành viên đang hoạt động ({members.length})
        </h3>

        <MemberList
          members={members}
          onUpdateRole={(memberId, role) => updateRoleMutation.mutate({ memberId, data: { role } })}
          onRemoveMember={(memberId) => removeMutation.mutate(memberId)}
          isUpdating={updateRoleMutation.isPending || removeMutation.isPending}
        />
      </div>

      <InviteDialog
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onSubmit={(payload, callbacks) => {
          inviteMutation.mutate(payload, {
            onSuccess: () => callbacks?.onSuccess?.(),
            onError: (err: any) => callbacks?.onError?.(err),
          });
        }}
        isLoading={inviteMutation.isPending}
      />
    </div>
  );
}
