import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Sparkles, Heart } from 'lucide-react';
import type { User } from '../../store/slices/authSlice';
import { Button } from '../../components/ui/Button';

interface ProfileViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export const ProfileViewModal: React.FC<ProfileViewModalProps> = ({ isOpen, onClose, user }) => {
  if (!user) return null;

  const defaultImage = "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&q=80&w=600&h=800";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-lg bg-card rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden shadow-[0_-20px_50px_rgba(0,0,0,0.5)] border-t border-border sm:border border-border h-[92vh] sm:h-auto sm:max-h-[85vh] flex flex-col"
          >
            {/* Elegant Close Bar (Mobile) */}
            <div className="sm:hidden w-full flex justify-center pt-3 pb-1">
              <div className="w-12 h-1.5 bg-hover rounded-full" />
            </div>

            <div className="overflow-y-auto scrollbar-hide flex-1">
              {/* Premium Hero Section */}
              <div className="relative aspect-[4/5] sm:aspect-square w-full">
                <img 
                  src={user.profileImage || defaultImage} 
                  alt={user.name} 
                  className="w-full h-full object-cover"
                />
                
                {/* Elite Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-black/30" />
                
                {/* Back/Close Button */}
                <button 
                  onClick={onClose}
                  className="absolute top-6 left-6 z-20 w-11 h-11 rounded-full glass flex items-center justify-center text-white hover:bg-white/20 transition-all border border-white/10 shadow-xl"
                >
                  <X className="w-6 h-6" />
                </button>

                <div className="absolute bottom-8 left-8 right-8">
                  <div className="inline-flex items-center gap-2 glass px-3 py-1.5 rounded-full border border-secondary/30 mb-4 shadow-lg">
                    <Heart className="w-4 h-4 text-secondary fill-secondary" />
                    <span className="text-white text-xs font-bold uppercase tracking-wider">Mutual Match</span>
                  </div>
                  
                  <h2 className="text-5xl font-black text-white flex items-center gap-3 drop-shadow-2xl">
                    {user.name} <span className="font-light text-4xl opacity-80">{user.age || 24}</span>
                  </h2>
                </div>
              </div>

              {/* Refined Content Section */}
              <div className="p-8 space-y-8">
                {user.bio && (
                  <div className="space-y-3">
                    <h3 className="text-[11px] font-black text-primary uppercase tracking-[0.2em] opacity-80">About</h3>
                    <p className="text-gray-200 text-lg leading-relaxed font-medium">
                      {user.bio}
                    </p>
                  </div>
                )}

                {user.interests && user.interests.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-[11px] font-black text-primary uppercase tracking-[0.2em] opacity-80">Interests</h3>
                    <div className="flex flex-wrap gap-2.5">
                      {user.interests.map((interest, idx) => (
                        <span 
                          key={idx} 
                          className="px-5 py-2.5 rounded-2xl text-sm font-bold bg-hover/50 border border-border text-text-primary hover:bg-hover transition-colors"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Compatibility Info */}
                <div className="glass p-6 rounded-3xl border border-border bg-gradient-to-br from-white/5 to-transparent">
                  <div className="flex items-center gap-3 mb-2">
                    <Sparkles className="w-5 h-5 text-secondary" />
                    <span className="text-text-primary font-bold">AI Insight</span>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    You both share interests in {user.interests?.slice(0, 2).join(' and ') || 'creative fields'}. Great potential for deep conversation!
                  </p>
                </div>

                <div className="pt-4 pb-10 sm:pb-4">
                  <Button 
                    variant="primary" 
                    className="w-full h-16 rounded-2xl text-lg font-bold shadow-[0_10px_20px_rgba(255,51,102,0.3)] hover:shadow-none transition-all" 
                    onClick={onClose}
                  >
                    Back to Chat
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
