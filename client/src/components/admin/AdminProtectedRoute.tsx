import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

export const AdminProtectedRoute = ({ allowedRoles }: { allowedRoles?: string[] }) => {
  const adminAuth = useSelector((state: any) => state.adminAuth);
  const location = useLocation();

  if (!adminAuth) {
    console.error('adminAuth state is missing from Redux store');
    return <Navigate to="/admin/login" replace />;
  }

  const { isAuthenticated, admin, token } = adminAuth;

  if (!token && !isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && admin && !allowedRoles.includes(admin.role)) {
    return <Navigate to="/admin/unauthorized" replace />;
  }

  return <Outlet />;
};
