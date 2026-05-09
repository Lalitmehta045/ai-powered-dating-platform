import { adminBaseApi } from './adminBaseApi';

export const adminPremiumApi = adminBaseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRevenueDashboard: builder.query<any, void>({
      query: () => '/api/v1/admin/premium/revenue',
      providesTags: ['AdminAnalytics'],
    }),
    getPremiumUsers: builder.query<any, { page?: number; limit?: number }>({
      query: (params) => ({
        url: '/api/v1/admin/premium/users',
        params,
      }),
      providesTags: ['AdminUsers'],
    }),
    adjustSubscription: builder.mutation<any, { id: string; isPremium: boolean; subscriptionType?: string; expiryDays?: number }>({
      query: ({ id, ...body }) => ({
        url: `/api/v1/admin/premium/adjust/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['AdminUsers', 'AdminAnalytics'],
    }),
  }),
});

export const { 
  useGetRevenueDashboardQuery, 
  useGetPremiumUsersQuery, 
  useAdjustSubscriptionMutation 
} = adminPremiumApi;
