import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface Message {
  _id: string;
  matchId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface Match {
  _id: string;
  users: any[]; // The populated users
  lastMessage?: Message;
  unreadCount?: number;
  updatedAt: string;
}

interface MessageState {
  onlineUsers: string[];
  typingUsers: Record<string, string>; // matchId -> userId typing
  activeChatId: string | null;
}

const initialState: MessageState = {
  onlineUsers: [],
  typingUsers: {},
  activeChatId: null,
};

const messageSlice = createSlice({
  name: 'message',
  initialState,
  reducers: {
    setOnlineUsers: (state, action: PayloadAction<string[]>) => {
      state.onlineUsers = action.payload;
    },
    userOnline: (state, action: PayloadAction<string>) => {
      if (!state.onlineUsers.includes(action.payload)) {
        state.onlineUsers.push(action.payload);
      }
    },
    userOffline: (state, action: PayloadAction<string>) => {
      state.onlineUsers = state.onlineUsers.filter((id) => id !== action.payload);
    },
    setTyping: (state, action: PayloadAction<{ matchId: string; userId: string }>) => {
      state.typingUsers[action.payload.matchId] = action.payload.userId;
    },
    stopTyping: (state, action: PayloadAction<{ matchId: string }>) => {
      delete state.typingUsers[action.payload.matchId];
    },
    setActiveChatId: (state, action: PayloadAction<string | null>) => {
      state.activeChatId = action.payload;
    },
  },
});

export const {
  setOnlineUsers,
  userOnline,
  userOffline,
  setTyping,
  stopTyping,
  setActiveChatId,
} = messageSlice.actions;

export default messageSlice.reducer;
