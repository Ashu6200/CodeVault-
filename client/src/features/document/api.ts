import { api } from '@/store/api';

export interface Document {
  id: string;
  title: string;
  content: any;
  workspaceId: string;
  authorId: string;
  parentId?: string | null;
  visibility: 'PUBLIC' | 'PRIVATE' | 'WORKSPACE';
  readingTime: number;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  title: string;
  content: any;
  versionNumber: number;
  changeSummary?: string | null;
  createdBy: string;
  createdAt: string;
}

export interface DocumentGrant {
  id: string;
  documentId: string;
  userId: string;
  permissions: string[];
  expiresAt?: string | null;
  createdAt: string;
}

export interface DocumentTreeItem {
  id: string;
  title: string;
  parentId?: string | null;
  children: DocumentTreeItem[];
}

export const documentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDocuments: builder.query<{ items: Document[]; total: number }, { workspaceId: string; page?: number; limit?: number; search?: string }>({
      query: ({ workspaceId, ...params }) => ({
        url: `/workspaces/${workspaceId}/documents`,
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: 'Document' as const, id })),
              { type: 'Document', id: 'LIST' },
            ]
          : [{ type: 'Document', id: 'LIST' }],
    }),
    getDocumentTree: builder.query<DocumentTreeItem[], string>({
      query: (workspaceId) => `/workspaces/${workspaceId}/documents/tree`,
      providesTags: (result, error, workspaceId) => [{ type: 'Document', id: `TREE-${workspaceId}` }],
    }),
    getDocument: builder.query<Document, { workspaceId: string; id: string }>({
      query: ({ workspaceId, id }) => `/workspaces/${workspaceId}/documents/${id}`,
      providesTags: (result, error, { id }) => [{ type: 'Document', id }],
    }),
    createDocument: builder.mutation<Document, { workspaceId: string; title: string; parentId?: string; content?: any }>({
      query: ({ workspaceId, ...body }) => ({
        url: `/workspaces/${workspaceId}/documents`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { workspaceId }) => [
        { type: 'Document', id: 'LIST' },
        { type: 'Document', id: `TREE-${workspaceId}` },
      ],
    }),
    updateDocument: builder.mutation<Document, { workspaceId: string; id: string; title?: string; content?: any; changeSummary?: string }>({
      query: ({ workspaceId, id, ...body }) => ({
        url: `/workspaces/${workspaceId}/documents/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id, workspaceId }) => [
        { type: 'Document', id },
        { type: 'Document', id: `TREE-${workspaceId}` },
      ],
    }),
    deleteDocument: builder.mutation<void, { workspaceId: string; id: string }>({
      query: ({ workspaceId, id }) => ({
        url: `/workspaces/${workspaceId}/documents/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { id, workspaceId }) => [
        { type: 'Document', id: 'LIST' },
        { type: 'Document', id: `TREE-${workspaceId}` },
      ],
    }),

    // Versions
    getDocumentVersions: builder.query<DocumentVersion[], { workspaceId: string; id: string }>({
      query: ({ workspaceId, id }) => `/workspaces/${workspaceId}/documents/${id}/versions`,
      providesTags: (result, error, { id }) => [{ type: 'Document', id: `VERSIONS-${id}` }],
    }),

    // Grants (ABAC)
    getDocumentGrants: builder.query<DocumentGrant[], { workspaceId: string; id: string }>({
      query: ({ workspaceId, id }) => `/workspaces/${workspaceId}/documents/${id}/grants`,
      providesTags: (result, error, { id }) => [{ type: 'Document', id: `GRANTS-${id}` }],
    }),
    grantDocumentAccess: builder.mutation<DocumentGrant, { workspaceId: string; id: string; userId: string; permissions: string[]; expiresAt?: string }>({
      query: ({ workspaceId, id, ...body }) => ({
        url: `/workspaces/${workspaceId}/documents/${id}/grants`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Document', id: `GRANTS-${id}` }],
    }),
    revokeDocumentAccess: builder.mutation<void, { workspaceId: string; id: string; userId: string }>({
      query: ({ workspaceId, id, userId }) => ({
        url: `/workspaces/${workspaceId}/documents/${id}/grants/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Document', id: `GRANTS-${id}` }],
    }),
  }),
});

export const {
  useGetDocumentsQuery,
  useGetDocumentTreeQuery,
  useGetDocumentQuery,
  useCreateDocumentMutation,
  useUpdateDocumentMutation,
  useDeleteDocumentMutation,
  useGetDocumentVersionsQuery,
  useGetDocumentGrantsQuery,
  useGrantDocumentAccessMutation,
  useRevokeDocumentAccessMutation,
} = documentApi;
