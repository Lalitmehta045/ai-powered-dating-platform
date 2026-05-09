import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import type { User } from '../../store/slices/authSlice';

interface MatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchedUser: User | null;
  currentUser: User | null;
  matchId: string | null;
}

export const MatchModal: React.FC<MatchModalProps> = ({ isOpen, onClose, matchedUser, currentUser, matchId }) => {
  const navigate = useNavigate();

  if (!matchedUser || !currentUser) return null;

  const handleSayHello = () => {
    if (matchId) {
      onClose();
      navigate(`/chat/${matchId}`);
    }
  };

  const defaultImage = "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&q=80&w=600&h=800";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Blurred Backdrop */}
          <div 
            className="absolute inset-0 bg-background/80 backdrop-blur-xl"
            onClick={onClose}
          />

          <motion.div
            className="relative z-10 w-full max-w-md flex flex-col items-center text-center"
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", duration: 0.6, bounce: 0.4 }}
          >
            <h2 className="text-4xl md:text-5xl font-accent font-black italic text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-10 tracking-widest uppercase rotate-[-5deg]">
              It's a Match!
            </h2>

            <p className="text-text-primary text-lg mb-8">
              You and <span className="font-bold text-white">{matchedUser.name}</span> liked each other.
            </p>

            <div className="flex items-center justify-center gap-4 mb-12 relative">
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-background shadow-2xl relative z-10"
              >
                <img src={currentUser.profileImage || defaultImage} alt="You" className="w-full h-full object-cover" />
              </motion.div>

              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-primary flex items-center justify-center z-20 shadow-lg shadow-primary/50">
                <HeartIcon />
              </div>

              <motion.div
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-background shadow-2xl relative z-10"
              >
                <img src={matchedUser.profileImage || defaultImage} alt={matchedUser.name} className="w-full h-full object-cover" />
              </motion.div>
            </div>

            <div className="w-full space-y-4 flex flex-col items-center">
              <Button size="lg" className="w-full max-w-xs rounded-full" onClick={handleSayHello}>
                <MessageCircle className="w-5 h-5 mr-2" />
                Say Hello
              </Button>
              <Button variant="ghost" size="lg" className="w-full max-w-xs rounded-full text-text-secondary hover:text-white" onClick={onClose}>
                Keep Swiping
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// SVG Heart for Match Modal
const HeartIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z"/>
  </svg>
);
