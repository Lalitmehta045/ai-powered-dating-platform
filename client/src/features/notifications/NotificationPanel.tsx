import React, { useState, useEffect } from 'react';
import { Bell, Loader2, Heart, MessageCircle, Star, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGetNotificationsQuery, useMarkAsReadMutation } from '../../store/api/notificationApi';
import { socketClient } from '../../socket/socketClient';
import { useDispatch } from 'react-redux';
import { notificationApi } from '../../store/api/notificationApi';
import toast from 'react-hot-toast';

export const NotificationPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { data: response, isLoading, refetch } = useGetNotificationsQuery();
  const [markAsRead] = useMarkAsReadMutation();

  const notifications = response?.data?.notifications || [];
  const unreadCount = response?.data?.unreadCount || 0;

  useEffect(() => {
    const socket = socketClient.getSocket();
    if (socket) {
      const handleNewNotif = (newNotif: any) => {
        dispatch(notificationApi.util.invalidateTags(['Notification']));
        
        // Premium Real-time Toast
        toast.custom((t) => (
          <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-card border border-border shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 p-4`}>
            <div className="flex-1 w-0 p-1">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <img
                    className="h-10 w-10 rounded-full object-cover border-2 border-primary"
                    src={newNotif.sender?.photos?.[0] || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'}
                    alt=""
                  />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-bold text-white">
                    {newNotif.type === 'new_match' ? 'New Match! ❤️' : 'New Interaction ✨'}
                  </p>
                  <p className="mt-1 text-sm text-text-secondary">
                    {newNotif.type === 'profile_like' && `${newNotif.sender?.name || 'Someone'} liked you!`}
                    {newNotif.type === 'new_match' && `You matched with ${newNotif.sender?.name}!`}
                    {newNotif.type === 'new_message' && `New message from ${newNotif.sender?.name}`}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-border">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-primary hover:text-primary-hover focus:outline-none"
              >
                Close
              </button>
            </div>
          </div>
        ), { duration: 4000 });
      };

      socket.on('notification:new', handleNewNotif);
      return () => {
        socket.off('notification:new', handleNewNotif);
      };
    }
  }, [dispatch]);

  const handleNotificationClick = async (notif: any) => {
    if (!notif.isRead) {
      await markAsRead(notif._id);
    }
    setIsOpen(false);

    if (notif.type === 'new_match' || notif.type === 'new_message') {
      const matchId = notif.metadata?.matchId;
      if (matchId) navigate(`/chat/${matchId}`);
      else navigate('/matches');
    } else if (notif.type === 'profile_like') {
      navigate('/premium'); // Likes You is a premium feature
    }
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 84600) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'new_match': return <Heart className="w-4 h-4 text-danger fill-danger" />;
      case 'new_message': return <MessageCircle className="w-4 h-4 text-primary" />;
      case 'profile_like': return <Star className="w-4 h-4 text-warning fill-warning" />;
      default: return <Info className="w-4 h-4 text-text-secondary" />;
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-10 h-10 rounded-full glass flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors"
      >
        <Bell className="w-5 h-5 text-text-primary" />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full border-2 border-background flex items-center justify-center text-[10px] font-bold text-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute -right-12 sm:right-0 mt-4 w-[calc(100vw-32px)] sm:w-80 glass-card rounded-2xl overflow-hidden z-50 border border-border shadow-2xl"
            >
              <div className="p-4 border-b border-border/50 flex justify-between items-center bg-card/80">
                <h3 className="font-bold text-white">Notifications</h3>
                <button onClick={() => refetch()} className="text-xs text-primary hover:text-primary-hover">Refresh</button>
              </div>
              
              <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
                {isLoading ? (
                  <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center text-text-secondary text-sm">No notifications yet.</div>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif._id} 
                      onClick={() => handleNotificationClick(notif)}
                      className={`p-4 border-b border-border/30 transition-colors cursor-pointer flex gap-3 ${!notif.isRead ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-white/5'}`}
                    >
                      <div className="relative flex-shrink-0">
                        <img 
                          src={(notif.sender as any)?.photos?.[0] || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop'} 
                          className="w-10 h-10 rounded-full object-cover border border-border"
                          alt=""
                        />
                        <div className="absolute -bottom-1 -right-1 bg-card rounded-full p-1 border border-border">
                          {getIcon(notif.type)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm mb-1 line-clamp-2 ${notif.isRead ? 'text-text-secondary' : 'text-white font-medium'}`}>
                          {notif.type === 'new_match' && `You and ${(notif.sender as any)?.name || 'someone'} matched!`}
                          {notif.type === 'profile_like' && `${(notif.sender as any)?.name || 'Someone'} liked your profile.`}
                          {notif.type === 'new_message' && `Message from ${(notif.sender as any)?.name || 'someone'}`}
                        </p>
                        <p className="text-[10px] text-text-secondary uppercase tracking-wider">{getRelativeTime(notif.createdAt)}</p>
                      </div>
                      {!notif.isRead && <div className="w-2 h-2 rounded-full bg-primary mt-4 flex-shrink-0" />}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

