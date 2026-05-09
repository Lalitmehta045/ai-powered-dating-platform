import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { Edit3, Settings as SettingsIcon, Crown, MapPin, Calendar, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

import type { RootState } from '../store/store';
import { Button } from '../components/ui/Button';
import { EditProfileModal } from '../features/profile/EditProfileModal';

export const Profile = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (!user) return null;

  const defaultImage = "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&q=80&w=600&h=800";
  
  // Calculate profile completion
  const completionFields = [user.bio, user.age, user.interests?.length];
  const completionPercentage = Math.round((completionFields.filter(Boolean).length / completionFields.length) * 100);

  return (
    <div className="flex-1 w-full max-w-2xl mx-auto p-4 sm:p-8 flex flex-col pt-safe-top pb-safe-bottom">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold font-accent text-white">Profile</h1>
        <Link to="/settings">
          <div className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-colors">
            <SettingsIcon className="w-5 h-5 text-text-primary" />
          </div>
        </Link>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-3xl overflow-hidden shadow-2xl border border-border/50 relative"
      >
        {/* Header Background */}
        <div className="h-32 bg-gradient-to-r from-primary/40 to-secondary/40 relative">
          {user.isPremium && (
            <div className="absolute top-4 right-4 glass px-3 py-1 rounded-full flex items-center gap-1 text-secondary text-sm font-bold border border-secondary/30">
              <Crown className="w-4 h-4" /> Premium
            </div>
          )}
        </div>

        {/* Profile Info */}
        <div className="px-6 pb-6 relative">
          <div className="flex justify-between items-end -mt-16 mb-4">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-card overflow-hidden bg-background shadow-xl">
                <img src={user.profileImage || defaultImage} alt={user.name} className="w-full h-full object-cover" />
              </div>
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center border-2 border-card shadow-lg hover:bg-primary-hover transition-colors text-white"
              >
                <Edit3 className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-3xl font-bold text-white flex items-center gap-2">
              {user.name} <span className="font-light text-2xl text-text-primary">{user.age || ''}</span>
              {user.isPremium && <Sparkles className="w-5 h-5 text-secondary" />}
            </h2>
            <p className="text-text-secondary">{user.email}</p>
          </div>

          {/* Stats / Completion */}
          <div className="glass rounded-2xl p-4 mb-6 border border-border/30">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-text-primary">Profile Completion</span>
              <span className="text-sm font-bold text-primary">{completionPercentage}%</span>
            </div>
            <div className="w-full h-2 bg-background rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-1000"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            {completionPercentage < 100 && (
              <p className="text-xs text-text-secondary mt-3">
                Complete your profile to get more matches!
              </p>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-2">About Me</h3>
              <p className="text-white text-base leading-relaxed">
                {user.bio || "No bio added yet. Tell people about yourself!"}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-3">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {user.interests && user.interests.length > 0 ? (
                  user.interests.map((interest, idx) => (
                    <span key={idx} className="px-4 py-2 rounded-full text-sm font-medium glass border border-border text-white shadow-sm">
                      {interest}
                    </span>
                  ))
                ) : (
                  <span className="text-text-secondary italic">No interests added.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <EditProfileModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        user={user} 
      />
    </div>
  );
};
