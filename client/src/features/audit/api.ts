import { api } from '@/store/api';

export interface AuditLog {
  id: string;
  action: string;
  actorId: string;
  actorType: 'USER' | 'API_KEY';
  resourceId: string;
  resourceType: string;
  workspaceId: string;
  metadata: any;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
}

export const auditApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAuditLogs: builder.query<{ items: AuditLog[]; total: number }, { workspaceId: string; page?: number; limit?: number; action?: string; resourceType?: string }>({
      query: ({ workspaceId, ...params }) => ({
        url: `/workspaces/${workspaceId}/audit`,
        params,
      }),
      providesTags: (result, error, { workspaceId }) => [{ type: 'Audit', id: `LIST-${workspaceId}` }],
    }),
  }),
});

export const { useGetAuditLogsQuery } = auditApi;
