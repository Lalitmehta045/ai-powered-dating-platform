import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ArrowLeft, MoreVertical, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

import type { RootState } from '../store/store';
import { useGetMatchesQuery, useSendMessageMutation, useMarkAsReadMutation } from '../store/api/chatApi';
import { setActiveChatId } from '../store/slices/messageSlice';

import { ChatWindow } from '../features/chat/ChatWindow';
import { ChatInput } from '../features/chat/ChatInput';
import { ProfileViewModal } from '../features/profile/ProfileViewModal';

export const Chat = () => {
  const { userId: matchId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const currentUser = useSelector((state: RootState) => state.auth.user);
   const [isProfileModalOpen, setIsProfileModalOpen] = React.useState(false);
  const onlineUsers = useSelector((state: RootState) => state.message.onlineUsers);
  
  const { data: matchesData } = useGetMatchesQuery();
  const [sendMessage] = useSendMessageMutation();
  const [markAsRead] = useMarkAsReadMutation();

  const match = matchesData?.data?.find(m => m._id === matchId);
  const otherUser = match?.users?.find(u => u._id !== currentUser?._id && u.id !== currentUser?.id);
  const isOnline = otherUser ? onlineUsers.includes(otherUser._id || otherUser.id) : false;

  useEffect(() => {
    if (matchId) {
      dispatch(setActiveChatId(matchId));
      markAsRead(matchId).catch(() => {});
    }
    return () => {
      dispatch(setActiveChatId(null));
    };
  }, [matchId, dispatch, markAsRead]);

  if (!matchId) {
    navigate('/matches');
    return null;
  }

  const handleSendMessage = async (content: string) => {
    try {
      await sendMessage({ matchId, content }).unwrap();
    } catch (err) {
      toast.error('Failed to send message');
    }
  };

  const defaultImage = "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&q=80&w=150&h=150";

  return (
    <div className="flex flex-col h-screen bg-background relative z-50">
      {/* Header */}
      <header className="flex-shrink-0 bg-card/80 backdrop-blur-xl border-b border-border p-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <Link to="/matches" className="p-2 -ml-2 rounded-full hover:bg-white/10 text-text-primary transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setIsProfileModalOpen(true)}
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-border group-hover:border-primary transition-colors">
                <img 
                  src={otherUser?.profileImage || defaultImage} 
                  alt={otherUser?.name || 'User'} 
                  className="w-full h-full object-cover"
                />
              </div>
              {isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-success border-2 border-card rounded-full" />
              )}
            </div>
            <div>
              <h2 className="text-white font-bold group-hover:text-primary transition-colors">{otherUser?.name || 'Loading...'}</h2>
              <p className="text-xs text-text-secondary">
                {isOnline ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 rounded-full hover:bg-white/10 text-text-primary transition-colors">
            <Shield className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-full hover:bg-white/10 text-text-primary transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <ChatWindow matchId={matchId} />

      {/* Input Area */}
      <ChatInput matchId={matchId} onSend={handleSendMessage} />

      {/* Profile Modal */}
      <ProfileViewModal 
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={otherUser as any}
      />
    </div>
  );
};
