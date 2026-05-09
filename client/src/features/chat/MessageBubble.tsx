import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import type { Message } from '../../store/slices/messageSlice';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn }) => {
  const time = new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex w-full mb-4",
        isOwn ? "justify-end" : "justify-start"
      )}
    >
      <div className={cn(
        "max-w-[75%] rounded-2xl px-4 py-2 relative group",
        isOwn ? "bg-primary text-text-primary rounded-br-sm" : "glass rounded-bl-sm text-text-primary"
      )}>
        <p className="text-sm md:text-base break-words leading-relaxed">{message.content}</p>
        <span className={cn(
          "text-[10px] mt-1 block opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-5",
          isOwn ? "right-0 text-text-secondary" : "left-0 text-text-secondary"
        )}>
          {time} {isOwn && (message.isRead ? '· Read' : '· Delivered')}
        </span>
      </div>
    </motion.div>
  );
};
