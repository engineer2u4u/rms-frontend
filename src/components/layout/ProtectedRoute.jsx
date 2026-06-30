import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function ProtectedRoute() {
  const { accessToken, isAdmin } = useAuthStore();

  if (!accessToken || isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
