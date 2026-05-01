import { api } from '@/store/api';

export interface Notification {
  id: string;
  type: string;
  message: string;
  isRead: boolean;
  workspaceId?: string | null;
  createdAt: string;
}

export const notificationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<{ items: Notification[]; total: number }, { page?: number; limit?: number; isRead?: boolean; workspaceId?: string }>({
      query: (params) => ({
        url: '/notifications',
        params,
      }),
      providesTags: ['Notification'],
    }),
    getUnreadCount: builder.query<{ count: number }, void>({
      query: () => '/notifications/unread-count',
      providesTags: ['Notification'],
    }),
    markRead: builder.mutation<void, string[]>({
      query: (ids) => ({
        url: '/notifications/mark-read',
        method: 'POST',
        body: { ids },
      }),
      invalidatesTags: ['Notification'],
    }),
    markAllRead: builder.mutation<void, void>({
      query: () => ({
        url: '/notifications/mark-all-read',
        method: 'POST',
      }),
      invalidatesTags: ['Notification'],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkReadMutation,
  useMarkAllReadMutation,
} = notificationApi;
