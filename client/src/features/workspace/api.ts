import { api } from '@/store/api';

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  type: 'PERSONAL' | 'ORGANIZATION';
  logoUrl?: string | null;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceMember {
  id: string;
  userId: string;
  email: string;
  name: string;
  role: string;
  avatarUrl?: string | null;
}

export interface WorkspaceInvite {
  id: string;
  email: string;
  role: string;
  token: string;
  expiresAt: string;
  createdAt: string;
}

export interface WorkspaceRole {
  id: string;
  name: string;
  permissions: string[];
  isSystem: boolean;
}

export const workspaceApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getWorkspaces: builder.query<Workspace[], void>({
      query: () => '/workspaces',
      providesTags: ['Workspace'],
    }),
    getWorkspaceById: builder.query<Workspace, string>({
      query: (id) => `/workspaces/${id}`,
      providesTags: (result, error, id) => [{ type: 'Workspace', id }],
    }),
    getWorkspaceBySlug: builder.query<Workspace, string>({
      query: (slug) => `/workspaces/slug/${slug}`,
      providesTags: (result, error, slug) => [{ type: 'Workspace', id: `SLUG-${slug}` }],
    }),
    createWorkspace: builder.mutation<Workspace, Partial<Workspace>>({
      query: (body) => ({
        url: '/workspaces',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Workspace'],
    }),
    updateWorkspace: builder.mutation<Workspace, { id: string; data: Partial<Workspace> }>({
      query: ({ id, data }) => ({
        url: `/workspaces/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Workspace', id }, 'Workspace'],
    }),
    deleteWorkspace: builder.mutation<void, string>({
      query: (id) => ({
        url: `/workspaces/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Workspace'],
    }),

    // Members
    getWorkspaceMembers: builder.query<WorkspaceMember[], string>({
      query: (workspaceId) => `/workspaces/${workspaceId}/members`,
      providesTags: (result, error, workspaceId) => [
        { type: 'Workspace', id: `MEMBERS-${workspaceId}` },
      ],
    }),
    updateMemberRole: builder.mutation<WorkspaceMember, { workspaceId: string; memberId: string; role: string }>({
      query: ({ workspaceId, memberId, role }) => ({
        url: `/workspaces/${workspaceId}/members/${memberId}`,
        method: 'PUT',
        body: { role },
      }),
      invalidatesTags: (result, error, { workspaceId }) => [
        { type: 'Workspace', id: `MEMBERS-${workspaceId}` },
      ],
    }),
    removeMember: builder.mutation<void, { workspaceId: string; memberId: string }>({
      query: ({ workspaceId, memberId }) => ({
        url: `/workspaces/${workspaceId}/members/${memberId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { workspaceId }) => [
        { type: 'Workspace', id: `MEMBERS-${workspaceId}` },
      ],
    }),

    // Invites
    getPendingInvites: builder.query<WorkspaceInvite[], string>({
      query: (workspaceId) => `/workspaces/${workspaceId}/invites`,
      providesTags: (result, error, workspaceId) => [
        { type: 'Workspace', id: `INVITES-${workspaceId}` },
      ],
    }),
    sendInvite: builder.mutation<WorkspaceInvite, { workspaceId: string; email: string; role: string }>({
      query: ({ workspaceId, ...body }) => ({
        url: `/workspaces/${workspaceId}/invites`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { workspaceId }) => [
        { type: 'Workspace', id: `INVITES-${workspaceId}` },
      ],
    }),
    revokeInvite: builder.mutation<void, { workspaceId: string; inviteId: string }>({
      query: ({ workspaceId, inviteId }) => ({
        url: `/workspaces/${workspaceId}/invites/${inviteId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { workspaceId }) => [
        { type: 'Workspace', id: `INVITES-${workspaceId}` },
      ],
    }),
    acceptInvite: builder.mutation<WorkspaceMember, { token: string }>({
      query: (body) => ({
        url: '/workspaces/invites/accept',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Workspace'],
    }),

    // Roles
    getWorkspaceRoles: builder.query<WorkspaceRole[], string>({
      query: (workspaceId) => `/workspaces/${workspaceId}/roles`,
      providesTags: (result, error, workspaceId) => [
        { type: 'Workspace', id: `ROLES-${workspaceId}` },
      ],
    }),
    createWorkspaceRole: builder.mutation<WorkspaceRole, { workspaceId: string; name: string; permissions: string[] }>({
      query: ({ workspaceId, ...body }) => ({
        url: `/workspaces/${workspaceId}/roles`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { workspaceId }) => [
        { type: 'Workspace', id: `ROLES-${workspaceId}` },
      ],
    }),
    updateWorkspaceRole: builder.mutation<WorkspaceRole, { workspaceId: string; roleId: string; name?: string; permissions?: string[] }>({
      query: ({ workspaceId, roleId, ...body }) => ({
        url: `/workspaces/${workspaceId}/roles/${roleId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { workspaceId }) => [
        { type: 'Workspace', id: `ROLES-${workspaceId}` },
      ],
    }),
    deleteWorkspaceRole: builder.mutation<void, { workspaceId: string; roleId: string }>({
      query: ({ workspaceId, roleId }) => ({
        url: `/workspaces/${workspaceId}/roles/${roleId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { workspaceId }) => [
        { type: 'Workspace', id: `ROLES-${workspaceId}` },
      ],
    }),
  }),
});

export const {
  useGetWorkspacesQuery,
  useGetWorkspaceByIdQuery,
  useGetWorkspaceBySlugQuery,
  useCreateWorkspaceMutation,
  useUpdateWorkspaceMutation,
  useDeleteWorkspaceMutation,
  useGetWorkspaceMembersQuery,
  useUpdateMemberRoleMutation,
  useRemoveMemberMutation,
  useGetPendingInvitesQuery,
  useSendInviteMutation,
  useRevokeInviteMutation,
  useAcceptInviteMutation,
  useGetWorkspaceRolesQuery,
  useCreateWorkspaceRoleMutation,
  useUpdateWorkspaceRoleMutation,
  useDeleteWorkspaceRoleMutation,
} = workspaceApi;
