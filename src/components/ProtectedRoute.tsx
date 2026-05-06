import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  allowedType: 'company' | 'employee';
  redirectTo?: string;
}

export function ProtectedRoute({ allowedType, redirectTo = '/login' }: ProtectedRouteProps) {
  const { isAuthenticated, userType } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  if (userType !== allowedType) {
    // Redireciona para o portal correto se autenticado com tipo errado
    return <Navigate to={userType === 'company' ? '/admin/dashboard' : '/ponto'} replace />;
  }

  return <Outlet />;
}
