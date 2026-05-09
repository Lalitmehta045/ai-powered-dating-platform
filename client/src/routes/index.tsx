import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { GuestRoute } from '../components/auth/GuestRoute';
import { AppLayout } from '../layouts/AppLayout';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';
import { FullScreenLoader } from '../components/ui/Skeleton';

// Admin Imports (Eagerly loaded: auth layer only)
import { AdminProtectedRoute } from '../components/admin/AdminProtectedRoute';
import { AdminLayout } from '../layouts/AdminLayout';
import { AdminLogin } from '../pages/admin/AdminLogin';

// Eagerly loaded critical paths
import { Landing } from '../pages/Landing';
import { Login } from '../pages/auth/Login';
import { Register } from '../pages/auth/Register';

// Lazily loaded user routes
const Discover = React.lazy(() => import('../pages/Discover').then(module => ({ default: module.Discover })));
const Matches = React.lazy(() => import('../pages/Matches').then(module => ({ default: module.Matches })));
const Chat = React.lazy(() => import('../pages/Chat').then(module => ({ default: module.Chat })));
const Profile = React.lazy(() => import('../pages/Profile').then(module => ({ default: module.Profile })));
const Premium = React.lazy(() => import('../pages/Premium').then(module => ({ default: module.Premium })));
const Settings = React.lazy(() => import('../pages/Settings').then(module => ({ default: module.Settings })));
const SafetyGuidelines = React.lazy(() => import('../pages/SafetyGuidelines').then(module => ({ default: module.SafetyGuidelines })));
const TermsOfService = React.lazy(() => import('../pages/TermsOfService').then(module => ({ default: module.TermsOfService })));

// Lazily loaded admin routes (code-split from main bundle)
const AdminDashboard = React.lazy(() => import('../pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const UserManagement = React.lazy(() => import('../pages/admin/UserManagement').then(m => ({ default: m.UserManagement })));
const ModerationQueue = React.lazy(() => import('../pages/admin/ModerationQueue').then(m => ({ default: m.ModerationQueue })));
const AIModerationDashboard = React.lazy(() => import('../pages/admin/AIModerationDashboard').then(m => ({ default: m.AIModerationDashboard })));
const PremiumManagement = React.lazy(() => import('../pages/admin/PremiumManagement').then(m => ({ default: m.PremiumManagement })));
const MonitoringDashboard = React.lazy(() => import('../pages/admin/MonitoringDashboard').then(m => ({ default: m.MonitoringDashboard })));
const BroadcastPanel = React.lazy(() => import('../pages/admin/BroadcastPanel').then(m => ({ default: m.BroadcastPanel })));
const AuditLogHistory = React.lazy(() => import('../pages/admin/AuditLogHistory').then(m => ({ default: m.AuditLogHistory })));

const NotFound = () => <div className="p-8 flex items-center justify-center min-h-screen text-2xl font-bold text-white">404 - Not Found</div>;

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

          {/* Admin Routes (Fully code-split) */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route element={<AdminProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/moderation" element={<ModerationQueue />} />
              <Route path="/admin/ai-sentinel" element={<AIModerationDashboard />} />
              <Route path="/admin/premium" element={<PremiumManagement />} />
              <Route path="/admin/monitoring" element={<MonitoringDashboard />} />
              <Route path="/admin/broadcast" element={<BroadcastPanel />} />
              <Route path="/admin/audit-logs" element={<AuditLogHistory />} />
              <Route path="/admin/settings" element={<div className="p-8 text-white font-bold">Admin Settings Placeholder</div>} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};
