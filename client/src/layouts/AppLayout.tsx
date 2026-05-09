import React, { useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Compass, MessageSquareHeart, Crown, User as UserIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../lib/utils';
import { NotificationPanel } from '../features/notifications/NotificationPanel';

export const AppLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const toastShown = React.useRef(false);

  // Handle post-navigation toasts safely
  useEffect(() => {
    const state = location.state as any;
    if (state?.loginSuccess && !toastShown.current) {
      toast.success('Welcome back!');
      toastShown.current = true;
      navigate(location.pathname, { replace: true, state: {} });
    } else if (state?.registerSuccess && !toastShown.current) {
      toast.success('Account created successfully!');
      toastShown.current = true;
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  // Don't show bottom nav on Chat screen (mobile)
  const isChatPage = location.pathname.startsWith('/chat/');

  const navItems = [
    { icon: Compass, label: 'Discover', path: '/discover' },
    { icon: MessageSquareHeart, label: 'Matches', path: '/matches' },
    { icon: Crown, label: 'Premium', path: '/premium' },
    { icon: UserIcon, label: 'Profile', path: '/profile' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card/50 backdrop-blur-xl h-screen sticky top-0 py-8 px-4 z-40">
        <div className="flex items-center gap-2 px-4 mb-12">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <span className="text-white font-bold text-lg font-accent">H</span>
          </div>
          <span className="text-xl font-bold font-accent tracking-wide text-white">HeartSync</span>
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300",
                isActive 
                  ? "bg-primary/10 text-primary font-semibold" 
                  : "text-text-secondary hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-lg">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="px-4">
          <NotificationPanel />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={cn(
        "flex-1 relative flex flex-col min-h-[100dvh]",
        !isChatPage && "pb-20 md:pb-0" // Add padding on mobile to account for bottom nav
      )}>
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      {!isChatPage && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/50 px-6 py-3 pb-safe-bottom flex items-center justify-between">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex flex-col items-center gap-1 p-2 rounded-xl transition-all",
                isActive ? "text-primary" : "text-text-secondary hover:text-white"
              )}
            >
              <item.icon className={cn("w-6 h-6", item.label === 'Premium' && "text-secondary")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      )}
    </div>
  );
};
