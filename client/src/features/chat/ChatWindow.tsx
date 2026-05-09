import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Loader2 } from 'lucide-react';
import type { RootState } from '../../store/store';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { useGetChatHistoryQuery } from '../../store/api/chatApi';

interface ChatWindowProps {
  matchId: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ matchId }) => {
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const typingUsers = useSelector((state: RootState) => state.message.typingUsers);
  
  const { data: historyData, isLoading } = useGetChatHistoryQuery(matchId);
  const messages = historyData?.data || [];
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const isTyping = !!typingUsers[matchId];

  useEffect(() => {
    // Auto-scroll to bottom
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-hide">
      <div className="max-w-4xl mx-auto flex flex-col justify-end min-h-full">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center h-full mb-10">
            <p className="text-text-secondary mb-2">It's quiet here...</p>
            <p className="text-text-primary font-medium">Send a message to break the ice!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble 
              key={msg._id} 
              message={msg} 
              isOwn={(msg.senderId === currentUser?._id) || (msg.senderId === currentUser?.id)} 
            />
          ))
        )}

        {isTyping && (
          <div className="mb-4">
            <TypingIndicator />
          </div>
        )}
        
        {/* Invisible div to scroll to bottom */}
        <div ref={bottomRef} className="h-6" />
      </div>
    </div>
  );
};
