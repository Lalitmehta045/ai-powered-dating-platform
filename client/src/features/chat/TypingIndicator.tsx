import React from 'react';
import { motion } from 'framer-motion';

export const TypingIndicator = () => {
  return (
    <div className="flex items-center gap-1 p-4 rounded-2xl glass w-fit rounded-bl-none">
      <motion.div
        className="w-2 h-2 rounded-full bg-text-secondary"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
      />
      <motion.div
        className="w-2 h-2 rounded-full bg-text-secondary"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
      />
      <motion.div
        className="w-2 h-2 rounded-full bg-text-secondary"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
      />
    </div>
  );
};
