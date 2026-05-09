import { adminBaseApi } from './adminBaseApi';

export const adminAuditApi = adminBaseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAuditLogs: builder.query<any, { page?: number; limit?: number; action?: string; adminId?: string }>({
      query: (params) => ({
        url: '/api/v1/admin/audit',
        params,
      }),
      providesTags: ['AdminAnalytics'],
    }),
  }),
});

export const { 
  useGetAuditLogsQuery 
} = adminAuditApi;
