import { baseApi } from './baseApi';
import type { Match, Message } from '../slices/messageSlice';

interface MatchesResponse {
  success: boolean;
  data: Match[];
}

interface ChatHistoryResponse {
  success: boolean;
  data: Message[];
}

export const chatApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMatches: builder.query<MatchesResponse, void>({
      query: () => '/matches',
      providesTags: ['Match'],
    }),
    getChatHistory: builder.query<ChatHistoryResponse, string>({
      query: (matchId) => `/chat/${matchId}/messages`,
      providesTags: (result, error, matchId) => [{ type: 'Chat', id: matchId }],
    }),
    sendMessage: builder.mutation<Message, { matchId: string; content: string }>({
      query: (data) => ({
        url: `/chat/${data.matchId}/messages`,
        method: 'POST',
        body: { content: data.content },
      }),
      // Optimistic update handled in component or socket listener usually
      invalidatesTags: (result, error, { matchId }) => [{ type: 'Chat', id: matchId }, 'Match'],
    }),
    markAsRead: builder.mutation<{ success: boolean }, string>({
      query: (matchId) => ({
        url: `/chat/${matchId}/read`,
        method: 'PUT',
      }),
      invalidatesTags: ['Match'],
    }),
  }),
});

export const {
  useGetMatchesQuery,
  useGetChatHistoryQuery,
  useSendMessageMutation,
  useMarkAsReadMutation,
} = chatApi;
