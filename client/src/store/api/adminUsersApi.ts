import { adminBaseApi } from './adminBaseApi';

export const adminUsersApi = adminBaseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<any, any>({
      query: (params) => ({
        url: '/api/v1/admin/users',
        params,
      }),
      providesTags: ['AdminUsers'],
    }),
    getUserDetail: builder.query<any, string>({
      query: (id) => `/api/v1/admin/users/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'AdminUsers', id }],
    }),
    updateUserStatus: builder.mutation<any, { id: string; status: string; suspensionDays?: number }>({
      query: ({ id, ...body }) => ({
        url: `/api/v1/admin/users/${id}/status`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['AdminUsers', 'AdminAnalytics'],
    }),
    toggleUserPremium: builder.mutation<any, { id: string; isPremium: boolean }>({
      query: ({ id, ...body }) => ({
        url: `/api/v1/admin/users/${id}/premium`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['AdminUsers', 'AdminAnalytics'],
    }),
  }),
});

export const { 
  useGetUsersQuery, 
  useGetUserDetailQuery, 
  useUpdateUserStatusMutation, 
  useToggleUserPremiumMutation 
} = adminUsersApi;
