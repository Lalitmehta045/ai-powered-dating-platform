import { baseApi } from './baseApi';
import type { User } from '../slices/authSlice';

interface RecommendationResponse {
  success: boolean;
  data: {
    users: User[];
    page: number;
    limit: number;
    results: number;
    swipeLimit?: {
      allowed: boolean;
      remaining: number;
      limit: number;
    };
  };
}

export const recommendationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRecommendations: builder.query<RecommendationResponse, { page?: number; limit?: number } | void>({
      query: (params) => ({
        url: '/users/recommendations',
        params: params || undefined,
      }),
      providesTags: ['User'],
      // Optional: Handle merge for pagination in future if needed
      // serializeQueryArgs: ({ endpointName }) => { return endpointName; },
      // merge: (currentCache, newItems) => { currentCache.data.push(...newItems.data); },
      // forceRefetch({ currentArg, previousArg }) { return currentArg !== previousArg; }
    }),
  }),
});

export const { useGetRecommendationsQuery } = recommendationApi;
