import { apiClient } from '@/lib/api-client';

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface AdminStatsDto {
  totalUsers: number;
  activeUsers: number;
  totalWorkspaces: number;
  systemHealth: string;
  version: string;
}

export interface AdminUserDto {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  status: string;
  roles: string[];
  createdAt: string;
}

export interface CreateUserPayload {
  email: string;
  password: string;
  fullName: string;
  role: string;
}

export const adminService = {
  getStats: async (): Promise<AdminStatsDto> => {
    const res = await apiClient.get<ApiResponse<AdminStatsDto>>('/admin/stats');
    return res.data.data;
  },

  getAllUsers: async (): Promise<AdminUserDto[]> => {
    const res = await apiClient.get<ApiResponse<AdminUserDto[]>>('/admin/users');
    return res.data.data;
  },

  createUser: async (payload: CreateUserPayload): Promise<AdminUserDto> => {
    const res = await apiClient.post<ApiResponse<AdminUserDto>>('/admin/users', payload);
    return res.data.data;
  },

  updateUserStatus: async (userId: string, status: 'ACTIVE' | 'LOCKED'): Promise<AdminUserDto> => {
    const res = await apiClient.put<ApiResponse<AdminUserDto>>(`/admin/users/${userId}/status?status=${status}`);
    return res.data.data;
  },

  updateUserRole: async (userId: string, roleName: 'ADMIN' | 'USER'): Promise<AdminUserDto> => {
    const res = await apiClient.put<ApiResponse<AdminUserDto>>(`/admin/users/${userId}/role?roleName=${roleName}`);
    return res.data.data;
  },

  deleteUser: async (userId: string): Promise<void> => {
    await apiClient.delete(`/admin/users/${userId}`);
  },
};
