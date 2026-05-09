import { baseApi } from './baseApi';

export interface Notification {
  _id: string;
  sender: string;
  receiver: string;
  type: 'new_match' | 'new_message' | 'profile_like' | 'system';
  text?: string;
  isRead: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
}

interface NotificationResponse {
  success: boolean;
  data: {
    notifications: Notification[];
    unreadCount: number;
    results: number;
  };
}

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<NotificationResponse, void>({
      query: () => ({
        url: '/notifications',
      }),
      providesTags: ['Notification'],
    }),
    markAsRead: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/notifications/read/${id}`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Notification'],
    }),
  }),
});

export const { useGetNotificationsQuery, useMarkAsReadMutation } = notificationApi;
