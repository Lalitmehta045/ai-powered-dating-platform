import { adminBaseApi } from './adminBaseApi';

export const adminReportsApi = adminBaseApi.injectEndpoints({
  endpoints: (builder) => ({
    getReports: builder.query<any, any>({
      query: (params) => ({
        url: '/api/v1/admin/reports',
        params,
      }),
      providesTags: ['AdminAnalytics'], // Re-using analytics tag to trigger refresh on actions
    }),
    resolveReport: builder.mutation<any, { id: string; action: string; suspensionDays?: number }>({
      query: ({ id, ...body }) => ({
        url: `/api/v1/admin/reports/${id}/resolve`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['AdminAnalytics', 'AdminUsers'],
    }),
  }),
});

export const { 
  useGetReportsQuery, 
  useResolveReportMutation 
} = adminReportsApi;
