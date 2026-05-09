import { baseApi } from './baseApi';
import { setCredentials } from '../slices/authSlice';
import type { User } from '../slices/authSlice';

interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
  };
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, any>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.data) {
            dispatch(setCredentials({ user: data.data.user, token: data.data.accessToken }));
          }
        } catch (err) {
          // Error is handled in the component
        }
      },
    }),
    register: builder.mutation<AuthResponse, any>({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.data) {
            dispatch(setCredentials({ user: data.data.user, token: data.data.accessToken }));
          }
        } catch (err) {
          // Handle error
        }
      },
    }),
    getCurrentUser: builder.query<{ success: boolean; data: { user: User } }, void>({
      query: () => '/users/me',
      providesTags: ['User'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.data?.user) {
            // Update user in slice but keep existing token
            const token = localStorage.getItem('token') || '';
            dispatch(setCredentials({ user: data.data.user, token }));
          }
        } catch (err) {
          // If unauthenticated or token expired, handled by query response
        }
      },
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation, useGetCurrentUserQuery } = authApi;
