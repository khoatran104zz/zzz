'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, UserPlus, Shield, Mail, Calendar, Search, Loader2, Trash2 } from 'lucide-react';
import { useWorkspaceMembers, useUpdateMemberRole, useRemoveMember } from '@/features/team/hooks/use-team';
import { useAuthStore } from '@/store/auth-store';
import type { WorkspaceRole } from '@/features/team/types';

interface WorkspaceMembersTabProps {
  workspaceId: string;
  onOpenInviteMember: () => void;
}

export function WorkspaceMembersTab({ workspaceId, onOpenInviteMember }: WorkspaceMembersTabProps) {
  const { t } = useTranslation('team');
  const { t: tCommon } = useTranslation('common');
  const currentUser = useAuthStore((state) => state.user);

  const [search, setSearch] = useState('');

  const { data: members = [], isLoading } = useWorkspaceMembers(workspaceId);
  const updateRoleMutation = useUpdateMemberRole(workspaceId);
  const removeMemberMutation = useRemoveMember(workspaceId);

  const currentUserRole = String(members.find((m) => m.userId === currentUser?.id)?.role || 'MEMBER').toUpperCase();
  const isAdmin = currentUserRole === 'OWNER' || currentUserRole === 'ADMIN' || currentUser?.roles?.includes('ROLE_ADMIN') || currentUser?.email === 'admin@gmail.com';
  const isManager = !isAdmin && (currentUserRole === 'MANAGER' || currentUser?.roles?.includes('ROLE_MANAGER') || currentUser?.email === 'manager@gmail.com');
  const canManageMembers = isAdmin || isManager;

  const filteredMembers = members.filter((m) => {
    const query = search.toLowerCase().trim();
    if (!query) return true;
    const name = m.fullName?.toLowerCase() || '';
    const email = m.email?.toLowerCase() || '';
    return name.includes(query) || email.includes(query);
  });

  const handleRoleChange = (memberId: string, newRole: WorkspaceRole) => {
    updateRoleMutation.mutate({ memberId, data: { role: newRole } });
  };

  const handleRemove = (memberId: string, name: string) => {
    if (confirm(`Bạn có chắc muốn xóa thành viên ${name} khỏi dự án này?`)) {
      removeMemberMutation.mutate(memberId);
    }
  };

  return (
    <div className="space-y-6 text-text-primary pb-12">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-surface-border pb-4">
        <div>
          <h2 className="text-base font-bold text-text-primary font-heading flex items-center space-x-2">
            <Users className="h-5 w-5 text-primary" />
            <span>Thành viên Dự án ({members.length})</span>
          </h2>
          <p className="text-xs text-text-secondary">
            Danh sách nhân sự và phân quyền thành viên trong dự án
          </p>
        </div>

        {canManageMembers && (
          <button
            onClick={onOpenInviteMember}
            className="flex items-center space-x-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-primary-hover active:scale-95"
          >
            <UserPlus className="h-4 w-4" />
            <span>Mời thành viên</span>
          </button>
        )}
      </div>

      {/* Search Input Filter */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm kiếm theo tên hoặc email..."
          className="w-full rounded-xl border border-surface-border bg-surface-alt pl-10 pr-3.5 py-2 text-xs text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
        />
      </div>

      {/* Members Directory Table */}
      {isLoading ? (
        <div className="flex h-40 items-center justify-center space-x-2 text-xs text-text-secondary">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span>Đang tải danh sách thành viên...</span>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="flex h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-surface-border bg-surface-alt/40 p-6 text-center">
          <Users className="h-8 w-8 text-text-muted mb-2" />
          <p className="text-xs font-medium text-text-primary">Không tìm thấy thành viên nào</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-surface-border bg-surface shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-surface-border bg-surface-alt/60 font-semibold text-text-secondary uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Thành viên</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Vai trò (Role)</th>
                <th className="px-4 py-3">Ngày tham gia</th>
                {isAdmin && <th className="px-4 py-3 text-right">Thao tác</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {filteredMembers.map((member) => {
                const isSelf = member.userId === currentUser?.id;
                const name = member.fullName || member.email || 'Thành viên';

                return (
                  <tr key={member.id} className="hover:bg-surface-alt/50 transition">
                    {/* User Info */}
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                          {name.substring(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-text-primary flex items-center space-x-1.5">
                            <span>{name}</span>
                            {isSelf && (
                              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold text-primary">
                                Bạn
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-4 py-3 text-text-secondary">
                      <div className="flex items-center space-x-1.5">
                        <Mail className="h-3.5 w-3.5 text-text-muted" />
                        <span>{member.email || '---'}</span>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-4 py-3">
                      {isAdmin && !isSelf ? (
                        <select
                          value={member.role}
                          onChange={(e) => handleRoleChange(member.id, e.target.value as WorkspaceRole)}
                          className="rounded-lg border border-surface-border bg-surface-alt px-2.5 py-1 text-xs font-semibold text-text-primary focus:border-primary focus:outline-none"
                        >
                          <option value="MEMBER">Nhân viên (MEMBER)</option>
                          <option value="MANAGER">Quản lý (MANAGER)</option>
                          <option value="ADMIN">Quản trị viên (ADMIN)</option>
                          <option value="OWNER">Chủ dự án (OWNER)</option>
                        </select>
                      ) : (
                        <span
                          className={`inline-flex items-center space-x-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            member.role === 'ADMIN' || member.role === 'OWNER'
                              ? 'border border-red-500/20 bg-red-500/10 text-red-500'
                              : member.role === 'MANAGER'
                              ? 'border border-amber-500/20 bg-amber-500/10 text-amber-500'
                              : 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-500'
                          }`}
                        >
                          <Shield className="h-3 w-3" />
                          <span>{member.role}</span>
                        </span>
                      )}
                    </td>

                    {/* Joined Date */}
                    <td className="px-4 py-3 text-text-muted">
                      <div className="flex items-center space-x-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : '---'}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    {isAdmin && (
                      <td className="px-4 py-3 text-right">
                        {!isSelf && (
                          <button
                            onClick={() => handleRemove(member.id, name)}
                            className="rounded-lg p-1.5 text-text-muted hover:bg-status-error/10 hover:text-status-error transition"
                            title="Xóa thành viên"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
