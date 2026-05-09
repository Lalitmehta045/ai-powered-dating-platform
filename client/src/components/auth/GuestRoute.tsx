import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';

export const GuestRoute = () => {
  const { isAuthenticated, token } = useSelector((state: RootState) => state.auth);

  if (isAuthenticated || token) {
    return <Navigate to="/discover" replace />;
  }

  return <Outlet />;
};
