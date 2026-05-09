import React from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Loader2, MessageSquareHeart } from 'lucide-react';
import { Link } from 'react-router-dom';

import type { RootState } from '../store/store';
import { useGetMatchesQuery } from '../store/api/chatApi';
import { MatchCard } from '../features/matches/MatchCard';
import { Button } from '../components/ui/Button';

export const Matches = () => {
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const { data, isLoading } = useGetMatchesQuery();

  const matches = data?.data || [];

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-4xl mx-auto w-full">
      <header className="p-4 sm:p-6 sticky top-0 bg-background/80 backdrop-blur-md z-10 border-b border-border">
        <h1 className="text-2xl font-bold font-accent text-text-primary">Messages</h1>
      </header>

      <main className="flex-1 p-4 sm:p-6">
        {isLoading ? (
          <div className="flex justify-center mt-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : matches.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {matches.map((match, index) => (
              <motion.div
                key={match._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <MatchCard match={match} currentUser={currentUser!} />
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center text-center mt-20"
          >
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <MessageSquareHeart className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">No matches yet</h2>
            <p className="text-text-secondary mb-8 max-w-sm">
              Keep swiping to find your perfect match. When you match with someone, you can start chatting here!
            </p>
            <Link to="/discover">
              <Button>Start Discovering</Button>
            </Link>
          </motion.div>
        )}
      </main>
    </div>
  );
};
