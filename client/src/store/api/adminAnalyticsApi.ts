import { adminBaseApi } from './adminBaseApi';

export const adminAnalyticsApi = adminBaseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOverviewAnalytics: builder.query<any, void>({
      query: () => '/api/v1/admin/analytics/overview',
      providesTags: ['AdminAnalytics'],
    }),
    getRealtimeAnalytics: builder.query<any, void>({
      query: () => '/api/v1/admin/analytics/realtime',
      providesTags: ['AdminAnalytics'],
    }),
  }),
});

export const { 
  useGetOverviewAnalyticsQuery, 
  useGetRealtimeAnalyticsQuery 
} = adminAnalyticsApi;
