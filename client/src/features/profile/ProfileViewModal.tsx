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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-card rounded-3xl overflow-hidden shadow-2xl border border-border/50 max-h-[90vh] flex flex-col"
          >
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/40 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="overflow-y-auto scrollbar-hide">
              {/* Image Section */}
              <div className="relative aspect-[3/4] w-full">
                <img 
                  src={user.profileImage || defaultImage} 
                  alt={user.name} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                
                <div className="absolute bottom-6 left-6 right-6">
                  <h2 className="text-4xl font-bold text-white flex items-center gap-3">
                    {user.name} <span className="font-light text-3xl">{user.age || 24}</span>
                    {user.isPremium && <Sparkles className="w-6 h-6 text-secondary animate-pulse" />}
                  </h2>
                  <div className="flex items-center gap-2 text-gray-300 mt-2">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">Matched with you ❤️</span>
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6 space-y-6">
                {user.bio && (
                  <div>
                    <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-2">About</h3>
                    <p className="text-white text-base leading-relaxed">
                      {user.bio}
                    </p>
                  </div>
                )}

                {user.interests && user.interests.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-3">Interests</h3>
                    <div className="flex flex-wrap gap-2">
                      {user.interests.map((interest, idx) => (
                        <span 
                          key={idx} 
                          className="px-4 py-2 rounded-full text-sm font-medium glass border border-border text-white"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 flex gap-4">
                  <Button variant="primary" className="flex-1" onClick={onClose}>
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
