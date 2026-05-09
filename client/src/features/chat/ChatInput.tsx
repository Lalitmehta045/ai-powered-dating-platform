import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { socketClient } from '../../socket/socketClient';
import { useGetChatSuggestionsQuery } from '../../store/api/aiApi';

interface ChatInputProps {
  matchId: string;
  onSend: (content: string) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ matchId, onSend }) => {
  const [content, setContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { data: suggestionsData } = useGetChatSuggestionsQuery(matchId);
  const suggestions = suggestionsData?.data?.suggestions || [];

  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }

    const socket = socketClient.getSocket();
    if (socket) {
      if (!isTyping) {
        setIsTyping(true);
        socket.emit('typing', { matchId });
      }

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        socket.emit('stop-typing', { matchId });
      }, 2000);
    }
  };

  const handleSend = () => {
    if (!content.trim()) return;
    onSend(content.trim());
    setContent('');
    setIsTyping(false);
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    const socket = socketClient.getSocket();
    if (socket) socket.emit('stop-typing', { matchId });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 bg-background/80 backdrop-blur-md border-t border-border flex flex-col gap-3">
      {/* AI Suggestions */}
      <AnimatePresence>
        {suggestions.length > 0 && !content.trim() && (
          <motion.div 
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 10, height: 0 }}
            className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 max-w-4xl mx-auto w-full"
          >
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => setContent(suggestion)}
                className="whitespace-nowrap px-4 py-2 rounded-full glass border border-secondary/30 text-xs text-secondary hover:bg-secondary/10 transition-colors flex items-center gap-1.5 shrink-0 shadow-sm"
              >
                <Sparkles className="w-3 h-3" />
                {suggestion}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-end gap-2 max-w-4xl mx-auto w-full">
        <button className="p-3 text-text-secondary hover:text-primary transition-colors shrink-0">
          <Smile className="w-6 h-6" />
        </button>
        
        <div className="flex-1 glass rounded-2xl relative overflow-hidden focus-within:ring-1 focus-within:ring-primary/50 transition-all">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleTyping}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="w-full max-h-[120px] bg-transparent border-none focus:ring-0 resize-none py-3 px-4 text-white placeholder-text-secondary text-sm md:text-base outline-none scrollbar-hide"
            rows={1}
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSend}
          disabled={!content.trim()}
          className="p-3 rounded-full bg-primary text-white disabled:opacity-50 disabled:cursor-not-allowed shrink-0 shadow-lg shadow-primary/25"
        >
          <Send className="w-5 h-5 ml-1" />
        </motion.button>
      </div>
    </div>
  );
};
