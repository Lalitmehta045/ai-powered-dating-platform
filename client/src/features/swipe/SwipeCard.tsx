import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, useAnimation, type PanInfo } from 'framer-motion';
import { MapPin, Info, Sparkles } from 'lucide-react';
import type { User } from '../../store/slices/authSlice';
import { cn } from '../../lib/utils';

interface SwipeCardProps {
  user: User;
  onSwipe: (direction: 'left' | 'right', user: User) => void;
  active?: boolean;
  style?: React.CSSProperties;
}

export const SwipeCard: React.FC<SwipeCardProps> = ({ user, onSwipe, active = true, style }) => {
  const x = useMotionValue(0);
  const controls = useAnimation();
  const [exitX, setExitX] = useState<number>(0);

  // Map drag value to rotation and opacity for stamp overlays
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const likeOpacity = useTransform(x, [20, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-20, -100], [0, 1]);

  const handleDragEnd = async (event: any, info: PanInfo) => {
    const threshold = 100;
    const velocity = info.velocity.x;
    
    if (info.offset.x > threshold || velocity > 500) {
      setExitX(400);
      onSwipe('right', user);
    } else if (info.offset.x < -threshold || velocity < -500) {
      setExitX(-400);
      onSwipe('left', user);
    } else {
      // Snap back to center
      controls.start({ x: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } });
    }
  };

  const defaultImage = "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&q=80&w=600&h=800"; // Placeholder

  return (
    <motion.div
      className={cn(
        "absolute w-full h-full rounded-3xl overflow-hidden bg-card shadow-2xl border border-border/50",
        active ? "pointer-events-auto" : "pointer-events-none"
      )}
      style={{
        ...style,
        x,
        rotate,
        gridArea: '1 / 1', // Stack them on top of each other
      }}
      drag={active ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={1}
      onDragEnd={handleDragEnd}
      animate={controls}
      exit={{ x: exitX, opacity: 0, transition: { duration: 0.2 } }}
      whileTap={active ? { scale: 0.98 } : {}}
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${user.profileImage || defaultImage})` }}
      />

      {/* Gradient Overlay for Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/90 pointer-events-none" />

      {/* Stamp Overlays */}
      <motion.div
        className="absolute top-12 left-8 border-4 border-success text-success font-black text-5xl px-4 py-2 rounded-xl uppercase tracking-widest origin-center rotate-[-15deg] z-20 pointer-events-none"
        style={{ opacity: likeOpacity }}
      >
        LIKE
      </motion.div>
      <motion.div
        className="absolute top-12 right-8 border-4 border-danger text-danger font-black text-5xl px-4 py-2 rounded-xl uppercase tracking-widest origin-center rotate-[15deg] z-20 pointer-events-none"
        style={{ opacity: nopeOpacity }}
      >
        NOPE
      </motion.div>

      {/* Profile Info */}
      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 text-white pointer-events-none">
        {user.compatibilityScore && (
          <div className="mb-3 inline-flex items-center gap-1.5 glass px-3 py-1.5 rounded-full border border-secondary/30 shadow-lg pointer-events-auto">
            <Sparkles className="w-4 h-4 text-secondary animate-pulse" />
            <span className="text-white text-sm font-bold">{user.compatibilityScore}% Match</span>
          </div>
        )}

        <div className="flex items-end justify-between mb-2">
          <div className="flex flex-col">
            <h2 className="text-3xl sm:text-4xl font-bold font-accent drop-shadow-md flex items-center gap-2">
              {user.name} <span className="font-light text-2xl sm:text-3xl">{user.age || 24}</span>
              {user.isPremium && (
                <Sparkles className="w-5 h-5 text-secondary animate-pulse" />
              )}
            </h2>
          </div>
          <div className="w-10 h-10 rounded-full glass flex items-center justify-center pointer-events-auto cursor-pointer hover:bg-white/20 transition-colors">
            <Info className="w-5 h-5 text-white" />
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-200 mb-4 drop-shadow-sm">
          <MapPin className="w-4 h-4" />
          <span>2 miles away</span>
        </div>

        {user.bio && (
          <p className="text-sm sm:text-base text-gray-200 line-clamp-2 mb-4 drop-shadow-sm">
            {user.bio}
          </p>
        )}

        {/* Interests Tags */}
        <div className="flex flex-wrap gap-2">
          {user.interests?.slice(0, 3).map((interest, idx) => (
            <span 
              key={idx}
              className="px-3 py-1 rounded-full text-xs font-medium glass border border-white/20 text-white shadow-sm"
            >
              {interest}
            </span>
          ))}
          {user.interests && user.interests.length > 3 && (
            <span className="px-3 py-1 rounded-full text-xs font-medium glass border border-white/20 text-white shadow-sm">
              +{user.interests.length - 3}
            </span>
          )}
        </div>

        {user.matchReason && (
          <div className="mt-4 text-xs font-medium text-secondary/90 flex items-center gap-2 drop-shadow-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
            {user.matchReason}
          </div>
        )}
      </div>
    </motion.div>
  );
};
