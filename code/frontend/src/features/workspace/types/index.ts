export interface WorkspaceDto {
  id: string;
  name: string;
  slug: string;
  description?: string;
  ownerId: string;
  iconUrl?: string;
  themeColor?: string;
  memberCount: number;
  userRole: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkspaceMemberDto {
  id: string;
  workspaceId: string;
  userId: string;
  email?: string;
  fullName?: string;
  avatarUrl?: string;
  role: string;
  status: string;
  joinedAt: string;
}

export interface CreateWorkspaceInput {
  name: string;
  slug?: string;
  description?: string;
  iconUrl?: string;
  themeColor?: string;
}

export interface UpdateWorkspaceInput {
  name: string;
  slug?: string;
  description?: string;
  iconUrl?: string;
  themeColor?: string;
}

export interface WorkspaceInvitationDto {
  id: string;
  workspaceId: string;
  email: string;
  role: string;
  token: string;
  status: string;
  expiresAt: string;
  createdAt: string;
}
