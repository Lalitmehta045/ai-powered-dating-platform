import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { Search, Filter, Loader2, Sparkles, RefreshCcw, MessageSquareHeart, Lock, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

import { useGetRecommendationsQuery } from '../store/api/recommendationApi';
import { useSwipeRightMutation, useSwipeLeftMutation } from '../store/api/swipeApi';
import type { RootState } from '../store/store';
import type { User } from '../store/slices/authSlice';

import { SwipeCard } from '../features/swipe/SwipeCard';
import { MatchModal } from '../features/swipe/MatchModal';
import { NotificationPanel } from '../features/notifications/NotificationPanel';
import { Button } from '../components/ui/Button';

export const Discover = () => {
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const { data: recommendationsData, isLoading, isFetching, refetch } = useGetRecommendationsQuery();
  
  const [swipeRight] = useSwipeRightMutation();
  const [swipeLeft] = useSwipeLeftMutation();

  const [cards, setCards] = useState<User[]>([]);
  const [matchedUser, setMatchedUser] = useState<User | null>(null);
  const [currentMatchId, setCurrentMatchId] = useState<string | null>(null);

  // Sync cards when recommendations data changes
  useEffect(() => {
    if (recommendationsData?.data?.users) {
      setCards(recommendationsData.data.users);
    }
  }, [recommendationsData]);

  const handleSwipe = async (direction: 'left' | 'right', swipedUser: User) => {
    const swipedId = swipedUser._id || swipedUser.id;
    
    // Optimistically remove from local state
    setCards((prev) => prev.filter((user) => (user._id || user.id) !== swipedId));

    try {
      const targetId = swipedUser._id || swipedUser.id;
      if (!targetId) throw new Error("Missing user ID");

      if (direction === 'right') {
        const result = await swipeRight(targetId).unwrap();
        // If match, trigger modal
        if (result.data?.match) {
          setMatchedUser(swipedUser);
          setCurrentMatchId(result.data.match._id);
        }
      } else {
        await swipeLeft(targetId).unwrap();
      }
    } catch (error: any) {
      const message = error.data?.message || "Failed to register swipe. Please try again.";
      toast.error(message);
      // Rollback: card will reappear on next fetch or manual refresh
    }
  };

  const handleCloseMatch = () => {
    setMatchedUser(null);
    setCurrentMatchId(null);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pt-safe-top overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 p-4 sm:p-6 flex items-center justify-between z-10 max-w-lg mx-auto w-full">
        <h1 className="text-2xl font-bold font-accent text-text-primary">Discover</h1>
        <div className="flex gap-3">
          <NotificationPanel />
          <Link to="/matches">
            <div className="w-10 h-10 rounded-full glass flex items-center justify-center cursor-pointer hover:bg-hover transition-colors">
              <MessageSquareHeart className="w-5 h-5 text-text-primary" />
            </div>
          </Link>
          <div className="w-10 h-10 rounded-full glass flex items-center justify-center cursor-pointer hover:bg-hover transition-colors">
            <Filter className="w-5 h-5 text-text-primary" />
          </div>
        </div>
      </header>

      {/* Swipe Area */}
      <main className="flex-1 relative flex items-center justify-center p-4 sm:p-8 overflow-hidden z-0 max-w-lg mx-auto w-full">
        <div className="relative w-full aspect-[3/4] max-h-[70vh]">
          
          {(isLoading || (isFetching && cards.length === 0)) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center glass-card rounded-3xl">
              <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
              <p className="text-text-secondary font-medium">Finding potential matches...</p>
            </div>
          )}

          {!isLoading && !isFetching && recommendationsData?.data?.swipeLimit?.allowed === false && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center text-center glass-card rounded-3xl p-8 bg-gradient-to-b from-transparent to-primary/5"
            >
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-6 relative">
                <Lock className="w-10 h-10 text-primary" />
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-secondary rounded-full flex items-center justify-center">
                  <Zap className="w-3 h-3 text-white fill-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-text-primary mb-2 font-accent">Daily Limit Reached!</h3>
              <p className="text-text-secondary mb-8 max-w-[280px]">
                You've run out of swipes for today. Don't worry, your matches are waiting for you tomorrow!
              </p>
              
              <div className="space-y-3 w-full max-w-[240px]">
                <Link to="/premium" className="block w-full">
                  <Button variant="primary" className="w-full rounded-full shadow-lg shadow-primary/20">
                    Get Unlimited Swipes
                  </Button>
                </Link>
                <p className="text-xs text-text-secondary">Or wait for your limit to reset in 24 hours</p>
              </div>
            </motion.div>
          )}

          {!isLoading && !isFetching && cards.length === 0 && recommendationsData?.data?.swipeLimit?.allowed !== false && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center text-center glass-card rounded-3xl p-8"
            >
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Sparkles className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-text-primary mb-2">You're all caught up!</h3>
              <p className="text-text-secondary mb-8">
                There are no more new profiles in your area. Check back later or expand your search preferences.
              </p>
              <Button 
                variant="primary" 
                onClick={() => refetch()}
                isLoading={isFetching}
              >
                <RefreshCcw className="w-4 h-4 mr-2" /> Refresh
              </Button>
            </motion.div>
          )}

          {/* Cards Stack */}
          {recommendationsData?.data?.swipeLimit?.allowed !== false && (
            <div className="absolute inset-0 z-10" style={{ display: 'grid' }}>
              <AnimatePresence>
                {cards.map((user, index) => {
                  const isTop = index === cards.length - 1;
                  // Render only top 3 cards for performance
                  if (index < cards.length - 3) return null;

                  // Scale down cards underneath
                  const scale = isTop ? 1 : 1 - (cards.length - 1 - index) * 0.05;
                  const yOffset = isTop ? 0 : (cards.length - 1 - index) * -15;

                  return (
                    <SwipeCard
                      key={user._id || user.id}
                      user={user}
                      active={isTop}
                      onSwipe={handleSwipe}
                      style={{
                        transform: `scale(${scale}) translateY(${yOffset}px)`,
                        zIndex: index,
                      }}
                    />
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>

      {/* Action Buttons */}
      {recommendationsData?.data?.swipeLimit?.allowed !== false && (
        <div className="flex-shrink-0 p-6 flex justify-center gap-6 z-10 max-w-lg mx-auto w-full pb-safe-bottom mb-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => cards.length > 0 && handleSwipe('left', cards[cards.length - 1])}
            className="w-16 h-16 rounded-full bg-card border border-border shadow-lg flex items-center justify-center text-danger hover:bg-danger/10 transition-colors"
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => cards.length > 0 && handleSwipe('right', cards[cards.length - 1])}
            className="w-16 h-16 rounded-full bg-card border border-border shadow-lg flex items-center justify-center text-success hover:bg-success/10 transition-colors"
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </motion.button>
        </div>
      )}

      <MatchModal
        isOpen={!!matchedUser}
        onClose={handleCloseMatch}
        matchedUser={matchedUser}
        currentUser={currentUser}
        matchId={currentMatchId}
      />
    </div>
  );
};
