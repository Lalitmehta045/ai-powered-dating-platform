import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import { useGetCurrentUserQuery } from '../../store/api/authApi';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { socketClient } from '../../socket/socketClient';

export const ProtectedRoute = () => {
  const { isAuthenticated, token, user } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  // If we have a token but no user, try to fetch the user
  const { isLoading } = useGetCurrentUserQuery(undefined, {
    skip: !token || !!user, // Skip if no token, or user is already loaded
  });

  useEffect(() => {
    if (isAuthenticated && token) {
      socketClient.connect();
    }
    return () => {
      // Disconnect handled by logout explicitly, or we can leave it connected while on protected routes
    };
  }, [isAuthenticated, token]);

  if (!token && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  // We have a token but fetching the user failed? The query will handle auth error if unauthenticated,
  // but if we reach here and still no user but not loading, it might be an error state. 
  // However, `useGetCurrentUserQuery` will usually trigger logout via error handling middleware if 401.
  
  return <Outlet />;
};
