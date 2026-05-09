import { baseApi } from './baseApi';

export interface SwipeResponse {
  success: boolean;
  message: string;
  data: {
    match?: {
      _id: string;
      users: string[];
      createdAt: string;
      updatedAt: string;
    };
    remainingSwipes?: number;
  };
}

export const swipeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    swipeRight: builder.mutation<SwipeResponse, string>({
      query: (targetUserId) => ({
        url: `/swipes/right/${targetUserId}`,
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),
    swipeLeft: builder.mutation<SwipeResponse, string>({
      query: (targetUserId) => ({
        url: `/swipes/left/${targetUserId}`,
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const { useSwipeRightMutation, useSwipeLeftMutation } = swipeApi;
