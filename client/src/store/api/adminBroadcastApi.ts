import { adminBaseApi } from './adminBaseApi';

export const adminBroadcastApi = adminBaseApi.injectEndpoints({
  endpoints: (builder) => ({
    sendBroadcast: builder.mutation<any, { title: string; message: string; target: string }>({
      query: (body) => ({
        url: '/api/v1/admin/broadcast',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { 
  useSendBroadcastMutation 
} = adminBroadcastApi;
