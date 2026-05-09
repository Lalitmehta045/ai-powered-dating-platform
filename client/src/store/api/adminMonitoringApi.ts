import { adminBaseApi } from './adminBaseApi';

export const adminMonitoringApi = adminBaseApi.injectEndpoints({
  endpoints: (builder) => ({
    getHealthSnapshot: builder.query<any, void>({
      query: () => '/api/v1/admin/health/stats',
      providesTags: ['AdminAnalytics'],
    }),
  }),
});

export const { 
  useGetHealthSnapshotQuery 
} = adminMonitoringApi;
