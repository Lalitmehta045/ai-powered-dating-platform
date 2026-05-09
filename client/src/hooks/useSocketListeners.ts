import { useEffect, useRef } from 'react';
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
  const { activeChatId } = useSelector((state: RootState) => state.message);
  
  // Use a ref to track activeChatId so the socket closure always sees the latest value
  const activeChatIdRef = useRef(activeChatId);
  
  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  useEffect(() => {
    const socket = socketClient.getSocket();
    
    if (!isAuthenticated || !socket) return;

    // Handle online users
    socket.on('online-users', (users: string[]) => {
      console.log('Received online-users:', users);
      dispatch(setOnlineUsers(users));
    });

    socket.on('user-online', (userId: string) => {
      console.log('User online:', userId);
      dispatch(userOnline(userId));
    });

    socket.on('user-offline', (userId: string) => {
      console.log('User offline:', userId);
      dispatch(userOffline(userId));
    });

    // Handle typing indicators
    socket.on('typing', ({ matchId, userId }) => {
      console.log('User typing:', { matchId, userId });
      dispatch(setTyping({ matchId, userId }));
    });

    socket.on('stop-typing', ({ matchId }) => {
      console.log('User stopped typing:', matchId);
      dispatch(stopTyping({ matchId }));
    });

    // Handle incoming messages
    socket.on('receive-message', (message: any) => {
      console.log('Received message:', message);
      // Optimistically update the chat history cache
      if (message.matchId) {
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
      }
      
      // Also invalidate Match list to update lastMessage and unread counts
      dispatch(chatApi.util.invalidateTags(['Match']));

      // Only show toast if:
      // 1. We are NOT the sender
      // 2. We are NOT currently in that chat (message.matchId !== activeChatId)
      // 3. User has notifications ENABLED in settings
      const isMe = message.senderId === user?.id || message.senderId === user?._id;
      const isInActiveChat = message.matchId === activeChatIdRef.current;
      const notificationsEnabled = user?.settings?.notificationsEnabled ?? true;

      if (!isMe && !isInActiveChat && notificationsEnabled) {
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
