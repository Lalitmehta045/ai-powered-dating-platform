import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { GuestRoute } from '../components/auth/GuestRoute';
import { AppLayout } from '../layouts/AppLayout';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';
import { FullScreenLoader } from '../components/ui/Skeleton';

// Eagerly loaded critical paths
import { Landing } from '../pages/Landing';
import { Login } from '../pages/auth/Login';
import { Register } from '../pages/auth/Register';

// Lazily loaded routes
const Discover = React.lazy(() => import('../pages/Discover').then(module => ({ default: module.Discover })));
const Matches = React.lazy(() => import('../pages/Matches').then(module => ({ default: module.Matches })));
const Chat = React.lazy(() => import('../pages/Chat').then(module => ({ default: module.Chat })));
const Profile = React.lazy(() => import('../pages/Profile').then(module => ({ default: module.Profile })));
const Premium = React.lazy(() => import('../pages/Premium').then(module => ({ default: module.Premium })));
const Settings = React.lazy(() => import('../pages/Settings').then(module => ({ default: module.Settings })));
const SafetyGuidelines = React.lazy(() => import('../pages/SafetyGuidelines').then(module => ({ default: module.SafetyGuidelines })));
const TermsOfService = React.lazy(() => import('../pages/TermsOfService').then(module => ({ default: module.TermsOfService })));
import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { socketClient } from '../socket/socketClient';


const NotFound = () => <div className="p-8 flex items-center justify-center min-h-screen text-2xl font-bold">404 - Not Found</div>;

export const AppRoutes = () => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<FullScreenLoader />}>
        <Routes>
      {/* Public / Guest Routes */}
      <Route element={<GuestRoute />}>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/discover" element={<Discover />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/chat/:userId" element={<Chat />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/premium" element={<Premium />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/safety" element={<SafetyGuidelines />} />
          <Route path="/settings/terms" element={<TermsOfService />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};
