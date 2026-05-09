import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { ArrowLeft, Bell, Lock, LogOut, Moon, Trash2, ChevronRight, Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import type { RootState } from '../store/store';
import { logout, updateUser } from '../store/slices/authSlice';
import { socketClient } from '../socket/socketClient';
import { useUpdateProfileMutation } from '../store/api/profileApi';

export const Settings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();

  const handleLogout = () => {
    dispatch(logout());
    socketClient.disconnect();
    navigate('/login', { state: { logoutSuccess: true } });
  };

  const notificationsEnabled = user?.settings?.notificationsEnabled ?? true;

  const toggleNotifications = async () => {
    const newState = !notificationsEnabled;
    
    // Optimistic update
    dispatch(updateUser({ 
      settings: { ...user?.settings, notificationsEnabled: newState } 
    }));

    try {
      await updateProfile({ 
        settings: { notificationsEnabled: newState } 
      }).unwrap();
      toast.success(`Notifications ${newState ? 'enabled' : 'disabled'}`);
    } catch (err) {
      // Revert on error
      dispatch(updateUser({ 
        settings: { ...user?.settings, notificationsEnabled: !newState } 
      }));
      toast.error('Failed to update settings');
    }
  };

  const settingsGroups = [
    {
      title: 'Account',
      items: [
        { 
          icon: Bell, 
          label: 'Notifications', 
          value: notificationsEnabled ? 'Enabled' : 'Disabled',
          onClick: toggleNotifications,
          isToggle: true,
          active: notificationsEnabled
        },
        { icon: Lock, label: 'Privacy', value: 'Standard' },
        { icon: Moon, label: 'Theme', value: 'Dark' },
      ]
    },
    {
      title: 'Support',
      items: [
        { icon: null, label: 'Help Center', value: '' },
        { icon: null, label: 'Safety Guidelines', value: '' },
        { icon: null, label: 'Terms of Service', value: '' },
      ]
    }
  ];

  return (
    <div className="flex-1 w-full max-w-2xl mx-auto p-4 sm:p-8 flex flex-col pt-safe-top pb-safe-bottom">
      <header className="flex items-center gap-4 mb-8">
        <Link to="/profile" className="p-2 -ml-2 rounded-full hover:bg-white/10 text-text-primary transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-2xl font-bold font-accent text-white">Settings</h1>
      </header>

      <div className="space-y-8">
        {settingsGroups.map((group, idx) => (
          <div key={idx}>
            <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-4 px-2">
              {group.title}
            </h2>
            <div className="glass rounded-2xl overflow-hidden border border-border/50">
              {group.items.map((item, itemIdx) => (
                <div 
                  key={itemIdx}
                  onClick={item.onClick}
                  className="flex items-center justify-between p-4 hover:bg-white/5 cursor-pointer transition-colors border-b border-border/30 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    {item.icon && <item.icon className="w-5 h-5 text-text-primary" />}
                    <span className="text-white font-medium">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {item.isToggle ? (
                      <div className={`w-11 h-6 rounded-full transition-colors relative ${item.active ? 'bg-primary' : 'bg-white/10'}`}>
                        <motion.div 
                          animate={{ x: item.active ? 22 : 2 }}
                          className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-text-secondary">
                        {item.value && <span className="text-sm">{item.value}</span>}
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {/* ... rest of the component remains similar ... */}

        <div>
          <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-4 px-2">
            Danger Zone
          </h2>
          <div className="glass rounded-2xl overflow-hidden border border-border/50">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 p-4 hover:bg-white/5 cursor-pointer transition-colors border-b border-border/30 text-white"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Log Out</span>
            </button>
            <button 
              className="w-full flex items-center gap-3 p-4 hover:bg-danger/10 cursor-pointer transition-colors text-danger"
            >
              <Trash2 className="w-5 h-5" />
              <span className="font-medium">Delete Account</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
