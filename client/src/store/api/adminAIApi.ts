import { adminBaseApi } from './adminBaseApi';

export const adminAIApi = adminBaseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFlaggedContent: builder.query<any, void>({
      query: () => '/api/v1/admin/ai-moderation/flags',
      providesTags: ['AdminAnalytics'],
    }),
    getSuspiciousUsers: builder.query<any, void>({
      query: () => '/api/v1/admin/ai-moderation/suspicious-users',
      providesTags: ['AdminUsers'],
    }),
  }),
});

export const { 
  useGetFlaggedContentQuery, 
  useGetSuspiciousUsersQuery 
} = adminAIApi;
