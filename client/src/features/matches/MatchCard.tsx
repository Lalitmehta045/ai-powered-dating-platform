import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { Match } from '../../store/slices/messageSlice';
import type { User } from '../../store/slices/authSlice';
import { cn } from '../../lib/utils';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';

interface MatchCardProps {
  match: Match;
  currentUser: User;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, currentUser }) => {
  const onlineUsers = useSelector((state: RootState) => state.message.onlineUsers);
  
  // Find the other user in the match
  const otherUser = match.users?.find((u: any) => 
    u._id !== currentUser._id && u.id !== currentUser.id
  );

  if (!otherUser) return null;

  const isOnline = onlineUsers.includes(otherUser._id || otherUser.id);
  const defaultImage = "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&q=80&w=150&h=150";

  return (
    <Link to={`/chat/${match._id}`}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="glass-card rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:bg-hover/50 transition-colors border border-border/50 hover:border-primary/30"
      >
        <div className="relative">
          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-transparent">
            <img 
              src={otherUser.profileImage || defaultImage} 
              alt={otherUser.name} 
              className="w-full h-full object-cover"
            />
          </div>
          {isOnline && (
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-success border-2 border-card rounded-full animate-pulse" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-text-primary font-semibold truncate text-lg">
            {otherUser.name}
          </h3>
          <p className={cn(
            "text-sm truncate",
            match.unreadCount ? "text-text-primary font-medium" : "text-text-secondary"
          )}>
            {match.lastMessage ? match.lastMessage.content : "Start a conversation!"}
          </p>
        </div>

        {match.unreadCount && match.unreadCount > 0 ? (
          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-text-primary shadow-lg shadow-primary/40">
            {match.unreadCount}
          </div>
        ) : null}
      </motion.div>
    </Link>
  );
};
