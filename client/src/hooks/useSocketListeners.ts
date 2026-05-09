import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { socketClient } from '../socket/socketClient';
import { 
  userOnline, 
  userOffline, 
  setTyping, 
  stopTyping, 
  setOnlineUsers 
} from '../store/slices/messageSlice';
import type { RootState } from '../store/store';
import { chatApi } from '../store/api/chatApi';

export const useSocketListeners = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const socket = socketClient.getSocket();
    
    if (!isAuthenticated || !socket) return;

    // Handle online users
    socket.on('online-users', (users: string[]) => {
      dispatch(setOnlineUsers(users));
    });

    socket.on('user-online', (userId: string) => {
      dispatch(userOnline(userId));
    });

    socket.on('user-offline', (userId: string) => {
      dispatch(userOffline(userId));
    });

    // Handle typing indicators
    socket.on('typing', ({ matchId, userId }) => {
      dispatch(setTyping({ matchId, userId }));
    });

    socket.on('stop-typing', ({ matchId }) => {
      dispatch(stopTyping({ matchId }));
    });

    // Handle incoming messages
    socket.on('receive-message', (message: any) => {
      // Optimistically update the chat history cache
      dispatch(
        chatApi.util.updateQueryData('getChatHistory', message.matchId, (draft) => {
          if (!draft || !draft.data) return;
          // Check if message already exists to prevent duplicates
          const exists = draft.data.find((m) => m._id === message._id);
          if (!exists) {
            draft.data.push(message);
          }
        })
      );
      
      // Also invalidate Match list to update lastMessage and unread counts
      dispatch(chatApi.util.invalidateTags(['Match']));

      // Only show toast if we are NOT currently in that chat
      // We can get activeChatId from state, but inside this closure we need the latest.
      // A better way is to check the current URL or have activeChatId in a ref, 
      // but for now, simple toast is fine.
      if (message.senderId !== user?.id && message.senderId !== user?._id) {
        toast('New message received', {
          icon: '💬',
          style: {
            background: '#18181F',
            color: '#fff',
            border: '1px solid #2A2A35',
          },
        });
      }
    });

    socket.on('notification:new', (notification) => {
      toast.success(notification.message || 'New notification!');
    });

    return () => {
      socket.off('online-users');
      socket.off('user-online');
      socket.off('user-offline');
      socket.off('typing');
      socket.off('stop-typing');
      socket.off('receive-message');
      socket.off('notification:new');
    };
  }, [isAuthenticated, dispatch, user]);
};
