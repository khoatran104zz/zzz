import type { UserDto } from '@/features/auth/types';

export type WorkspaceRole = 'OWNER' | 'ADMIN' | 'MANAGER' | 'MEMBER';

export interface WorkspaceMemberDto {
  id: string;
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
  status: string;
  joinedAt: string;
  user?: UserDto;
  email?: string;
  fullName?: string;
}

export interface WorkspaceInvitationDto {
  id: string;
  workspaceId: string;
  email: string;
  role: WorkspaceRole;
  token: string;
  status: string;
  expiresAt: string;
  createdAt: string;
}

export interface ProjectMemberDto {
  id: string;
  projectId: string;
  userId: string;
  role: WorkspaceRole;
  joinedAt: string;
  user?: UserDto;
}

export interface InviteMemberPayload {
  email: string;
  role: WorkspaceRole;
}

export interface UpdateRolePayload {
  role: WorkspaceRole;
}

export interface AddProjectMemberPayload {
  userId: string;
  role: WorkspaceRole;
}
