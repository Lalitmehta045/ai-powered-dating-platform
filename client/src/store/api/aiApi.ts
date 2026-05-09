import { baseApi } from './baseApi';

interface GenerateBioPayload {
  tone: string;
  currentBio?: string;
}

interface GenerateBioResponse {
  success: boolean;
  data: {
    bio: string;
  };
}

interface ChatSuggestionsResponse {
  success: boolean;
  data: {
    suggestions: string[];
  };
}

export const aiApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    generateBio: builder.mutation<GenerateBioResponse, GenerateBioPayload>({
      query: (data) => ({
        url: '/ai/generate-bio',
        method: 'POST',
        body: data,
      }),
    }),
    getChatSuggestions: builder.query<ChatSuggestionsResponse, string>({
      query: (matchId) => `/ai/chat-suggestions/${matchId}`,
      // Cache suggestions for 5 minutes per match
      keepUnusedDataFor: 300,
    }),
  }),
});

export const { useGenerateBioMutation, useGetChatSuggestionsQuery } = aiApi;
