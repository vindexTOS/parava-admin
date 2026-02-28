import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuth().isAuthenticated;
  const location = useLocation();

  if (!isAuthenticated) {
    const from = location.pathname + location.search;
    const to = from === '/' ? '/login' : `/login?redirect=${encodeURIComponent(from)}`;
    return <Navigate to={to} replace />;
  }

  return <>{children}</>;
}
