'use client';

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ShieldAlert, 
  Users, 
  Layers, 
  Activity, 
  Search, 
  Lock, 
  Unlock, 
  Shield, 
  Trash2, 
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { adminService, type AdminStatsDto, type AdminUserDto } from '@/features/admin/services/admin-service';
import { useAuthStore } from '@/store/auth-store';

export default function AdminDashboardPage() {
  const { t } = useTranslation('admin');
  const { t: tCommon } = useTranslation('common');
  const currentUser = useAuthStore((state) => state.user);
  const [stats, setStats] = useState<AdminStatsDto | null>(null);
  const [users, setUsers] = useState<AdminUserDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [statsRes, usersRes] = await Promise.all([
        adminService.getStats(),
        adminService.getAllUsers(),
      ]);
      setStats(statsRes);
      setUsers(usersRes);
    } catch (err) {
      console.error('Failed to fetch admin data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleLock = async (user: AdminUserDto) => {
    try {
      setActionLoadingId(user.id);
      const newStatus = user.status === 'LOCKED' ? 'ACTIVE' : 'LOCKED';
      await adminService.updateUserStatus(user.id, newStatus);
      const actionText = newStatus === 'LOCKED' ? t('userManagement.actions.lock').toLowerCase() : t('userManagement.actions.unlock').toLowerCase();
      setSuccessMsg(t('userManagement.messages.lockSuccess', { action: actionText, email: user.email }));
      fetchData();
    } catch (err) {
      alert(t('userManagement.messages.errorStatus'));
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleRole = async (user: AdminUserDto) => {
    try {
      setActionLoadingId(user.id);
      const isCurrentlyAdmin = user.roles.includes('ROLE_ADMIN');
      const targetRole = isCurrentlyAdmin ? 'USER' : 'ADMIN';
      await adminService.updateUserRole(user.id, targetRole);
      setSuccessMsg(t('userManagement.messages.roleSuccess', { email: user.email, role: targetRole }));
      fetchData();
    } catch (err) {
      alert(t('userManagement.messages.errorRole'));
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteUser = async (user: AdminUserDto) => {
    if (!confirm(t('userManagement.messages.deleteConfirm', { email: user.email }))) return;
    try {
      setActionLoadingId(user.id);
      await adminService.deleteUser(user.id);
      setSuccessMsg(t('userManagement.messages.deleteSuccess', { email: user.email }));
      fetchData();
    } catch (err) {
      alert(t('userManagement.messages.errorDelete'));
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12 text-text-primary">
      {/* Admin Dedicated Banner Header */}
      <div className="relative overflow-hidden rounded-2xl border border-red-500/30 bg-gradient-to-r from-red-950/40 via-purple-950/40 to-slate-900 p-6 shadow-xl text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500 text-white shadow-lg ring-4 ring-red-500/20">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-extrabold tracking-tight font-heading">
                  {t('title', { defaultValue: 'Hệ Thống Quản Trị Quản Lý (Admin Portal)' })}
                </h1>
                <span className="rounded-full bg-red-500/20 border border-red-500/40 px-2.5 py-0.5 text-[10px] font-bold text-red-400 uppercase">
                  System Administrator
                </span>
              </div>
              <p className="text-xs text-gray-300 mt-1">
                {t('subtitle', { defaultValue: 'Quản lý toàn bộ người dùng, quyền hạn hệ thống và giám sát tài nguyên TaskFlow.' })}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="flex items-center space-x-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 text-xs font-semibold text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              <span>{t('systemStatus', { defaultValue: 'Trạng thái hệ thống' })}: {stats?.systemHealth || 'ONLINE'}</span>
            </span>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-600 dark:text-emerald-400">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="font-bold underline">
            {tCommon('actions.close', { defaultValue: 'Đóng' })}
          </button>
        </div>
      )}

      {/* Admin Stats Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex items-center space-x-4 rounded-2xl border border-surface-border bg-surface p-5 shadow-xs">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-text-primary font-heading">
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : stats?.totalUsers || 0}
            </div>
            <div className="text-xs text-text-muted">
              {t('stats.totalUsers', { defaultValue: 'Tổng số người dùng hệ thống' })}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4 rounded-2xl border border-surface-border bg-surface p-5 shadow-xs">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-text-primary font-heading">
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : stats?.activeUsers || 0}
            </div>
            <div className="text-xs text-text-muted">
              {t('stats.activeUsers', { defaultValue: 'Tài khoản đang hoạt động' })}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4 rounded-2xl border border-surface-border bg-surface p-5 shadow-xs">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-text-primary font-heading">
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : stats?.totalWorkspaces || 0}
            </div>
            <div className="text-xs text-text-muted">
              {t('stats.totalWorkspaces', { defaultValue: 'Tổng số Workspaces' })}
            </div>
          </div>
        </div>
      </div>

      {/* User Management Section */}
      <div className="rounded-2xl border border-surface-border bg-surface p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-border pb-4">
          <div>
            <h2 className="text-base font-bold text-text-primary font-heading">
              {t('userManagement.title', { defaultValue: 'Danh Sách & Quản Lý Người Dùng' })}
            </h2>
            <p className="text-xs text-text-secondary">
              {t('userManagement.subtitle', { defaultValue: 'Xem, khóa/mở khóa tài khoản hoặc gán quyền Admin cho các tài khoản trong hệ thống.' })}
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-text-muted" />
            <input
              type="text"
              placeholder={t('userManagement.searchPlaceholder', { defaultValue: 'Tìm theo tên hoặc email...' })}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-surface-border bg-surface-alt pl-9 pr-3 py-1.5 text-xs text-text-primary focus:border-primary focus:outline-hidden"
            />
          </div>
        </div>

        {/* User Table */}
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-surface-border bg-surface-alt/50 text-[11px] font-bold text-text-muted uppercase">
                <tr>
                  <th className="px-4 py-3">{t('userManagement.columns.user', { defaultValue: 'Người dùng' })}</th>
                  <th className="px-4 py-3">{t('userManagement.columns.email', { defaultValue: 'Email' })}</th>
                  <th className="px-4 py-3">{t('userManagement.columns.role', { defaultValue: 'Quyền hệ thống' })}</th>
                  <th className="px-4 py-3">{t('userManagement.columns.status', { defaultValue: 'Trạng thái' })}</th>
                  <th className="px-4 py-3 text-right">{t('userManagement.columns.actions', { defaultValue: 'Thao tác Admin' })}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {filteredUsers.map((u) => {
                  const isAdmin = u.roles?.includes('ROLE_ADMIN');
                  const isLocked = u.status === 'LOCKED';

                  return (
                    <tr key={u.id} className="hover:bg-surface-alt/40 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white shadow-xs">
                            {u.fullName?.substring(0, 1).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <span className="font-semibold text-text-primary block">{u.fullName}</span>
                            {u.id === currentUser?.id && (
                              <span className="text-[10px] text-primary font-bold">(Bạn)</span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 font-medium text-text-secondary">{u.email}</td>

                      <td className="px-4 py-3">
                        {isAdmin ? (
                          <span className="inline-flex items-center space-x-1 rounded-full bg-red-500/10 border border-red-500/30 px-2.5 py-0.5 text-[10px] font-bold text-red-500">
                            <Shield className="h-3 w-3" />
                            <span>ROLE_ADMIN</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 rounded-full bg-blue-500/10 border border-blue-500/30 px-2.5 py-0.5 text-[10px] font-bold text-blue-500">
                            <span>ROLE_USER</span>
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {isLocked ? (
                          <span className="inline-flex items-center space-x-1 rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 text-[10px] font-bold text-amber-500">
                            <Lock className="h-3 w-3" />
                            <span>{t('userManagement.status.locked', { defaultValue: 'BỊ KHÓA' })}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-500">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>{t('userManagement.status.active', { defaultValue: 'HOẠT ĐỘNG' })}</span>
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {/* Toggle Lock */}
                          <button
                            disabled={actionLoadingId === u.id || u.id === currentUser?.id}
                            onClick={() => handleToggleLock(u)}
                            className={`flex items-center space-x-1 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition ${
                              isLocked
                                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white'
                                : 'border-amber-500/30 bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white'
                            } disabled:opacity-30`}
                            title={isLocked ? t('userManagement.actions.unlockTooltip', { defaultValue: 'Mở khóa tài khoản' }) : t('userManagement.actions.lockTooltip', { defaultValue: 'Khóa tài khoản' })}
                          >
                            {isLocked ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                            <span>{isLocked ? t('userManagement.actions.unlock', { defaultValue: 'Mở khóa' }) : t('userManagement.actions.lock', { defaultValue: 'Khóa' })}</span>
                          </button>

                          {/* Toggle Role */}
                          <button
                            disabled={actionLoadingId === u.id || u.id === currentUser?.id}
                            onClick={() => handleToggleRole(u)}
                            className="flex items-center space-x-1 rounded-lg border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 text-[11px] font-medium text-purple-500 hover:bg-purple-500 hover:text-white transition disabled:opacity-30"
                            title={t('userManagement.actions.roleTooltip', { defaultValue: 'Chuyển quyền giữa Admin và User' })}
                          >
                            <Shield className="h-3 w-3" />
                            <span>{isAdmin ? t('userManagement.actions.makeUser', { defaultValue: 'Về User' }) : t('userManagement.actions.makeAdmin', { defaultValue: 'Lên Admin' })}</span>
                          </button>

                          {/* Deactivate User */}
                          <button
                            disabled={actionLoadingId === u.id || u.id === currentUser?.id}
                            onClick={() => handleDeleteUser(u)}
                            className="rounded-lg border border-red-500/30 bg-red-500/10 p-1 text-red-500 hover:bg-red-500 hover:text-white transition disabled:opacity-30"
                            title={t('userManagement.actions.deleteTooltip', { defaultValue: 'Xóa / Vô hiệu hóa tài khoản' })}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
